import { retrieveRelevantChunks } from '../lib/vectorstore/retrieval';
import { getChromaClient, CHROMA_COLLECTION_NAME, getOrCreateThinksyCollection } from '../lib/vectorstore/chroma';

export interface ChatQueryInput {
  question: string;
  topK?: number;
}

export const chatService = {
  async queryKnowledgeBase(input: ChatQueryInput) {
    return retrieveRelevantChunks({
      question: input.question,
      topK: input.topK,
    });
  },

  async debugVectors() {
    const collection = await getOrCreateThinksyCollection();

    const count = await collection.count();

    const peek = await collection.peek({
      limit: 5,
    });

    return {
      count,
      peek,
    };
  }
};