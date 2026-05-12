import { useState } from "react";

import {
    FileText,
    MessageSquare,
    PanelLeftClose,
    PanelLeftOpen,
    Plus,
    Trash2,
    X,
} from "lucide-react";

import type {
    Chat,
    UploadedDoc,
} from "../lib/types";

import {
    cn,
    formatBytes,
    formatDay,
    truncate,
} from "../lib/utils";

import { PdfUpload } from "./PdfUpload";

import { ThemeToggle } from "./ThemeToggle";

interface Props {
    chats: Chat[];

    activeId: string | null;

    onSelect: (
        id: string
    ) => void;

    onNew: () => void;

    onDelete: (
        id: string
    ) => void;

    docs: UploadedDoc[];

    onDocsChange: (
        docs: UploadedDoc[]
    ) => void;

    open: boolean;

    setOpen: (
        v: boolean
    ) => void;
}

export function Sidebar({
    chats,
    activeId,
    onSelect,
    onNew,
    onDelete,
    docs,
    onDocsChange,
    open,
    setOpen,
}: Props) {
    const [hovered, setHovered] =
        useState<string | null>(null);

    const removeDoc = (id: string) => {
        onDocsChange(
            docs.filter(
                (d) => d.id !== id
            )
        );
    };

    return (
        <>
            {/* Mobile backdrop */}

            <div
                className={cn(
                    "fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden",

                    open
                        ? "opacity-100"
                        : "pointer-events-none opacity-0"
                )}
                onClick={() =>
                    setOpen(false)
                }
            />

            <aside
                data-testid="sidebar"
                className={cn(
                    "fixed inset-y-0 left-0 z-40 flex w-[300px] flex-col border-r border-border bg-surface transition-transform duration-200 lg:relative lg:translate-x-0",

                    open
                        ? "translate-x-0"
                        : "-translate-x-full"
                )}
            >
                {/* Header */}

                <div className="flex items-center justify-between px-4 pb-3 pt-4">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fg text-bg">
                            <span className="font-display text-lg leading-none">
                                T
                            </span>
                        </div>

                        <div>
                            <div className="font-display text-lg leading-none">
                                Thinksy
                            </div>

                            <div className="text-[10px] uppercase tracking-wider text-muted">
                                Chat with PDFs
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() =>
                            setOpen(false)
                        }
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface2 hover:text-fg lg:hidden"
                        aria-label="Close sidebar"
                    >
                        <X className="h-4 w-4" />
                    </button>

                    <button
                        onClick={() =>
                            setOpen(false)
                        }
                        className="hidden h-8 w-8 items-center justify-center rounded-md text-muted hover:bg-surface2 hover:text-fg lg:inline-flex"
                        aria-label="Collapse sidebar"
                        data-testid="sidebar-collapse-btn"
                    >
                        <PanelLeftClose className="h-4 w-4" />
                    </button>
                </div>

                {/* New chat */}

                <div className="px-3">
                    <button
                        data-testid="new-chat-btn"
                        onClick={onNew}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-bg px-3 py-2.5 text-sm font-medium text-fg transition-colors hover:border-fg/40 hover:bg-surface2"
                    >
                        <Plus className="h-4 w-4" />

                        New chat
                    </button>
                </div>

                {/* PDF Upload */}

                <div className="px-3 pt-3">
                    <PdfUpload
                        onUploaded={(d) =>
                            onDocsChange([
                                d,
                                ...docs,
                            ])
                        }
                    />
                </div>

                {/* Docs */}

                {docs.length > 0 && (
                    <div className="px-3 pt-4">
                        <div className="mb-2 flex items-center justify-between px-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                                Documents
                            </span>

                            <span className="text-[10px] text-muted">
                                {docs.length}
                            </span>
                        </div>

                        <div
                            data-testid="docs-list"
                            className="max-h-[160px] space-y-1 overflow-y-auto"
                        >
                            {docs.map((d) => (
                                <div
                                    key={d.id}
                                    className="group flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-surface2"
                                    data-testid={`doc-item-${d.id}`}
                                >
                                    <FileText className="h-3.5 w-3.5 shrink-0 text-accent" />

                                    <div className="min-w-0 flex-1">
                                        <div className="truncate text-xs text-fg">
                                            {d.filename}
                                        </div>

                                        <div className="text-[10px] text-muted">
                                            {formatBytes(
                                                d.size
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            removeDoc(
                                                d.id
                                            )
                                        }
                                        className="opacity-0 transition-opacity group-hover:opacity-100"
                                        aria-label="Remove doc"
                                    >
                                        <X className="h-3.5 w-3.5 text-muted hover:text-fg" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Chats */}

                <div className="mt-4 flex-1 overflow-y-auto px-3 pb-3">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                            History
                        </span>

                        <span className="text-[10px] text-muted">
                            {chats.length}
                        </span>
                    </div>

                    {chats.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted">
                            No chats yet. Start a
                            new conversation.
                        </div>
                    ) : (
                        <div
                            className="space-y-0.5"
                            data-testid="chats-list"
                        >
                            {chats.map((c) => (
                                <div
                                    key={c.id}
                                    data-testid={`chat-item-${c.id}`}
                                    onClick={() =>
                                        onSelect(c.id)
                                    }
                                    onMouseEnter={() =>
                                        setHovered(c.id)
                                    }
                                    onMouseLeave={() =>
                                        setHovered(null)
                                    }
                                    className={cn(
                                        "group flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors",

                                        c.id === activeId
                                            ? "bg-surface2 text-fg"
                                            : "text-fg/80 hover:bg-surface2"
                                    )}
                                >
                                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted" />

                                    <div className="min-w-0 flex-1">
                                        <div className="text-[13px] truncate">
                                            {truncate(
                                                c.title ||
                                                "Untitled",
                                                38
                                            )}
                                        </div>

                                        <div className="text-[10px] text-muted">
                                            {formatDay(
                                                c.updatedAt
                                            )}{" "}
                                            ·{" "}
                                            {
                                                c.messages
                                                    .length
                                            }{" "}
                                            msg
                                        </div>
                                    </div>

                                    {hovered ===
                                        c.id && (
                                            <button
                                                onClick={(
                                                    e
                                                ) => {
                                                    e.stopPropagation();

                                                    onDelete(
                                                        c.id
                                                    );
                                                }}
                                                className="text-muted hover:text-red-500"
                                                aria-label="Delete chat"
                                                data-testid={`delete-chat-${c.id}`}
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}

                <div className="flex items-center justify-between border-t border-border px-3 py-3">
                    <div className="text-[11px] text-muted">
                        <span className="font-display text-fg">
                            Thinksy
                        </span>{" "}
                        v1.0
                    </div>

                    <ThemeToggle />
                </div>
            </aside>

            {/* Collapsed re-open button */}

            {!open && (
                <button
                    onClick={() =>
                        setOpen(true)
                    }
                    data-testid="sidebar-open-btn"
                    className="fixed left-3 top-3 z-30 hidden h-9 w-9 items-center justify-center rounded-md border border-border bg-surface text-fg hover:bg-surface2 lg:inline-flex"
                    aria-label="Open sidebar"
                >
                    <PanelLeftOpen className="h-4 w-4" />
                </button>
            )}
        </>
    );
}