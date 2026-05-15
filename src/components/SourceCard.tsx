import { useState } from "react";

import {
    ChevronDown,
    FileText,
    Hash,
} from "lucide-react";

import type { Source } from "../lib/types";

import {
    cn,
    truncate,
} from "../lib/utils";

interface Props {
    source: Source;
    index: number;
}

function pageLabel(
    p: Source["pageInfo"]
): string | null {
    if (p == null) {
        return null;
    }

    if (
        typeof p === "string" ||
        typeof p === "number"
    ) {
        return String(p);
    }

    if (
        typeof p === "object" &&
        "page" in p &&
        p.page != null
    ) {
        return String(p.page);
    }

    return null;
}

export function SourceCard({
    source,
    index,
}: Props) {
    const [open, setOpen] = useState(false);

    const name =
        (source.source as string) ||
        (source.filename as string) ||
        `Source ${index + 1}`;

    const content =
        (source.text as string) ||
        (source.content as string) ||
        "";

    const page = pageLabel(source.pageInfo);

    const similarity =
        typeof source.similarity ===
            "number"
            ? `${Math.round(
                source.similarity * 100
            )}%`
            : null;

    const chunkId =
        source.chunkId as string | undefined;

    return (
        <div
            data-testid={`source-card-${index}`}
            className="card overflow-hidden transition-colors hover:border-fg/30"
        >
            <button
                onClick={() =>
                    setOpen((v) => !v)
                }
                className="flex w-full items-start gap-3 px-3.5 py-3 text-left"
            >
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-accent/15 text-accent">
                    <FileText className="h-3.5 w-3.5" />
                </div>

                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-muted">
                            [{index + 1}]
                        </span>

                        <span className="truncate text-sm font-medium text-fg">
                            {truncate(name, 64)}
                        </span>

                        {source.chunkIndex != null && (
                            <span className="ml-2 text-[10px] text-muted">
                                chunk {source.chunkIndex}
                            </span>
                        )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        {page && (
                            <span className="chip">
                                <Hash className="h-3 w-3" />
                                page {page}
                            </span>
                        )}

                        {similarity && (
                            <span className="chip">
                                🎯 {similarity} match
                            </span>
                        )}

                        {chunkId && (
                            <span className="chip font-mono">
                                {truncate(chunkId, 14)}
                            </span>
                        )}
                    </div>

                    {content && !open && (
                        <p className="mt-2 line-clamp-2 text-xs text-muted">
                            {truncate(content, 220)}
                        </p>
                    )}
                </div>

                <ChevronDown
                    className={cn(
                        "mt-1 h-4 w-4 shrink-0 text-muted transition-transform",
                        open && "rotate-180"
                    )}
                />
            </button>

            {open && content && (
                <div className="border-t border-border bg-surface2/50 px-3.5 py-3">
                    <p className="whitespace-pre-wrap text-xs leading-relaxed text-fg/90">
                        {content}
                    </p>
                </div>
            )}
        </div>
    );
}