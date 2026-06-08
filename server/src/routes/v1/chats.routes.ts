import { Router } from "express";

import {
    chatPersistenceController,
} from "../../controllers/chatPersistence.controller";

import {
    asyncHandler,
} from "../../middleware/asyncHandler";

import {
    requireAuth
} from "../../middleware/auth"; // Import the auth middleware

export const chatsRouter =
    Router();

// Inject requireAuth before the controller on every single route
chatsRouter.post("/", requireAuth, asyncHandler(
    chatPersistenceController.createChat,));

chatsRouter.get("/", requireAuth, asyncHandler(
    chatPersistenceController.getChats,));

chatsRouter.get("/:id", requireAuth, asyncHandler(
    chatPersistenceController.getChatById,));

chatsRouter.delete("/:id", requireAuth, asyncHandler(
    chatPersistenceController.deleteChat,));

chatsRouter.post("/:id/messages", requireAuth, asyncHandler(
    chatPersistenceController.addMessage,));

chatsRouter.patch("/:id/title", requireAuth, asyncHandler(
    chatPersistenceController.updateTitle,));