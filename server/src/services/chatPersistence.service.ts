import { ChatModel } from "../models/chat.model";

export const chatPersistenceService = {

    async createChat(
        userId: string,
        title = "New Chat",
    ) {
        // Now includes userId when creating the document
        return ChatModel.create({
            userId,
            title,
            messages: [],
        });
    },

    async getChats(userId: string) {
        // Only fetch chats belonging to this user
        return ChatModel.find({ userId })
            .sort({
                updatedAt: -1,
            });
    },

    async getChatById(
        userId: string,
        chatId: string,
    ) {
        // Secure fetch: must match both chat ID and user ID
        return ChatModel.findOne({
            _id: chatId,
            userId,
        });
    },

    async deleteChat(
        userId: string,
        chatId: string,
    ) {
        // Secure delete
        return ChatModel.findOneAndDelete({
            _id: chatId,
            userId,
        });
    },

    async addMessage(
        userId: string,
        chatId: string,

        role:
            | "user"
            | "assistant",

        content: string,
    ) {
        // Secure update
        return ChatModel.findOneAndUpdate(
            { _id: chatId, userId },
            {
                $push: {
                    messages: {
                        role,
                        content,
                    },
                },
            },
            {
                returnDocument: 'after'
            },
        );
    },

    async updateTitle(
        userId: string,
        chatId: string,
        title: string,
    ) {
        // Secure update
        return ChatModel.findOneAndUpdate(
            { _id: chatId, userId },
            {
                title,
            },
            {
                returnDocument: 'after'
            },
        );
    },
};