import type { Response } from "express";
import { ApiError } from "../utils/ApiError";
import { chatPersistenceService } from "../services/chatPersistence.service";
import type { AuthRequest } from "../middleware/auth";

export const chatPersistenceController = {

    createChat: async (
        req: AuthRequest,
        res: Response,
    ) => {
        const userId = req.user?.id;
        if (!userId) throw ApiError.badRequest("Authentication required.");

        const chat = await chatPersistenceService.createChat(userId);
        res.status(201).json(chat);
    },

    getChats: async (
        req: AuthRequest,
        res: Response,
    ) => {
        const userId = req.user?.id;
        if (!userId) throw ApiError.badRequest("Authentication required.");

        const chats = await chatPersistenceService.getChats(userId);
        res.json(chats);
    },

    getChatById: async (
        req: AuthRequest,
        res: Response,
    ) => {
        const userId = req.user?.id;
        if (!userId) throw ApiError.badRequest("Authentication required.");

        const chat = await chatPersistenceService.getChatById(userId, req.params.id);

        if (!chat) {
            throw ApiError.notFound("Chat not found");
        }
        res.json(chat);
    },

    deleteChat: async (
        req: AuthRequest,
        res: Response,
    ) => {
        const userId = req.user?.id;
        if (!userId) throw ApiError.badRequest("Authentication required.");

        await chatPersistenceService.deleteChat(userId, req.params.id);
        res.status(204).send();
    },

    addMessage: async (
        req: AuthRequest,
        res: Response,
    ) => {
        const userId = req.user?.id;
        if (!userId) throw ApiError.badRequest("Authentication required.");

        const { role, content } = req.body;

        if (!role || !content) {
            throw ApiError.badRequest("role and content are required");
        }

        const chat = await chatPersistenceService.addMessage(
            userId,
            req.params.id,
            role,
            content,
        );

        if (!chat) {
            throw ApiError.notFound("Chat not found");
        }
        res.json(chat);
    },

    updateTitle: async (
        req: AuthRequest,
        res: Response,
    ) => {
        const userId = req.user?.id;
        if (!userId) throw ApiError.badRequest("Authentication required.");

        const { title } = req.body;

        if (!title) {
            throw ApiError.badRequest("title is required");
        }

        const chat = await chatPersistenceService.updateTitle(
            userId,
            req.params.id,
            title,
        );

        if (!chat) {
            throw ApiError.notFound("Chat not found");
        }
        res.json(chat);
    },
};