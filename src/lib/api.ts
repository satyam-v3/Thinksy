import axios, { AxiosError } from "axios";

import type { Source } from "./types";

const BASE_URL: string =
    (
        import.meta.env
            .VITE_BACKEND_URL as
        | string
        | undefined
    )?.replace(/\/$/, "") ||
    "http://localhost:4000/api/v1";

export const api = axios.create({
    baseURL: BASE_URL,

    timeout: 120_000,
});

// ─────────────────────────────────────────────
// AUTHENTICATION INTERCEPTOR
// Automatically attaches the JWT to every Axios request
// ─────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("thinksy_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface UploadResponse {
    success: boolean;

    data: {
        filename: string;
        originalName: string;
        storedFilename?: string;
        url?: string;
        size?: number;
    };
}

export interface ChatQueryResponse {
    answer?: string;

    response?: string;

    result?: string;

    message?: string;

    sources?: Source[];

    [k: string]: unknown;
}

export interface StreamChunk {
    token?: string;

    done?: boolean;

    error?: string;

    sources?: Source[];
}

/**
 * Normalize backend answer shape.
 */

export function extractAnswer(
    data: ChatQueryResponse,
): string {
    return (
        data.answer ||
        data.response ||
        data.result ||
        data.message ||
        (typeof data === "string"
            ? (data as unknown as string)
            : "") ||
        ""
    );
}

/**
 * Upload PDF.
 */

export async function uploadPdf(
    file: File,

    onProgress?: (
        pct: number,
    ) => void,
): Promise<UploadResponse> {
    const form =
        new FormData();

    form.append(
        "pdf", // Make sure this matches the field name expected by Multer
        file,
    );

    const { data } =
        await api.post<UploadResponse>(
            "/pdf/upload",

            form,

            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },

                onUploadProgress: (
                    e,
                ) => {
                    if (
                        e.total &&
                        onProgress
                    ) {
                        onProgress(
                            Math.round(
                                (e.loaded /
                                    e.total) *
                                100,
                            ),
                        );
                    }
                },
            },
        );

    return data;
}

/**
 * Standard non-stream chat.
 */

export async function sendChatQuery(
    payload: {
        query: string;

        activeDocs?: string[];

        history?: {
            role: string;

            content: string;
        }[];
    },
): Promise<ChatQueryResponse> {
    const { data } =
        await api.post<ChatQueryResponse>(
            "/chat/query",

            {
                query:
                    payload.query,

                question:
                    payload.query,

                message:
                    payload.query,

                history:
                    payload.history ??
                    [],

                activeDocs:
                    payload.activeDocs ??
                    [],
            },
        );

    return data;
}

/**
 * Streaming SSE chat.
 */

export async function streamChatQuery(
    payload: {
        query: string;

        activeDocs?: string[];

        history?: {
            role: string;

            content: string;
        }[];
    },

    handlers: {
        onToken?: (
            token: string,
        ) => void;

        onDone?: (
            sources?: Source[],
        ) => void;

        onError?: (
            error: string,
        ) => void;
    },
): Promise<void> {
    // Grab the token manually since fetch doesn't use the Axios interceptor
    const token = localStorage.getItem("thinksy_token");

    const response =
        await fetch(
            `${BASE_URL}/chat/stream`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },

                body: JSON.stringify({
                    query:
                        payload.query,

                    question:
                        payload.query,

                    history:
                        payload.history ??
                        [],

                    activeDocs:
                        payload.activeDocs ??
                        [],
                }),
            },
        );

    if (!response.ok) {
        throw new Error(
            `Streaming failed (${response.status})`,
        );
    }

    if (!response.body) {
        throw new Error(
            "Streaming unsupported",
        );
    }

    const reader =
        response.body.getReader();

    const decoder =
        new TextDecoder();

    let buffer = "";

    try {
        while (true) {
            const {
                done,
                value,
            } =
                await reader.read();

            if (done) {
                break;
            }

            buffer +=
                decoder.decode(
                    value,
                    {
                        stream: true,
                    },
                );

            const events =
                buffer.split(
                    "\n\n",
                );

            buffer =
                events.pop() || "";

            for (const event of events) {
                const line =
                    event.trim();

                if (
                    !line.startsWith(
                        "data:",
                    )
                ) {
                    continue;
                }

                const raw =
                    line.replace(
                        /^data:\s*/,
                        "",
                    );

                if (!raw) {
                    continue;
                }

                let data: StreamChunk;

                try {
                    data =
                        JSON.parse(
                            raw,
                        );
                } catch {
                    console.warn(
                        "Invalid SSE JSON:",
                        raw,
                    );

                    continue;
                }

                if (
                    data.error
                ) {
                    handlers.onError?.(
                        data.error,
                    );

                    throw new Error(
                        data.error,
                    );
                }

                if (
                    data.token
                ) {
                    handlers.onToken?.(
                        data.token,
                    );
                }

                if (
                    data.done
                ) {
                    handlers.onDone?.(
                        data.sources,
                    );
                }
            }
        }

        /**
         * Flush remaining decoder buffer.
         */

        buffer +=
            decoder.decode();

    } finally {
        reader.releaseLock();
    }
}

/**
 * Human-readable error extraction.
 */

export function describeError(
    e: unknown,
): string {
    const err =
        e as AxiosError<{
            detail?: string;

            message?: string;
        }>;

    if (
        err?.response?.data
    ) {
        const d =
            err.response.data;

        return (
            d.detail ||
            d.message ||
            `Request failed (${err.response.status})`
        );
    }

    if (
        err instanceof Error
    ) {
        return err.message;
    }

    return "Something went wrong.";
}

// ─────────────────────────────────────────────
// CHAT PERSISTENCE API
// ─────────────────────────────────────────────

export async function createChat() {
    const { data } =
        await api.post("/chats");

    return data;
}

export async function getChats() {
    const { data } =
        await api.get("/chats");

    return data;
}

export async function getChat(
    id: string,
) {
    const { data } =
        await api.get(
            `/chats/${id}`,
        );

    return data;
}

export async function deleteChat(
    id: string,
) {
    await api.delete(
        `/chats/${id}`,
    );
}

export async function addMessage(
    chatId: string,
    role:
        | "user"
        | "assistant",
    content: string,
) {
    const { data } =
        await api.post(
            `/chats/${chatId}/messages`,
            {
                role,
                content,
            },
        );

    return data;
}

export async function updateChatTitle(
    chatId: string,
    title: string,
) {
    const { data } =
        await api.patch(
            `/chats/${chatId}/title`,
            {
                title,
            },
        );

    return data;
}

export async function deleteChatApi(
    id: string,
) {
    await api.delete(
        `/chats/${id}`,
    );
}

// ─────────────────────────────────────────────
// AUTHENTICATION API
// ─────────────────────────────────────────────

export const authApi = {
    login: async (credentials: { email: string; password?: string }) => {
        // NOTE: Adjust the /auth/login path if your backend uses a different route name
        const { data } = await api.post('/auth/login', credentials);
        return data;
    },
    register: async (credentials: { email: string; name?: string; password?: string }) => {
        // NOTE: Adjust the /auth/register path if your backend uses a different route name
        const { data } = await api.post('/auth/register', credentials);
        return data;
    }
};

export { BASE_URL };