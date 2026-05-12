import type { Chat, UploadedDoc } from "./types";

const CHATS_KEY = "thinksy:chats:v1";
const DOCS_KEY = "thinksy:docs:v1";
const ACTIVE_KEY = "thinksy:activeChat:v1";
const THEME_KEY = "thinksy:theme:v1";

export const storage = {
    loadChats(): Chat[] {
        try {
            const raw = localStorage.getItem(CHATS_KEY);

            return raw
                ? (JSON.parse(raw) as Chat[])
                : [];
        } catch {
            return [];
        }
    },

    saveChats(chats: Chat[]) {
        try {
            localStorage.setItem(
                CHATS_KEY,
                JSON.stringify(chats)
            );
        } catch {
            /* ignore quota */
        }
    },

    loadDocs(): UploadedDoc[] {
        try {
            const raw = localStorage.getItem(DOCS_KEY);

            return raw
                ? (JSON.parse(raw) as UploadedDoc[])
                : [];
        } catch {
            return [];
        }
    },

    saveDocs(docs: UploadedDoc[]) {
        try {
            localStorage.setItem(
                DOCS_KEY,
                JSON.stringify(docs)
            );
        } catch {
            /* ignore */
        }
    },

    getActiveChatId(): string | null {
        return localStorage.getItem(ACTIVE_KEY);
    },

    setActiveChatId(id: string | null) {
        if (id) {
            localStorage.setItem(ACTIVE_KEY, id);
        } else {
            localStorage.removeItem(ACTIVE_KEY);
        }
    },

    getTheme(): "light" | "dark" | null {
        const v = localStorage.getItem(THEME_KEY);

        return v === "light" || v === "dark"
            ? v
            : null;
    },

    setTheme(t: "light" | "dark") {
        localStorage.setItem(THEME_KEY, t);
    },
};