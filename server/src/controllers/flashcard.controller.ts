import type {
    Request,
    Response,
} from "express";

import { z } from "zod";

import { ApiError } from "../utils/ApiError";

import { retrieveRelevantChunks } from "../lib/vectorstore/retrieval";

import {
    generateFlashcards,
} from "../services/flashcard.service";

const flashcardSchema =
    z.object({
        topic:
            z.string()
                .trim()
                .min(
                    1,
                    "Topic is required",
                ),

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

export const flashcardController = {
    generate: async (
        req: Request,
        res: Response,
    ): Promise<void> => {
        const parsed =
            flashcardSchema.safeParse(
                req.body,
            );

        if (!parsed.success) {
            throw ApiError.badRequest(
                "Invalid flashcard payload",
                parsed.error.flatten(),
            );
        }

        // ////////////////////////////////
        console.log("ACTIVE DOCS:");
        console.log(parsed.data.activeDocs);
        // ////////////////////////////////

        const retrieval =
            await retrieveRelevantChunks({
                question:
                    parsed.data.topic,

                topK: 10,

                activeDocs:
                    parsed.data
                        .activeDocs,

            });

        // ////////////////////////////////
        console.log("MATCH COUNT:");
        console.log(retrieval.matches.length,);
        // ////////////////////////////////

        const context =
            retrieval.matches
                .map(
                    (m) => m.text,
                )
                .join("\n\n");

        const flashcards =
            await generateFlashcards(
                context,
                parsed.data.count ??
                10,
            );

        res.status(200).json({
            flashcards,
        });
    },
};