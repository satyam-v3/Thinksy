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
    .map(
      (m, i) => `
[Source ${i + 1}]
File: ${m.metadata.source}

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
    buildContext(matches.slice(0, 3));

  const completion =
    await client.chat.completions.create({
      model:
        'openai/gpt-3.5-turbo',

      messages: [
        {
          role: 'system',

          content: `
        You are Thinksy,
        an AI learning assistant.
        
        Use conversation history
        when relevant.
        
        Answer ONLY using
        the provided context.
        
        If the answer is not found,
        say you could not find it
        in the uploaded documents.
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
    buildContext(
      matches.slice(0, 3),
    );

  const stream =
    await client.chat.completions.create({
      model:
        'openai/gpt-3.5-turbo',

      stream: true,

      messages: [
        {
          role: 'system',

          content: `
You are Thinksy,
an AI learning assistant.

Use conversation history
when relevant.

Answer ONLY using
the provided context.

When using information
from context,
cite sources inline
like [1], [2].

The citation number
corresponds to the
source number in CONTEXT.

If the answer is not found,
say you could not find it
in the uploaded documents.
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