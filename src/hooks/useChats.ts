import {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";

import { v4 as uuid } from "uuid";

import type { Chat, Message } from "../lib/types";

import { storage } from "../lib/storage";

export function useChats() {
    const [chats, setChats] = useState<Chat[]>(
        () => storage.loadChats()
    );

    const [activeId, setActiveId] = useState<string | null>(
        () => storage.getActiveChatId()
    );

    useEffect(() => {
        storage.saveChats(chats);
    }, [chats]);

    useEffect(() => {
        storage.setActiveChatId(activeId);
    }, [activeId]);

    const activeChat = useMemo(
        () =>
            chats.find((c) => c.id === activeId) ||
            null,

        [chats, activeId]
    );

    const newChat = useCallback((): Chat => {
        const chat: Chat = {
            id: uuid(),

            title: "New chat",

            messages: [],

            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        setChats((prev) => [chat, ...prev]);

        setActiveId(chat.id);

        return chat;
    }, []);

    const ensureActive = useCallback((): Chat => {
        if (activeChat) {
            return activeChat;
        }

        return newChat();
    }, [activeChat, newChat]);

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
        (chatId: string) => {
            setChats((prev) =>
                prev.filter((c) => c.id !== chatId)
            );

            if (activeId === chatId) {
                setActiveId(null);
            }
        },

        [activeId]
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