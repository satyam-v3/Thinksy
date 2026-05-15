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

export interface UploadResponse {
    [k: string]: unknown;
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
        "pdf",
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
    const response =
        await fetch(
            `${BASE_URL}/chat/stream`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json",
                },

                body: JSON.stringify({
                    query:
                        payload.query,

                    question:
                        payload.query,

                    history:
                        payload.history ??
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

export { BASE_URL };