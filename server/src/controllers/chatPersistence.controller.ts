import type {
    Request,
    Response,
} from "express";

import { ApiError } from "../utils/ApiError";

import {
    chatPersistenceService,
} from "../services/chatPersistence.service";

export const chatPersistenceController = {

    createChat: async (
        _req: Request,
        res: Response,
    ) => {

        const chat =
            await chatPersistenceService.createChat();

        res.status(201).json(chat);
    },

    getChats: async (
        _req: Request,
        res: Response,
    ) => {

        const chats =
            await chatPersistenceService.getChats();

        res.json(chats);
    },

    getChatById: async (
        req: Request,
        res: Response,
    ) => {

        const chat =
            await chatPersistenceService.getChatById(
                req.params.id,
            );

        if (!chat) {
            throw ApiError.notFound(
                "Chat not found",
            );
        }

        res.json(chat);
    },

    deleteChat: async (
        req: Request,
        res: Response,
    ) => {

        await chatPersistenceService.deleteChat(
            req.params.id,
        );

        res.status(204).send();
    },

    addMessage: async (
        req: Request,
        res: Response,
    ) => {

        const {
            role,
            content,
        } = req.body;

        if (
            !role ||
            !content
        ) {
            throw ApiError.badRequest(
                "role and content are required",
            );
        }

        const chat =
            await chatPersistenceService.addMessage(
                req.params.id,
                role,
                content,
            );

        if (!chat) {
            throw ApiError.notFound(
                "Chat not found",
            );
        }

        res.json(chat);
    },

    updateTitle: async (
        req: Request,
        res: Response,
    ) => {

        const { title } =
            req.body;

        if (!title) {
            throw ApiError.badRequest(
                "title is required",
            );
        }

        const chat =
            await chatPersistenceService.updateTitle(
                req.params.id,
                title,
            );

        if (!chat) {
            throw ApiError.notFound(
                "Chat not found",
            );
        }

        res.json(chat);
    },
};