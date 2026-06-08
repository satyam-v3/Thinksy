import os from 'node:os';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import { parsePdfFromPath } from '../utils/pdfParser';
import { prepareText } from '../lib/ai/textCleaner';
import { chunkText } from '../lib/ai/chunker';
import { embedChunks } from '../lib/ai/embeddings';

import type {
  PdfUploadResult,
  UploadedPdfMeta,
  ChunkOptions,
  VectorizationResult,
} from '../types/pdf.types';

/**
 * Helper to temporarily download a cloud URL to the server's /tmp directory
 * so our local pdf-parser can read it.
 */
async function downloadTempPdf(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch PDF from cloud: ${response.statusText}`);

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // Create a safe, random temp filepath
  const tempFilename = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}.pdf`;
  const tempPath = path.join(os.tmpdir(), tempFilename);

  await fs.writeFile(tempPath, buffer);
  return tempPath;
}

export const pdfService = {
  /**
   * Upload + parse only.
   */
  async ingestUploadedFile(
    file: Express.Multer.File,
  ): Promise<PdfUploadResult> {
    // Cloudinary puts the secure URL in file.path
    const cloudUrl = file.path;

    const meta: UploadedPdfMeta = {
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      sizeBytes: file.size,
      storedPath: cloudUrl, // Saving the cloud URL to the database!
    };

    let tempLocalPath = '';
    let parsed;

    try {
      tempLocalPath = await downloadTempPdf(cloudUrl);
      parsed = await parsePdfFromPath(tempLocalPath);
    } finally {
      // Always clean up the temp file
      if (tempLocalPath) await fs.unlink(tempLocalPath).catch(() => { });
    }

    return {
      ...meta,
      ...parsed,
      message: 'PDF uploaded to Cloudinary and parsed successfully',
    };
  },

  /**
   * AI vectorization pipeline
   */
  async processForVectorization(
    storedPath: string, // This is now a Cloudinary URL
    originalName?: string,
    chunkOpts?: ChunkOptions,
  ): Promise<VectorizationResult> {
    const source = originalName || 'Unknown_Document';

    let tempLocalPath = '';
    let rawText = '';

    // ───────────────────────────────────────────
    // 1. Fetch & Parse PDF
    // ───────────────────────────────────────────
    try {
      tempLocalPath = await downloadTempPdf(storedPath);
      const parsed = await parsePdfFromPath(tempLocalPath);
      rawText = parsed.text;
    } finally {
      // Clean up temp file
      if (tempLocalPath) await fs.unlink(tempLocalPath).catch(() => { });
    }

    const limitedRawText = rawText.slice(0, 200000);

    // ───────────────────────────────────────────
    // 2. Clean text
    // ───────────────────────────────────────────
    const cleanedText = prepareText(limitedRawText);
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
        originalName,
        ...chunkOpts,
      },
    );

    // ───────────────────────────────────────────
    // 4. Generate embeddings
    // ───────────────────────────────────────────
    const embeddedChunks = await embedChunks(chunks);

    return {
      source,
      totalChunks: chunks.length,
      embeddedChunks,
    };
  },
};