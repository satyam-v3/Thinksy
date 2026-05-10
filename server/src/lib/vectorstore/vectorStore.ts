import type { EmbeddedChunk } from '../../types/pdf.types';
import { getOrCreateThinksyCollection } from './chroma';

type ChromaMetadataValue = string | number | boolean;
type ChromaMetadataRecord = Record<string, ChromaMetadataValue>;

export interface StoreEmbeddedChunksInput {
  chunks: EmbeddedChunk[];
}

export interface StoreEmbeddedChunksResult {
  collectionName: string;
  storedCount: number;
  ids: string[];
}

function toChromaMetadata(chunk: EmbeddedChunk): ChromaMetadataRecord {
  return {
    chunkId: chunk.metadata.chunkId,
    source: chunk.metadata.source,
    chunkIndex: chunk.metadata.chunkIndex,
    pageInfo: chunk.metadata.pageInfo ?? '',
    createdAt: chunk.metadata.createdAt,
  };
}

export async function storeEmbeddedChunks(
  input: StoreEmbeddedChunksInput,
): Promise<StoreEmbeddedChunksResult> {
  const { chunks } = input;

  if (chunks.length === 0) {
    return {
      collectionName: 'thinksy-documents',
      storedCount: 0,
      ids: [],
    };
  }

  const collection = await getOrCreateThinksyCollection();

  const ids = chunks.map((chunk) => chunk.metadata.chunkId);
  const embeddings = chunks.map((chunk) => chunk.embedding);
  const documents = chunks.map((chunk) => chunk.text);
  const metadatas = chunks.map(toChromaMetadata);

  try {
    await collection.add({
      ids,
      embeddings,
      documents,
      metadatas,
    });

    console.log('✅ CHROMA ADD SUCCESS');
  } catch (error) {
    console.error('❌ CHROMA ADD FAILED');
    console.error(error);
  }

  return {
    collectionName: collection.name,
    storedCount: chunks.length,
    ids,
  };
}
