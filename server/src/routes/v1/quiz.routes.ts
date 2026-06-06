import { Router } from "express";

import { quizController } from "../../controllers/quiz.controller";

import { asyncHandler } from "../../middleware/asyncHandler";

export const quizRouter =
    Router();

quizRouter.post(
    "/generate",
    asyncHandler(
        quizController.generate,
    ),
);