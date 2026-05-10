import type { Request, Response } from 'express';
import { z } from 'zod';

import { chatService } from '../services/chat.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';

const chatQuerySchema = z.object({
  question: z.string().trim().min(1, 'Question is required'),
  topK: z.coerce.number().int().min(1).max(20).optional(),
});

export const chatController = {
  query: async (req: Request, res: Response): Promise<void> => {
    const parsed = chatQuerySchema.safeParse(req.body);
    if (!parsed.success) {
      throw ApiError.badRequest('Invalid chat query payload', parsed.error.flatten());
    }

    const result = await chatService.queryKnowledgeBase(parsed.data);
    res.status(200).json(ApiResponse.success(result));
  },
  debugVectors: async (_req: Request, res: Response): Promise<void> => {
    const result = await chatService.debugVectors();

    res.status(200).json(ApiResponse.success(result));
  },
};