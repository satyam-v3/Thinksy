import { Router } from "express";

import { asyncHandler } from "../../middleware/asyncHandler";

import { flashcardController } from "../../controllers/flashcard.controller";

export const flashcardRouter =
    Router();

flashcardRouter.post(
    "/generate",
    asyncHandler(
        flashcardController.generate,
    ),
);