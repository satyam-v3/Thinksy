import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

export function formatBytes(bytes?: number): string {
    if (!bytes && bytes !== 0) return "";

    if (bytes < 1024) {
        return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function formatTime(ts: number): string {
    const d = new Date(ts);

    return d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    });
}

export function formatDay(ts: number): string {
    const d = new Date(ts);

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
        return "Today";
    }

    if (d.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    return d.toLocaleDateString([], {
        month: "short",
        day: "numeric",
    });
}

export function truncate(s: string, n: number) {
    if (!s) return "";

    return s.length > n
        ? `${s.slice(0, n - 1)}…`
        : s;
}