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

  const completion =
    await client.chat.completions.create({
      model:
        'openai/gpt-3.5-turbo',

      messages: [
        {
          role: 'system',

          content: `
        You are Thinksy, an AI learning assistant.

Use conversation history when relevant.

Answer ONLY using the provided context.

When using information from context,
cite sources inline like [1], [2].

The citation number corresponds
to the source number in CONTEXT.

Rules:

- Do not invent information.
- If multiple sources support a statement,
  cite all relevant sources.
- Prefer the most relevant sources.
- Be concise but complete.
- Use markdown formatting when helpful.

If the answer cannot be found in the uploaded documents,
say:

"I could not find that information in the uploaded documents."
        `,
        },

        ...history,

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

  const stream =
    await client.chat.completions.create({
      model:
        'openai/gpt-3.5-turbo',

      stream: true,

      messages: [
        {
          role: 'system',

          content: `
You are Thinksy, an AI learning assistant.

Use conversation history when relevant.

Answer ONLY using the provided context.

When using information from context,
cite sources inline like [1], [2].

The citation number corresponds
to the source number in CONTEXT.

Rules:

- Do not invent information.
- If multiple sources support a statement,
  cite all relevant sources.
- Prefer the most relevant sources.
- Be concise but complete.
- Use markdown formatting when helpful.

If the answer cannot be found in the uploaded documents,
say:

"I could not find that information in the uploaded documents."
`,
        },

        ...history,

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