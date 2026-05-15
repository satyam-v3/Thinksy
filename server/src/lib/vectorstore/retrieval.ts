import type { ChunkMetadata } from '../../types/pdf.types';

import { embedText } from '../ai/embeddings';

import { getOrCreateThinksyCollection } from './chroma';

type RetrievalMetadata =
  Partial<ChunkMetadata> &
  Record<string, unknown>;

export interface RetrievalMatch {
  text: string;

  source: string;

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
}

export interface RetrieveChunksResult {
  question: string;

  topK: number;

  matches: RetrievalMatch[];
}

const DEFAULT_TOP_K = 5;

function distanceToSimilarity(
  distance: number | null,
): number | null {
  if (
    distance === null ||
    Number.isNaN(distance)
  ) {
    return null;
  }

  return 1 / (1 + distance);
}

function keywordScore(
  query: string,
  text: string,
): number {
  const queryWords = query
    .toLowerCase()
    .split(/\W+/)
    .filter((w) => w.length > 2);

  const textLower =
    text.toLowerCase();

  let matches = 0;

  for (const word of queryWords) {
    if (textLower.includes(word)) {
      matches++;
    }
  }

  return (
    matches /
    Math.max(queryWords.length, 1)
  );
}

export async function retrieveRelevantChunks(
  input: RetrieveChunksInput,
): Promise<RetrieveChunksResult> {
  const topK =
    input.topK ?? DEFAULT_TOP_K;

  const queryEmbedding =
    await embedText(
      input.question,
    );

  const collection =
    await getOrCreateThinksyCollection();

  const result =
    await collection.query({
      queryEmbeddings: [
        queryEmbedding,
      ],

      nResults: topK,

      include: [
        'documents',
        'metadatas',
        'distances',
      ],
    });

  const documents =
    result.documents?.[0] ?? [];

  const metadatas =
    result.metadatas?.[0] ?? [];

  const distances =
    result.distances?.[0] ?? [];

  const matches: RetrievalMatch[] =
    documents
      .map((doc, index) => {
        if (!doc) {
          return null;
        }

        const distance =
          distances?.[index] ?? null;

        const metadata =
          (metadatas?.[index] ??
            {}) as RetrievalMetadata;

        const similarity =
          distanceToSimilarity(
            distance,
          );

        const rerankScore =
          (similarity ?? 0) *
          0.7 +
          keywordScore(
            input.question,
            doc,
          ) *
          0.3;

        return {
          text: doc,

          source:
            typeof metadata.source ===
              'string'
              ? metadata.source
              : 'Unknown',

          pageInfo:
            typeof metadata.pageInfo ===
              'string'
              ? metadata.pageInfo
              : null,

          chunkIndex:
            typeof metadata.chunkIndex ===
              'number'
              ? metadata.chunkIndex
              : null,

          metadata,

          distance,

          similarity,

          rerankScore,
        };
      })
      .filter(
        (
          m,
        ): m is RetrievalMatch =>
          m !== null,
      );

  matches.sort(
    (a, b) =>
      b.rerankScore -
      a.rerankScore,
  );

  return {
    question: input.question,

    topK,

    matches,
  };
}