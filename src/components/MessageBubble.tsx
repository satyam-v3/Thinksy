import { useState } from "react";

import type {
    CSSProperties,
    FC,
    ReactNode,
} from "react";

import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

import {
    Prism as SyntaxHighlighterRaw,
} from "react-syntax-highlighter";

import {
    oneDark,
    oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

import {
    AlertCircle,
    Check,
    Copy,
    Sparkles,
    User,
} from "lucide-react";

import type { Message } from "../lib/types";

import { SourceCard } from "./SourceCard";

import { useTheme } from "../hooks/useTheme";

import {
    cn,
    formatTime,
} from "../lib/utils";

const SyntaxHighlighter =
    SyntaxHighlighterRaw as unknown as FC<{
        language?: string;

        style?: unknown;

        PreTag?: string;

        customStyle?: CSSProperties;

        children?: ReactNode;
    }>;

interface Props {
    message: Message;
}

function TypingDots() {
    return (
        <div
            data-testid="typing-indicator"
            className="flex items-center gap-1 py-1"
        >
            <span className="h-2 w-2 animate-bounce-dot rounded-full bg-fg/60" />

            <span
                className="h-2 w-2 animate-bounce-dot rounded-full bg-fg/60"
                style={{
                    animationDelay: "0.15s",
                }}
            />

            <span
                className="h-2 w-2 animate-bounce-dot rounded-full bg-fg/60"
                style={{
                    animationDelay: "0.3s",
                }}
            />
        </div>
    );
}

export function MessageBubble({
    message,
}: Props) {
    const { theme } = useTheme();

    const isUser =
        message.role === "user";

    const [copied, setCopied] =
        useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(
                message.content
            );

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1200);
        } catch {
            /* ignore */
        }
    };

    return (
        <div
            data-testid={`message-${message.role}`}
            className={cn(
                "flex w-full gap-3 animate-fade-up",

                isUser
                    ? "justify-end"
                    : "justify-start"
            )}
        >
            {!isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-bg">
                    <Sparkles className="h-4 w-4" />
                </div>
            )}

            <div
                className={cn(
                    "group flex max-w-[85%] flex-col gap-2 sm:max-w-[78%]",

                    isUser
                        ? "items-end"
                        : "items-start"
                )}
            >
                <div
                    className={cn(
                        "relative rounded-2xl px-4 py-3 text-[15px] leading-relaxed",

                        isUser
                            ? "rounded-br-sm bg-fg text-bg"
                            : "rounded-bl-sm border border-border bg-surface"
                    )}
                >
                    {message.pending &&
                        !message.content ? (
                        <TypingDots />
                    ) : message.error ? (
                        <div className="flex items-start gap-2 text-sm text-red-500">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                            <span>
                                {message.error}
                            </span>
                        </div>
                    ) : isUser ? (
                        <p className="whitespace-pre-wrap">
                            {message.content}
                        </p>
                    ) : (
                        <div className="prose-thinksy text-[15px]">
                            <ReactMarkdown
                                remarkPlugins={[
                                    remarkGfm,
                                ]}
                                components={{
                                    code({
                                        className,
                                        children,
                                        ...props
                                    }) {
                                        const match =
                                            /language-(\w+)/.exec(
                                                className || ""
                                            );

                                        const text =
                                            String(children).replace(
                                                /\n$/,
                                                ""
                                            );

                                        const isInline =
                                            !match &&
                                            !text.includes("\n");

                                        return !isInline &&
                                            match ? (
                                            <SyntaxHighlighter
                                                language={
                                                    match[1]
                                                }
                                                style={
                                                    theme ===
                                                        "dark"
                                                        ? oneDark
                                                        : oneLight
                                                }
                                                PreTag="div"
                                                customStyle={{
                                                    margin: 0,
                                                    borderRadius: 12,
                                                    padding:
                                                        "14px 16px",
                                                    fontSize: 13,
                                                }}
                                            >
                                                {text}
                                            </SyntaxHighlighter>
                                        ) : (
                                            <code
                                                className={
                                                    className
                                                }
                                                {...props}
                                            >
                                                {children}
                                            </code>
                                        );
                                    },
                                }}
                            >
                                {message.content || ""}
                            </ReactMarkdown>
                        </div>
                    )}
                </div>

                {!isUser &&
                    message.sources &&
                    message.sources.length >
                    0 && (
                        <div
                            data-testid="sources-list"
                            className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2"
                        >
                            {message.sources.map(
                                (s, i) => (
                                    <SourceCard
                                        key={
                                            (s.chunkId as string) ||
                                            `${i}-${s.source || "src"}`
                                        }
                                        source={s}
                                        index={i}
                                    />
                                )
                            )}
                        </div>
                    )}

                <div
                    className={cn(
                        "flex items-center gap-2 text-[11px] text-muted opacity-0 transition-opacity group-hover:opacity-100",

                        isUser
                            ? "flex-row-reverse"
                            : "flex-row"
                    )}
                >
                    <span>
                        {formatTime(
                            message.createdAt
                        )}
                    </span>

                    {!isUser &&
                        !message.pending &&
                        message.content && (
                            <button
                                onClick={copy}
                                data-testid="copy-message-btn"
                                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 hover:bg-surface2 hover:text-fg"
                            >
                                {copied ? (
                                    <>
                                        <Check className="h-3 w-3" />
                                        Copied
                                    </>
                                ) : (
                                    <>
                                        <Copy className="h-3 w-3" />
                                        Copy
                                    </>
                                )}
                            </button>
                        )}
                </div>
            </div>

            {isUser && (
                <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface2 text-fg">
                    <User className="h-4 w-4" />
                </div>
            )}
        </div>
    );
}