import {
    useEffect,
    useRef,
    useState,
} from "react";

import type { KeyboardEvent } from "react";

import {
    ArrowUp,
    Square,
} from "lucide-react";

import { cn } from "../lib/utils";

interface Props {
    onSend: (text: string) => void;

    disabled?: boolean;

    isStreaming?: boolean;

    placeholder?: string;
}

export function ChatInput({
    onSend,
    disabled,
    isStreaming,
    placeholder,
}: Props) {
    const [value, setValue] =
        useState("");

    const ref =
        useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = ref.current;

        if (!el) {
            return;
        }

        el.style.height = "auto";

        el.style.height =
            Math.min(el.scrollHeight, 200) +
            "px";
    }, [value]);

    const submit = () => {
        const t = value.trim();

        if (!t || disabled) {
            return;
        }

        onSend(t);

        setValue("");
    };

    const onKey = (
        e: KeyboardEvent<HTMLTextAreaElement>
    ) => {
        if (
            e.key === "Enter" &&
            !e.shiftKey
        ) {
            e.preventDefault();

            submit();
        }
    };

    return (
        <div className="relative w-full">
            <div
                className={cn(
                    "flex items-end gap-2 rounded-2xl border border-border bg-surface px-3 py-2.5 shadow-sm transition-shadow",

                    "focus-within:border-fg/40 focus-within:shadow-md"
                )}
            >
                <textarea
                    ref={ref}
                    data-testid="chat-input-textarea"
                    value={value}
                    onChange={(e) =>
                        setValue(e.target.value)
                    }
                    onKeyDown={onKey}
                    rows={1}
                    placeholder={
                        placeholder ||
                        "Ask anything about your PDFs…"
                    }
                    disabled={disabled}
                    className="max-h-[200px] min-h-[28px] flex-1 resize-none bg-transparent text-[15px] leading-6 text-fg outline-none placeholder:text-muted/80 disabled:opacity-50"
                />

                <button
                    data-testid="send-message-btn"
                    onClick={submit}
                    disabled={
                        disabled ||
                        !value.trim()
                    }
                    aria-label="Send message"
                    className={cn(
                        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all",

                        value.trim() &&
                            !disabled
                            ? "bg-fg text-bg hover:scale-105"
                            : "cursor-not-allowed bg-surface2 text-muted"
                    )}
                >
                    {isStreaming ? (
                        <Square className="h-4 w-4" />
                    ) : (
                        <ArrowUp className="h-4 w-4" />
                    )}
                </button>
            </div>

            <div className="mt-2 px-1 text-[11px] text-muted">
                Press{" "}

                <kbd className="rounded bg-surface2 px-1 py-0.5 font-mono">
                    Enter
                </kbd>

                {" "}to send ·{" "}

                <kbd className="rounded bg-surface2 px-1 py-0.5 font-mono">
                    Shift + Enter
                </kbd>

                {" "}for new line
            </div>
        </div>
    );
}