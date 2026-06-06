import type { ChunkMetadata } from '../../types/pdf.types';

import { embedText } from '../ai/embeddings';

import { getOrCreateThinksyCollection } from './chroma';

type RetrievalMetadata =
  Partial<ChunkMetadata> &
  Record<string, unknown>;

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

  // ////////////////////////////////
  console.log("FILTER:");
  console.log(input.activeDocs);
  // ////////////////////////////////

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

      where:
        input.activeDocs &&
          input.activeDocs.length > 0
          ? {
            source: {
              $in:
                input.activeDocs,
            },
          }
          : undefined,
    });

  const documents =
    result.documents?.[0] ?? [];

  const metadatas =
    result.metadatas?.[0] ?? [];

  const distances =
    result.distances?.[0] ?? [];

  const matches =
    documents
      .map<RetrievalMatch | null>(
        (doc, index) => {
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

            originalName:
              typeof metadata.originalName ===
                'string'
                ? metadata.originalName
                : undefined,

            storedFilename:
              typeof metadata.storedFilename ===
                'string'
                ? metadata.storedFilename
                : undefined,

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
          Boolean(m),
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