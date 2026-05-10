import { InferenceClient } from '@huggingface/inference';

import type {
    EmbeddedChunk,
    TextChunk,
} from '../../types/pdf.types';

const client = new InferenceClient(
    process.env.HUGGINGFACE_API_KEY,
);

export async function embedText(
    text: string,
): Promise<number[]> {
    const result = await client.featureExtraction({
        model: 'sentence-transformers/all-MiniLM-L6-v2',
        inputs: text,
    });

    return Array.isArray(result[0])
        ? (result[0] as number[])
        : (result as number[]);
}

export async function embedChunks(
    chunks: TextChunk[],
): Promise<EmbeddedChunk[]> {
    const embeddedChunks: EmbeddedChunk[] = [];

    for (const chunk of chunks) {
        const embedding = await embedText(
            chunk.text,
        );

        embeddedChunks.push({
            text: chunk.text,
            embedding,
            metadata: chunk.metadata,
        });
    }

    return embeddedChunks;
}