import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import type { Chat, Message } from "../lib/types";

import { storage } from "../lib/storage";

import {
    createChat,
    getChats,
    deleteChatApi,
} from "../lib/api";

export function useChats() {
    const [chats, setChats] =
        useState<Chat[]>([]);

    const [activeId, setActiveId] = useState<string | null>(
        () => storage.getActiveChatId()
    );

    useEffect(() => {
        async function loadChats() {
            try {
                const mongoChats =
                    await getChats();

                const mappedChats =
                    mongoChats.map(
                        (chat: any) => ({
                            id: chat._id,

                            title: chat.title,

                            messages:
                                chat.messages ?? [],

                            createdAt:
                                new Date(
                                    chat.createdAt,
                                ).getTime(),

                            updatedAt:
                                new Date(
                                    chat.updatedAt,
                                ).getTime(),
                        }),
                    );

                setChats(
                    mappedChats,
                );
            } catch (error) {
                console.error(
                    "Failed to load chats",
                    error,
                );
            }
        }

        loadChats();
    }, []);

    useEffect(() => {
        storage.setActiveChatId(activeId);
    }, [activeId]);

    const activeChat = useMemo(
        () =>
            chats.find((c) => c.id === activeId) ||
            null,

        [chats, activeId]
    );

    const newChat = useCallback(
        async (): Promise<Chat> => {

            const mongoChat =
                await createChat();

            const chat: Chat = {
                id:
                    mongoChat._id,

                title:
                    mongoChat.title,

                messages: [],

                createdAt:
                    Date.now(),

                updatedAt:
                    Date.now(),
            };

            setChats(
                (prev) => [
                    chat,
                    ...prev,
                ],
            );

            setActiveId(
                chat.id,
            );

            return chat;
        },
        [],
    );

    const ensureActive = useCallback(
        async (): Promise<Chat> => {

            if (
                activeChat
            ) {
                return activeChat;
            }

            return await newChat();
        },
        [
            activeChat,
            newChat,
        ],
    );

    const appendMessage = useCallback(
        (
            chatId: string,
            message: Message
        ) => {
            setChats((prev) =>
                prev.map((c) =>
                    c.id === chatId
                        ? {
                            ...c,

                            messages: [
                                ...c.messages,
                                message,
                            ],

                            updatedAt: Date.now(),

                            title:
                                c.messages.length === 0 &&
                                    message.role === "user"
                                    ? message.content.slice(0, 60)
                                    : c.title,
                        }
                        : c
                )
            );
        },

        []
    );

    const updateMessage = useCallback(
        (
            chatId: string,
            messageId: string,
            patch: Partial<Message>
        ) => {
            setChats((prev) =>
                prev.map((c) =>
                    c.id === chatId
                        ? {
                            ...c,

                            updatedAt: Date.now(),

                            messages: c.messages.map((m) =>
                                m.id === messageId
                                    ? {
                                        ...m,
                                        ...patch,
                                    }
                                    : m
                            ),
                        }
                        : c
                )
            );
        },

        []
    );

    const deleteChat = useCallback(
        async (
            chatId: string,
        ) => {

            await deleteChatApi(
                chatId,
            );

            setChats(
                (prev) =>
                    prev.filter(
                        (c) =>
                            c.id !== chatId,
                    ),
            );

            if (
                activeId === chatId
            ) {
                setActiveId(
                    null,
                );
            }
        },
        [activeId],
    );

    const renameChat = useCallback(
        (
            chatId: string,
            title: string
        ) => {
            setChats((prev) =>
                prev.map((c) =>
                    c.id === chatId
                        ? {
                            ...c,
                            title,
                        }
                        : c
                )
            );
        },

        []
    );

    const clearAll = useCallback(() => {
        setChats([]);

        setActiveId(null);
    }, []);

    return {
        chats,

        activeChat,

        activeId,
        setActiveId,

        newChat,
        ensureActive,

        appendMessage,
        updateMessage,

        deleteChat,
        renameChat,

        clearAll,
    };
}