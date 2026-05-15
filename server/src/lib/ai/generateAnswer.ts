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

Answer ONLY using
the provided context.

If the answer is not found,
say you could not find it
in the uploaded documents.
`,
        },

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