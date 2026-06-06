import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export interface Flashcard {
    question: string;
    answer: string;
}

export async function generateFlashcards(
    context: string,
    count = 10,
): Promise<Flashcard[]> {
    const completion =
        await client.chat.completions.create({
            model: "openai/gpt-3.5-turbo",

            messages: [
                {
                    role: "system",
                    content: `
You are an educational flashcard generator.

Generate ${count} high-quality study flashcards.

Rules:
- Focus on important concepts.
- Keep answers concise.
- Avoid duplicate cards.
- Return ONLY valid JSON.

Format:

[
  {
    "question":"...",
    "answer":"..."
  }
]
`,
                },

                {
                    role: "user",
                    content: context,
                },
            ],
        });

    const content =
        completion.choices[0]
            ?.message?.content ?? "[]";

    return JSON.parse(content);
}