// src/lib/ai/chunker.ts

import type {
    ChunkOptions,
    ChunkMetadata,
    TextChunk,
} from '../../types/pdf.types';

const DEFAULT_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 150;

// ─────────────────────────────────────────────
// Page marker helpers
// ─────────────────────────────────────────────

function extractPageMarkers(
    text: string,
): Array<{
    page: number;
    startIndex: number;
}> {
    const markers: Array<{
        page: number;
        startIndex: number;
    }> = [];

    const regex =
        /\[page[:\s]*(\d+)\]/gi;

    let match: RegExpExecArray | null;

    while (
        (match = regex.exec(text)) !==
        null
    ) {
        markers.push({
            page: parseInt(match[1], 10),
            startIndex: match.index,
        });
    }

    return markers;
}

function resolvePageInfo(
    offset: number,
    markers: Array<{
        page: number;
        startIndex: number;
    }>,
): string | null {
    if (markers.length === 0) {
        return null;
    }

    let currentPage =
        markers[0].page;

    for (const marker of markers) {
        if (
            marker.startIndex <= offset
        ) {
            currentPage = marker.page;
        } else {
            break;
        }
    }

    return `page ${currentPage}`;
}

// ─────────────────────────────────────────────
// Split point logic
// ─────────────────────────────────────────────

function findSplitPoint(
    text: string,
    from: number,
    maxEnd: number,
): number {
    const sub =
        text.slice(from, maxEnd);

    // Prefer paragraph breaks
    const paragraphBreak =
        sub.lastIndexOf('\n\n');

    if (paragraphBreak > 0) {
        return (
            from +
            paragraphBreak +
            2
        );
    }

    // Prefer sentence endings
    const sentenceMatches = [
        ...sub.matchAll(
            /[.!?]\s+[A-Z]/g,
        ),
    ];

    if (sentenceMatches.length > 0) {
        const lastMatch =
            sentenceMatches[
            sentenceMatches.length - 1
            ];

        if (
            lastMatch.index !== undefined
        ) {
            return (
                from +
                lastMatch.index +
                2
            );
        }
    }

    // Fallback to whitespace
    const lastSpace =
        sub.lastIndexOf(' ');

    if (lastSpace > 0) {
        return from + lastSpace;
    }

    // Hard split fallback
    return maxEnd;
}

// ─────────────────────────────────────────────
// Main chunker
// ─────────────────────────────────────────────

export function chunkText(
    text: string,
    source: string,
    options: ChunkOptions = {},
): TextChunk[] {
    if (!text.trim()) {
        return [];
    }

    const chunkSize =
        options.chunkSize ??
        DEFAULT_CHUNK_SIZE;

    const overlap =
        options.overlap ??
        DEFAULT_OVERLAP;

    if (overlap >= chunkSize) {
        throw new Error(
            `overlap (${overlap}) must be smaller than chunkSize (${chunkSize})`,
        );
    }

    const pageMarkers =
        extractPageMarkers(text);

    const createdAt =
        new Date().toISOString();

    const chunks: TextChunk[] =
        [];

    let cursor = 0;
    let chunkIndex = 0;

    while (cursor < text.length) {
        const maxEnd = Math.min(
            cursor + chunkSize,
            text.length,
        );

        const splitAt =
            maxEnd < text.length
                ? findSplitPoint(
                    text,
                    cursor,
                    maxEnd,
                )
                : maxEnd;

        const slice = text
            .slice(cursor, splitAt)
            .trim();

        if (slice.length > 0) {
            const metadata: ChunkMetadata =
            {
                chunkId: `${source}-chunk-${chunkIndex}`,
                source,
                chunkIndex,
                pageInfo:
                    resolvePageInfo(
                        cursor,
                        pageMarkers,
                    ),
                createdAt,
            };

            chunks.push({
                text: slice,
                metadata,
            });

            chunkIndex++;
        }

        // Stop safely
        if (splitAt >= text.length) {
            break;
        }

        // Advance cursor correctly
        const nextCursor =
            splitAt - overlap;

        if (nextCursor <= cursor) {
            cursor = splitAt;
        } else {
            cursor = nextCursor;
        }
    }

    return chunks;
}