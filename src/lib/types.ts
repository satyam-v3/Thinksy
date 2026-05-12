export type Role = "user" | "assistant";

/**
 * Flexible source shape — backend can expand fields later.
 */

export interface Source {
    source?: string;
    chunkId?: string;
    content?: string;
    score?: number;

    pageInfo?:
    | string
    | number
    | {
        page?: number;
        [key: string]: unknown;
    };

    [key: string]: unknown;
}

export interface Message {
    id: string;
    role: Role;
    content: string;

    sources?: Source[];

    createdAt: number;

    pending?: boolean;
    error?: string;
}

export interface Chat {
    id: string;
    title: string;

    messages: Message[];

    createdAt: number;
    updatedAt: number;
}

export interface UploadedDoc {
    id: string;
    filename: string;

    uploadedAt: number;

    size?: number;
    response?: unknown;
}