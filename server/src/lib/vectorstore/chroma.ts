import { ChromaClient, type Collection } from 'chromadb';

const DEFAULT_COLLECTION_NAME = 'thinksy-documents';

let cachedClient: ChromaClient | null = null;

export function getChromaClient(): ChromaClient {
  if (cachedClient) {
    return cachedClient;
  }

  const path = process.env.CHROMA_URL ?? 'http://localhost:8000';
  const authToken = process.env.CHROMA_AUTH_TOKEN;

  cachedClient = new ChromaClient({
    path,
    auth: authToken ? { provider: 'token', credentials: authToken } : undefined,
  });

  return cachedClient;
}

export async function getOrCreateThinksyCollection(): Promise<Collection> {
  const client = getChromaClient();

  return client.getOrCreateCollection({
    name: DEFAULT_COLLECTION_NAME,

    embeddingFunction: undefined,

    metadata: {
      'hnsw:space': 'cosine',
    },
  });
}

export const CHROMA_COLLECTION_NAME = DEFAULT_COLLECTION_NAME;
