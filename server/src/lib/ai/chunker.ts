// src/lib/ai/chunker.ts
// Splits cleaned text into overlapping chunks.
// Respects sentence / paragraph boundaries so
// every chunk stays semantically self-contained.

import type { ChunkOptions, ChunkMetadata, TextChunk } from '../../types/pdf.types';

const DEFAULT_CHUNK_SIZE = 1000; // characters
const DEFAULT_OVERLAP = 150;  // characters

// ── page-marker helpers ───────────────────────

/**
 * Some PDF parsers embed `[page: N]` markers in the extracted text.
 * Scan for them so we can surface page info in chunk metadata.
 */
function extractPageMarkers(text: string): Array<{ page: number; startIndex: number }> {
    const markers: Array<{ page: number; startIndex: number }> = [];
    const re = /\[page[:\s]*(\d+)\]/gi;
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
        markers.push({ page: parseInt(m[1], 10), startIndex: m.index });
    }
    return markers;
}

function resolvePageInfo(
    offset: number,
    markers: Array<{ page: number; startIndex: number }>,
): string | null {
    if (markers.length === 0) return null;
    let page = markers[0].page;
    for (const marker of markers) {
        if (marker.startIndex <= offset) page = marker.page;
        else break;
    }
    return `page ${page}`;
}

// ── split-point logic ─────────────────────────

/**
 * Find the best character index to split at, searching backwards from
 * `maxEnd`.  Priority: paragraph break → sentence end → whitespace.
 * Falls back to `maxEnd` if nothing suitable is found.
 */
function findSplitPoint(text: string, from: number, maxEnd: number): number {
    const sub = text.slice(from, maxEnd);

    // Paragraph break (two newlines)
    const paraBreak = sub.lastIndexOf('\n\n');
    if (paraBreak > 0) return from + paraBreak + 2;

    // Sentence-ending punctuation followed by a capital (avoids "Dr. Smith")
    const sentEnd = sub.search(/[.!?]\s[A-Z]/);
    if (sentEnd !== -1) return from + sentEnd + 2;

    // Any whitespace
    const lastSpace = sub.lastIndexOf(' ');
    if (lastSpace > 0) return from + lastSpace + 1;

    return maxEnd;
}

// ── public API ────────────────────────────────

/**
 * Split a cleaned text string into overlapping `TextChunk` objects.
 *
 * @param text     Pre-cleaned text (run prepareText first, or set raw=true).
 * @param source   Original filename — stored in each chunk's metadata.
 * @param options  chunkSize / overlap overrides.
 * @param raw      Pass true to run prepareText() inside this function.
 */
export function chunkText(
    text: string,
    source: string,
    options: ChunkOptions = {},
): TextChunk[] {
    if (!text.trim()) return [];

    const chunkSize = options.chunkSize ?? DEFAULT_CHUNK_SIZE;
    const overlap = options.overlap ?? DEFAULT_OVERLAP;

    if (overlap >= chunkSize) {
        throw new Error(
            `overlap (${overlap}) must be smaller than chunkSize (${chunkSize})`,
        );
    }

    const pageMarkers = extractPageMarkers(text);
    const createdAt = new Date().toISOString();
    const chunks: TextChunk[] = [];

    let cursor = 0;
    let index = 0;

    while (cursor < text.length) {
        const end = Math.min(cursor + chunkSize, text.length);
        const splitAt = end < text.length ? findSplitPoint(text, cursor, end) : end;

        const slice = text.slice(cursor, splitAt).trim();

        if (slice.length > 0) {
            const metadata: ChunkMetadata = {
                chunkId: `${source}-chunk-${index}`,
                source,
                chunkIndex: index,
                pageInfo: resolvePageInfo(cursor, pageMarkers),
                createdAt,
            };
            chunks.push({ text: slice, metadata });
            index++;
        }

        // Step cursor forward, backing off by overlap to preserve context
        cursor = splitAt - overlap;
        if (cursor <= 0 || splitAt >= text.length) break;
    }

    return chunks;
}