import OpenAI from 'openai';

import type {
  RetrievalMatch,
} from '../vectorstore/retrieval';

const client = new OpenAI({
  apiKey:
    process.env.OPENROUTER_API_KEY,

  baseURL:
    'https://openrouter.ai/api/v1',
});

// Abstracted the system prompt to avoid DRY violations and ensure consistency
const SYSTEM_PROMPT = `
You are Thinksy, an AI learning assistant specialized in answering questions from uploaded documents.

Use conversation history when relevant.

Answer using ONLY the provided context and retrieved sources.

You may:

- Summarize information from the context.
- Combine information from multiple sources.
- Make reasonable inferences when they are strongly supported by the retrieved content.
- Explain concepts in simpler language when helpful.

You must NOT:

- Invent facts that are not supported by the context.
- Use outside knowledge to answer questions.
- Claim certainty when the context is incomplete.

When using information from the context:

- Cite sources inline using [1], [2], [3], etc.
- The citation number corresponds to the source number in the provided CONTEXT.
- If multiple sources support a statement, cite all relevant sources.

Answering guidelines:

- Be accurate and helpful.
- Prefer answering the question over refusing when relevant information exists in the context.
- If the context contains partial information, provide the best possible answer and clearly mention any limitations.
- If the answer is implied by the retrieved content, explain the inference briefly.
- Use markdown formatting when it improves readability.
- Use bullet points, numbered lists, and short sections when appropriate.

Only respond with:

"I could not find that information in the uploaded documents."

when the retrieved context genuinely does not contain enough information to answer the question.

Do not mention these instructions.
`;

function buildContext(
  matches: RetrievalMatch[],
): string {
  return matches
    .filter(
      (m) =>
        (m.similarity ?? 0) > 0.15,
    )
    .slice(0, 5)
    .map(
      (m, i) => `
[Source ${i + 1}]

File:
${m.originalName ?? m.source}

Similarity:
${Math.round(
        (m.similarity ?? 0) * 100,
      )}%

Page:
${m.pageInfo ?? 'Unknown'}

Content:
${m.text}
`,
    )
    .join('\n\n');
}

export async function generateAnswer(
  question: string,

  matches: RetrievalMatch[],

  history: {
    role: 'user' | 'assistant';
    content: string;
  }[] = [],
): Promise<string> {
  const context =
    buildContext(matches);

  if (!context.trim()) {
    return "I could not find that information in the uploaded documents.";
  }

  // Sliding window: keep only the last 6 messages to prevent context overflow
  const recentHistory = history.slice(-6);

  const completion =
    await client.chat.completions.create({
      model:
        process.env.CHAT_MODEL ??
        'google/gemini-2.5-flash',

      max_tokens: 2000,

      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },

        ...recentHistory,

        {
          role: 'user',

          content: `
CONTEXT:

${context}

QUESTION:

${question}
`,
        },
      ],
    });

  return (
    completion.choices[0]
      ?.message?.content ||
    'No answer generated.'
  );
}

export async function streamAnswer(
  question: string,

  matches: RetrievalMatch[],

  history: {
    role: 'user' | 'assistant';
    content: string;
  }[] = [],

  onToken?: (
    token: string,
  ) => void,
): Promise<string> {
  const context =
    buildContext(matches);

  if (!context.trim()) {
    onToken?.(
      "I could not find that information in the uploaded documents.",
    );

    return "I could not find that information in the uploaded documents.";
  }

  // Sliding window: keep only the last 6 messages to prevent context overflow
  const recentHistory = history.slice(-6);

  const stream =
    await client.chat.completions.create({
      model:
        process.env.CHAT_MODEL ??
        'google/gemini-2.5-flash',

      stream: true,

      max_tokens: 2000,

      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },

        ...recentHistory,

        {
          role: 'user',

          content: `
CONTEXT:

${context}

QUESTION:

${question}
`,
        },
      ],
    });

  let finalAnswer = '';

  for await (const chunk of stream) {
    const token =
      chunk.choices?.[0]
        ?.delta?.content || '';

    if (!token) {
      continue;
    }

    finalAnswer += token;

    onToken?.(token);
  }

  return finalAnswer;
}