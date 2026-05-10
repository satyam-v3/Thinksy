import type { Request, Response } from 'express';
import { runPdfVectorizationJob } from '../jobs/pdfVectorization.job';
import { pdfService } from '../services/pdf.service';
import { ApiResponse } from '../utils/ApiResponse';
import { ApiError } from '../utils/ApiError';
import { chatService } from '@/services/chat.service';

/**
 * PDF controller — thin HTTP layer over `pdfService`.
 * All persistence + parsing logic lives in the service / utility.
 */
export const pdfController = {
  upload: async (req: Request, res: Response): Promise<void> => {
    if (!req.file) {
      throw ApiError.badRequest('No PDF file provided. Use form field "file".');
    }

    const result =
      await pdfService.ingestUploadedFile(req.file);

    void runPdfVectorizationJob({
      storedPath: result.storedPath,
      source: result.originalName,
    });

    res.status(201).json(
      ApiResponse.success(result),
    );
  },

  testChunking: async (req: Request, res: Response): Promise<void> => {
    const { text } = req.body;

    if (!text || typeof text !== 'string') {
      throw ApiError.badRequest('Valid text is required.');
    }

    const { prepareText } = await import('../lib/ai/textCleaner');
    const { chunkText } = await import('../lib/ai/chunker');

    const cleanedText = prepareText(text);

    const chunks = chunkText(cleanedText, 'test.pdf', {
      chunkSize: 500,
      overlap: 100,
    });

    res.status(200).json(
      ApiResponse.success({
        originalLength: text.length,
        totalChunks: chunks.length,
        preview: chunks.slice(0, 2).map((chunk) => ({
          chunkIndex: chunk.metadata.chunkIndex,
          text: chunk.text.slice(0, 200),
        })),
      }),
    );
  },
};