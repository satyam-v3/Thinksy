import fs from 'node:fs/promises';

import { PDFParse } from 'pdf-parse';

import type { ParsedPdf } from '../types/pdf.types';
import { ApiError } from './ApiError';
import { logger } from './logger';

/**
 * Thin wrapper around `pdf-parse` v2.
 *
 * Reads the PDF file from disk, runs text + info extraction, and returns a
 * normalized DTO. Any parsing failure is mapped to a 422 ApiError so the
 * caller can rely on a single error type.
 */
export async function parsePdfFromPath(filePath: string): Promise<ParsedPdf> {
  let data: Buffer;
  try {
    data = await fs.readFile(filePath);
  } catch (err) {
    logger.error(`Failed to read PDF file at ${filePath}`, err);
    throw ApiError.internal('Failed to read uploaded PDF from disk');
  }

  const parser = new PDFParse({ data: new Uint8Array(data) });
  try {
    const textResult = await parser.getText();
    return {
      text: textResult.text,
      totalPages: textResult.total,
    };
  } catch (err) {
    logger.error('PDF parsing failed', err);
    const message = err instanceof Error ? err.message : 'Unknown parser error';
    throw ApiError.unprocessable('Failed to parse PDF', { reason: message });
  } finally {
    await parser.destroy().catch(() => {
      /* swallow — destroy errors should not mask the primary result */
    });
  }
}