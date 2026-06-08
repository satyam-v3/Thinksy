import { retrieveRelevantChunks } from '../lib/vectorstore/retrieval';
import { ChunkModel } from '../models/chunk.model'; // 👈 Replaced Chroma import

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatQueryInput {
  question: string;
  topK?: number;
  activeDocs?: string[];
  history?: ChatMessage[];
  userId?: string;
}

export const chatService = {
  async queryKnowledgeBase(input: ChatQueryInput) {
    const retrieval = await retrieveRelevantChunks({
      question: input.question,
      topK: input.topK,
      activeDocs: input.activeDocs,
      userId: input.userId,
    });

    const { generateAnswer } = await import('../lib/ai/generateAnswer');
    const answer = await generateAnswer(input.question, retrieval.matches, input.history ?? []);

    return { answer, sources: retrieval.matches };
  },

  async streamKnowledgeBase(input: ChatQueryInput, onToken: (token: string) => void) {
    const retrieval = await retrieveRelevantChunks({
      question: input.question,
      topK: input.topK,
      activeDocs: input.activeDocs,
      userId: input.userId,
    });

    const { streamAnswer } = await import('../lib/ai/generateAnswer');
    const answer = await streamAnswer(input.question, retrieval.matches, input.history ?? [], onToken);

    return { answer, sources: retrieval.matches };
  },

  async debugVectors(userId: string) {
    // 👈 Swapped ChromaDB for Mongoose!
    const securePeek = await ChunkModel.find({ userId })
      .select('text source') // Grab text and metadata, ignore massive embeddings
      .limit(5)
      .lean();

    const count = await ChunkModel.countDocuments({ userId });

    // Mocking Chroma's return structure so your frontend doesn't break
    return {
      count,
      peek: {
        documents: securePeek.map((doc) => doc.text),
        metadatas: securePeek.map((doc) => ({ source: doc.source, userId })),
      },
    };
  }
};