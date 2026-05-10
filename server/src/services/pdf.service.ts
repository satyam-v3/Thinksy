import path from 'node:path';

import { parsePdfFromPath } from '../utils/pdfParser';

import { prepareText } from '../lib/ai/textCleaner';
import { chunkText } from '../lib/ai/chunker';
import { embedChunks } from '../lib/ai/embeddings';

import type {
  PdfUploadResult,
  UploadedPdfMeta,
  ChunkOptions,
  EmbedOptions,
  VectorizationResult,
} from '../types/pdf.types';

/**
 * PDF service
 *
 * Responsibilities:
 * - upload + parse PDFs
 * - clean extracted text
 * - semantic chunking
 * - embeddings generation
 *
 * Future:
 * - ChromaDB storage
 * - retrieval
 * - AI tutoring
 */
export const pdfService = {
  /**
   * Upload + parse only.
   * Keep this lightweight for fast HTTP responses.
   */
  async ingestUploadedFile(
    file: Express.Multer.File,
  ): Promise<PdfUploadResult> {
    const meta: UploadedPdfMeta = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storedPath: path.resolve(file.path),
    };

    const parsed = await parsePdfFromPath(file.path);

    return {
      ...meta,
      ...parsed,
      message: 'PDF uploaded and parsed successfully',
    };
  },

  /**
   * AI vectorization pipeline
   *
   * Flow:
   * parse
   * → clean
   * → chunk
   * → embed
   */
  async processForVectorization(
    storedPath: string,
    chunkOpts?: ChunkOptions,
    embedOpts?: EmbedOptions,
  ): Promise<VectorizationResult> {
    const source = path.basename(storedPath);

    // ───────────────────────────────────────────
    // 1. Parse PDF
    // ───────────────────────────────────────────

    const { text: rawText } = await parsePdfFromPath(
      storedPath,
    );

    // Prevent huge memory spikes during development
    const limitedRawText = rawText.slice(0, 200000);

    // ───────────────────────────────────────────
    // 2. Clean text
    // ───────────────────────────────────────────

    const cleanedText = prepareText(limitedRawText);

    // Additional dev safety limit
    const limitedText = cleanedText.slice(0, 20000);

    // ───────────────────────────────────────────
    // 3. Generate semantic chunks
    // ───────────────────────────────────────────

    const chunks = chunkText(
      limitedText,
      source,
      {
        chunkSize: 500,
        overlap: 100,
        source,
        ...chunkOpts,
      },
    );

    console.log('Total Chunks:', chunks.length);

    if (chunks.length > 0) {
      console.log('First Chunk Preview:');
      console.log(
        chunks[0].text.slice(0, 200),
      );
    }

    // ───────────────────────────────────────────
    // 4. Generate embeddings
    // ───────────────────────────────────────────

    // Embed only first chunk during development
    const embeddedChunks = await embedChunks(
      chunks.slice(0, 2),
      embedOpts,
    );

    if (embeddedChunks.length > 0) {
      console.log(
        'Embedding Dimension:',
        embeddedChunks[0].embedding.length,
      );
    }

    // ───────────────────────────────────────────
    // Final result
    // ───────────────────────────────────────────

    return {
      source,
      totalChunks: chunks.length,
      embeddedChunks,
    };
  },
};