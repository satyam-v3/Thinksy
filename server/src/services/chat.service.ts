import { retrieveRelevantChunks } from '../lib/vectorstore/retrieval';
import { getChromaClient, CHROMA_COLLECTION_NAME, getOrCreateThinksyCollection } from '../lib/vectorstore/chroma';

export interface ChatMessage {
  role:
  | 'user'
  | 'assistant';

  content: string;
}

export interface ChatQueryInput {
  question: string;

  topK?: number;

  history?: ChatMessage[];
}

export const chatService = {
  async queryKnowledgeBase(
    input: ChatQueryInput,
  ) {
    const retrieval =
      await retrieveRelevantChunks({
        question: input.question,
        topK: input.topK,
      });

    const { generateAnswer } =
      await import('../lib/ai/generateAnswer');

    const answer =
      await generateAnswer(
        input.question,
        retrieval.matches,
        input.history ?? [],
      );

    return {
      answer,
      sources: retrieval.matches,
    };
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