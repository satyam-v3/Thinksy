import { Router } from "express";

import {
    chatPersistenceController,
} from "../../controllers/chatPersistence.controller";

import {
    asyncHandler,
} from "../../middleware/asyncHandler";

export const chatsRouter =
    Router();

chatsRouter.post("/", asyncHandler(
    chatPersistenceController.createChat,));

chatsRouter.get("/", asyncHandler(
    chatPersistenceController.getChats,));

chatsRouter.get("/:id", asyncHandler(
    chatPersistenceController.getChatById,));

chatsRouter.delete("/:id", asyncHandler(
    chatPersistenceController.deleteChat,));

chatsRouter.post("/:id/messages", asyncHandler(
    chatPersistenceController.addMessage,));

chatsRouter.patch("/:id/title", asyncHandler(
    chatPersistenceController.updateTitle,));