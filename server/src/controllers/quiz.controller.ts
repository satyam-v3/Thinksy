import type {
    Request,
    Response,
} from "express";

import { z } from "zod";

import { ApiError } from "../utils/ApiError";

import { retrieveRelevantChunks } from "../lib/vectorstore/retrieval";

import {
    generateQuiz,
} from "../services/quiz.service";

const quizSchema =
    z.object({
        topic:
            z.string()
                .trim()
                .min(1),

        count:
            z.coerce
                .number()
                .int()
                .min(1)
                .max(30)
                .optional(),

        activeDocs:
            z.array(
                z.string(),
            ).optional(),
    });

export const quizController = {
    generate: async (
        req: Request,
        res: Response,
    ): Promise<void> => {

        const parsed =
            quizSchema.safeParse(
                req.body,
            );

        if (!parsed.success) {
            throw ApiError.badRequest(
                "Invalid quiz payload",
                parsed.error.flatten(),
            );
        }

        const retrieval =
            await retrieveRelevantChunks({
                question:
                    parsed.data.topic,

                topK: 10,

                activeDocs:
                    parsed.data.activeDocs,
            });

        const context =
            retrieval.matches
                .map(
                    (m) => m.text,
                )
                .join("\n\n");

        const questions =
            await generateQuiz(
                context,
                parsed.data.count ??
                10,
            );

        res.status(200).json({
            questions,
        });
    },
};