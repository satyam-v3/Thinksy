// src/jobs/pdfVectorization.job.ts
//
// Orchestrates the parse → clean → chunk → embed pipeline for a
// single uploaded PDF.  Intentionally has no knowledge of ChromaDB
// or any vector store — it returns EmbeddedChunk[] to its caller so
// storage can be added as the next layer without touching this file.
//
// Usage (called from a queue worker, a route handler, or directly):
//
//   import { runPdfVectorizationJob } from './jobs/pdfVectorization.job';
//   const result = await runPdfVectorizationJob({ storedPath, source });

import { pdfService } from '../services/pdf.service';
import { storeEmbeddedChunks } from '../lib/vectorstore/vectorStore';
import { logger } from '../utils/logger';
import type { ChunkOptions, EmbedOptions, VectorizationResult } from '../types/pdf.types';

// ── job payload ───────────────────────────────

export interface PdfVectorizationJobPayload {
    /** Absolute path to the already-stored PDF (from multer). */
    storedPath: string;
    /** Human-readable label for log messages (usually the original filename). */
    source: string;
    /** Optional chunking overrides. */
    chunkOptions?: ChunkOptions;
    /** Optional embedding overrides. */
    embedOptions?: EmbedOptions;
}

// ── job runner ────────────────────────────────

/**
 * Run the full vectorization pipeline for one PDF.
 *
 * Returns a `VectorizationResult` containing every EmbeddedChunk.
 * The caller is responsible for persisting the chunks to a vector store.
 */
export async function runPdfVectorizationJob(
    payload: PdfVectorizationJobPayload,
): Promise<VectorizationResult> {
    const { storedPath, source, chunkOptions, embedOptions } = payload;

    logger.info(`[PdfVectorizationJob] Starting — source: "${source}"`);

    const result =
        await pdfService.processForVectorization(
            storedPath,

            source,

            chunkOptions,

            embedOptions,
        );

    console.log(
        '🚀 Attempting to store chunks:',
        result.embeddedChunks.length,
    );
    await storeEmbeddedChunks({
        chunks: result.embeddedChunks,
    });

    logger.info(
        `[PdfVectorizationJob] Stored embeddings in ChromaDB — source: "${source}"`,
    );

    return result;
}