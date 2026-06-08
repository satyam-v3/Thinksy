import { useEffect, useState } from "react";
import { ChevronDown, ExternalLink, FileText, Hash } from "lucide-react";
import type { Source } from "../lib/types";
import { cn, truncate } from "../lib/utils";
import { storage } from "../lib/storage"; // 👈 Import storage to lookup the Cloudinary URL

interface Props {
    source: Source;
    index: number;
    onOpenPdf?: (pdfUrl: string) => void;
}

function pageLabel(p: Source["pageInfo"]): string | null {
    if (p == null) return null;
    if (typeof p === "string" || typeof p === "number") return String(p);
    if (typeof p === "object" && "page" in p && p.page != null) return String(p.page);
    return null;
}

// 👈 Helper to clean up "thinksy_pdfs/178095281-IoT_Trail" into "IoT_Trail.pdf"
function cleanDisplayName(rawName: string): string {
    let name = rawName;

    // 1. Remove Cloudinary folder path
    if (name.includes('/')) name = name.split('/').pop() || name;

    // 2. Remove Multer timestamp prefix
    const parts = name.split('-');
    if (parts.length > 1 && /^\d+$/.test(parts[0])) {
        name = parts.slice(1).join('-');
    }

    // 3. Ensure it has a PDF extension for visual consistency
    if (!name.toLowerCase().endsWith('.pdf') && !name.startsWith('Source')) {
        name += '.pdf';
    }
    return name;
}

export function SourceCard({ source, index, onOpenPdf }: Props) {
    const [open, setOpen] = useState(false);
    const [highlighted, setHighlighted] = useState(false);

    // Apply the clean up helper to the raw name
    const rawName = (source.originalName as string) || (source.source as string) || `Source ${index + 1}`;
    const name = cleanDisplayName(rawName);

    const content = (source.text as string) || (source.content as string) || "";
    const page = pageLabel(source.pageInfo);

    const similarity = typeof source.similarity === "number"
        ? `${Math.round(source.similarity * 100)}%`
        : null;

    const chunkId = source.chunkId as string | undefined;

    // 👈 Look up the Cloudinary URL directly from your local storage state
    const docs = storage.loadDocs();
    const matchedDoc = docs.find(d => d.storedFilename === source.source || d.filename === source.source);
    const pdfUrl = matchedDoc?.url || null;

    useEffect(() => {
        const element = document.getElementById(`source-${index + 1}`);
        if (!element) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries[0]?.isIntersecting;
                if (visible && element.dataset.highlight === "true") {
                    setHighlighted(true);
                    element.dataset.highlight = "false";
                    setTimeout(() => setHighlighted(false), 2000);
                }
            },
            { threshold: 0.5 }
        );

        observer.observe(element);
        return () => observer.disconnect();
    }, [index]);

    return (
        <div
            id={`source-${index + 1}`}
            data-testid={`source-card-${index}`}
            className={cn(
                "card overflow-hidden transition-all duration-500 hover:border-fg/30",
                highlighted && "border-accent ring-2 ring-accent shadow-lg shadow-accent/20"
            )}
        >
            <button
                onClick={() => setOpen((v) => !v)}
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

                        {pdfUrl && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (pdfUrl && onOpenPdf) {
                                        onOpenPdf(pdfUrl);
                                    }
                                }}
                                className="chip cursor-pointer hover:border-fg/30 hover:text-fg transition-colors"
                            >
                                <ExternalLink className="h-3 w-3" />
                                open pdf
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