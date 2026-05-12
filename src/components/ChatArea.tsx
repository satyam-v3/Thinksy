import {
    useEffect,
    useRef,
} from "react";

import {
    BookOpen,
    FileQuestion,
    Lightbulb,
    Menu,
    Sparkles,
} from "lucide-react";

import type {
    Chat,
    Message,
} from "../lib/types";

import { ChatInput } from "./ChatInput";

import { MessageBubble } from "./MessageBubble";

import { PdfUpload } from "./PdfUpload";

interface Props {
    chat: Chat | null;

    onSend: (
        text: string
    ) => void;

    onOpenSidebar: () => void;

    loading: boolean;
}

const SUGGESTIONS = [
    {
        icon: FileQuestion,

        title:
            "Summarise the document",

        prompt:
            "Give me a concise summary of the uploaded document.",
    },

    {
        icon: Lightbulb,

        title: "Key takeaways",

        prompt:
            "What are the 5 most important takeaways from this PDF?",
    },

    {
        icon: BookOpen,

        title:
            "Explain like I'm new",

        prompt:
            "Explain the main concepts in this document for a beginner.",
    },
];

function EmptyState({
    onPick,
}: {
    onPick: (p: string) => void;
}) {
    return (
        <div className="flex h-full flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15 text-accent">
                <Sparkles className="h-6 w-6" />
            </div>

            <h1 className="font-display text-4xl text-fg sm:text-5xl lg:text-6xl">
                Read smarter,{" "}

                <span className="italic text-accent">
                    think clearer.
                </span>
            </h1>

            <p className="mt-3 max-w-md text-sm text-muted">
                Upload a PDF and ask
                anything. Thinksy answers
                with grounded sources
                from your documents.
            </p>

            <div className="mt-8 w-full max-w-md">
                <PdfUpload />
            </div>

            <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-2 sm:grid-cols-3">
                {SUGGESTIONS.map((s) => (
                    <button
                        key={s.title}
                        data-testid={`suggestion-${s.title
                            .replace(/\s+/g, "-")
                            .toLowerCase()}`}
                        onClick={() =>
                            onPick(s.prompt)
                        }
                        className="group flex flex-col items-start gap-1.5 rounded-xl border border-border bg-surface p-3 text-left transition-colors hover:border-fg/40 hover:bg-surface2"
                    >
                        <s.icon className="h-4 w-4 text-accent" />

                        <div className="text-sm font-medium text-fg">
                            {s.title}
                        </div>

                        <div className="text-xs text-muted">
                            {s.prompt}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}

export function ChatArea({
    chat,
    onSend,
    onOpenSidebar,
    loading,
}: Props) {
    const scrollRef =
        useRef<HTMLDivElement>(null);

    const messages: Message[] =
        chat?.messages ?? [];

    useEffect(() => {
        const el = scrollRef.current;

        if (!el) {
            return;
        }

        el.scrollTo({
            top: el.scrollHeight,
            behavior: "smooth",
        });
    }, [
        messages.length,
        messages[
            messages.length - 1
        ]?.content,
    ]);

    return (
        <div className="flex h-full min-w-0 flex-1 flex-col bg-bg">
            {/* Top bar */}

            <div className="flex items-center justify-between border-b border-border bg-bg/80 px-4 py-3 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <button
                        data-testid="open-sidebar-mobile-btn"
                        onClick={
                            onOpenSidebar
                        }
                        className="inline-flex h-9 w-9 items-center justify-center rounded-md text-fg hover:bg-surface2 lg:hidden"
                        aria-label="Open sidebar"
                    >
                        <Menu className="h-5 w-5" />
                    </button>

                    <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-fg">
                            {chat?.title ||
                                "New chat"}
                        </div>

                        <div className="text-[11px] text-muted">
                            {messages.length}{" "}
                            message
                            {messages.length === 1
                                ? ""
                                : "s"}
                        </div>
                    </div>
                </div>

                <PdfUpload compact />
            </div>

            {/* Messages */}

            <div
                ref={scrollRef}
                data-testid="messages-scroll"
                className="flex-1 overflow-y-auto"
            >
                {messages.length === 0 ? (
                    <EmptyState
                        onPick={onSend}
                    />
                ) : (
                    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 sm:px-6">
                        {messages.map((m) => (
                            <MessageBubble
                                key={m.id}
                                message={m}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Input */}

            <div className="border-t border-border bg-bg/80 px-4 py-3 backdrop-blur-md sm:px-6">
                <div className="mx-auto w-full max-w-3xl">
                    <ChatInput
                        onSend={onSend}
                        disabled={loading}
                        placeholder={
                            chat &&
                                chat.messages
                                    .length > 0
                                ? "Ask a follow-up…"
                                : "Ask anything about your PDFs…"
                        }
                    />
                </div>
            </div>
        </div>
    );
}