import axios, { AxiosError } from "axios";

import type { Source } from "./types";

const BASE_URL: string =
    (import.meta.env.VITE_BACKEND_URL as string | undefined)?.replace(/\/$/, "") ||
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

/**
 * Normalise different possible answer keys into a single string.
 */

export function extractAnswer(data: ChatQueryResponse): string {
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

export async function uploadPdf(
    file: File,
    onProgress?: (pct: number) => void
): Promise<UploadResponse> {
    const form = new FormData();

    form.append("pdf", file);

    const { data } = await api.post<UploadResponse>(
        "/pdf/upload",
        form,
        {
            headers: {
                "Content-Type": "multipart/form-data",
            },

            onUploadProgress: (e) => {
                if (e.total && onProgress) {
                    onProgress(
                        Math.round((e.loaded / e.total) * 100)
                    );
                }
            },
        }
    );

    return data;
}

export async function sendChatQuery(payload: {
    query: string;

    history?: {
        role: string;
        content: string;
    }[];
}): Promise<ChatQueryResponse> {
    const { data } = await api.post<ChatQueryResponse>(
        "/chat/query",
        {
            query: payload.query,

            // common alternative keys
            question: payload.query,
            message: payload.query,

            history: payload.history ?? [],
        }
    );

    return data;
}

export function describeError(e: unknown): string {
    const err =
        e as AxiosError<{
            detail?: string;
            message?: string;
        }>;

    if (err?.response?.data) {
        const d = err.response.data;

        return (
            d.detail ||
            d.message ||
            `Request failed (${err.response.status})`
        );
    }

    if (err?.message) {
        return err.message;
    }

    return "Something went wrong.";
}

export { BASE_URL };