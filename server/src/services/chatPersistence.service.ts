import { ChatModel } from "../models/chat.model";

export const chatPersistenceService = {

    async createChat(
        title = "New Chat",
    ) {
        return ChatModel.create({
            title,
            messages: [],
        });
    },

    async getChats() {
        return ChatModel.find()
            .sort({
                updatedAt: -1,
            });
    },

    async getChatById(
        chatId: string,
    ) {
        return ChatModel.findById(
            chatId,
        );
    },

    async deleteChat(
        chatId: string,
    ) {
        return ChatModel.findByIdAndDelete(
            chatId,
        );
    },

    async addMessage(
        chatId: string,

        role:
            | "user"
            | "assistant",

        content: string,
    ) {
        return ChatModel.findByIdAndUpdate(
            chatId,
            {
                $push: {
                    messages: {
                        role,
                        content,
                    },
                },
            },
            {
                new: true,
            },
        );
    },

    async updateTitle(
        chatId: string,
        title: string,
    ) {
        return ChatModel.findByIdAndUpdate(
            chatId,
            {
                title,
            },
            {
                new: true,
            },
        );
    },
};