import type { Response } from 'express';
import { z } from 'zod';

import { chatService } from '../services/chat.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import type { AuthRequest } from '../middleware/auth';

const chatQuerySchema =
  z.object({
    question:
      z.string()
        .trim()
        .min(
          1,
          'Question is required',
        ),

    topK:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(20)
        .optional(),

    activeDocs:
      z.array(
        z.string(),
      ).optional(),

    history:
      z.array(
        z.object({
          role:
            z.enum([
              'user',
              'assistant',
            ]),

          content:
            z.string(),
        }),
      ).optional(),
  });

export const chatController = {
  query: async (req: AuthRequest, res: Response): Promise<void> => {
    const parsed = chatQuerySchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid chat query payload', parsed.error.flatten());
    }

    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.badRequest('User context is missing. Authentication required.');
    }

    // Merge userId into the service payload for vector isolation
    const result = await chatService.queryKnowledgeBase({
      ...parsed.data,
      userId,
    });

    res.status(200).json({
      answer: result.answer,
      sources: result.sources,
    });
  },

  stream: async (
    req: AuthRequest,
    res: Response,
  ): Promise<void> => {
    const parsed =
      chatQuerySchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      throw ApiError.badRequest(
        'Invalid chat query payload',
        parsed.error.flatten(),
      );
    }

    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.badRequest('User context is missing. Authentication required.');
    }

    res.setHeader(
      'Content-Type',
      'text/event-stream',
    );

    res.setHeader(
      'Cache-Control',
      'no-cache',
    );

    res.setHeader(
      'Connection',
      'keep-alive',
    );

    // Merge userId into the service payload for vector isolation
    const result =
      await chatService.streamKnowledgeBase(
        { ...parsed.data, userId },
        (token) => {
          res.write(
            `data: ${JSON.stringify({
              token,
            })}\n\n`,
          );
        },
      );

    res.write(
      `data: ${JSON.stringify({
        done: true,

        sources:
          result.sources,
      })}\n\n`,
    );

    res.end();
  },

  debugVectors: async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    if (!userId) {
      throw ApiError.badRequest('User context is missing. Authentication required.');
    }

    // Pass userId so you only debug vectors for the authenticated user
    const result = await chatService.debugVectors(userId);

    res.status(200).json(ApiResponse.success(result));
  },
};