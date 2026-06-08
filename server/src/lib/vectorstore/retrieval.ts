import type { ChunkMetadata } from '../../types/pdf.types';
import { embedText } from '../ai/embeddings';
import { ChunkModel } from '../../models/chunk.model'; // 👈 Swapped to Mongoose

type RetrievalMetadata = Partial<ChunkMetadata> & Record<string, unknown>;

export interface RetrievalMatch {
  text: string;
  source: string;
  originalName?: string;
  storedFilename?: string;
  pageInfo: string | null;
  chunkIndex: number | null;
  similarity: number | null;
  distance: number | null;
  rerankScore: number;
  metadata: RetrievalMetadata;
}

export interface RetrieveChunksInput {
  question: string;
  topK?: number;
  activeDocs?: string[];
  userId?: string;
}

export interface RetrieveChunksResult {
  question: string;
  topK: number;
  matches: RetrievalMatch[];
}

const DEFAULT_TOP_K = 5;

function keywordScore(query: string, text: string): number {
  const queryWords = query.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
  const textLower = text.toLowerCase();
  let matches = 0;

  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matches++;
    }
  }

  return matches / Math.max(queryWords.length, 1);
}

export async function retrieveRelevantChunks(
  input: RetrieveChunksInput,
): Promise<RetrieveChunksResult> {
  const topK = input.topK ?? DEFAULT_TOP_K;

  // 1. Generate the embedding array for the user's question
  const queryEmbedding = await embedText(input.question);

  // 2. Build the secure MongoDB filter
  let filter: Record<string, any> = {};
  if (input.userId && input.activeDocs && input.activeDocs.length > 0) {
    filter = {
      $and: [
        { userId: input.userId },
        { source: { $in: input.activeDocs } }
      ]
    };
  } else if (input.userId) {
    filter = { userId: input.userId };
  } else if (input.activeDocs && input.activeDocs.length > 0) {
    filter = { source: { $in: input.activeDocs } };
  }

  // 3. Run the MongoDB Atlas $vectorSearch pipeline
  const results = await ChunkModel.aggregate([
    {
      $vectorSearch: {
        index: 'vector_index', // ⚠️ Important: This must match your Atlas Index Name!
        path: 'embedding',
        queryVector: queryEmbedding,
        numCandidates: topK * 10,
        limit: topK,
        filter: Object.keys(filter).length > 0 ? filter : undefined,
      }
    },
    {
      $project: {
        _id: 0,
        text: 1,
        source: 1,
        userId: 1,
        score: { $meta: 'vectorSearchScore' } // Atlas calculates cosine similarity automatically!
      }
    }
  ]);

  // 4. Map MongoDB results back to your app's standard format so the AI doesn't break
  const matches = results.map<RetrievalMatch>((doc) => {
    const similarity = doc.score;
    const distance = similarity ? (1 / similarity) - 1 : null; // Reverse math for consistency

    const rerankScore = (similarity ?? 0) * 0.7 + keywordScore(input.question, doc.text) * 0.3;

    return {
      text: doc.text,
      source: doc.source || 'Unknown',
      pageInfo: null,
      chunkIndex: null,
      metadata: { source: doc.source, userId: doc.userId },
      distance,
      similarity,
      rerankScore,
    };
  });

  // Sort by the hybrid score
  matches.sort((a, b) => b.rerankScore - a.rerankScore);

  return {
    question: input.question,
    topK,
    matches,
  };
}