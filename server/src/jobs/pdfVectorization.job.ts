import { pdfService } from '../services/pdf.service';
import { ChunkModel } from '../models/chunk.model';
import { logger } from '../utils/logger';
import type { ChunkOptions, EmbedOptions, VectorizationResult } from '../types/pdf.types';

export interface PdfVectorizationJobPayload {
    storedPath: string;
    source: string;
    chunkOptions?: ChunkOptions;
    embedOptions?: EmbedOptions;
}

export async function runPdfVectorizationJob(
    payload: PdfVectorizationJobPayload,
): Promise<VectorizationResult> {
    const { storedPath, source, chunkOptions } = payload;

    logger.info(`[PdfVectorizationJob] Starting — source: "${source}"`);

    // 1. Extract text and generate embeddings using your existing pipeline
    const result = await pdfService.processForVectorization(
        storedPath,
        source,
        chunkOptions,
    );

    // 2. Map the generated data to match your Mongoose Schema exactly
    const dbChunks = result.embeddedChunks.map((chunk) => ({
        text: chunk.text,
        source: source, // The unique Cloudinary ID we set in the controller
        userId: chunkOptions?.userId || 'system',
        embedding: chunk.embedding,
    }));

    // 3. Save all chunks directly into MongoDB Atlas in one fast operation
    if (dbChunks.length > 0) {
        await ChunkModel.insertMany(dbChunks);
    }

    logger.info(
        `[PdfVectorizationJob] Stored embeddings in MongoDB Atlas — source: "${source}"`,
    );

    return result;
}