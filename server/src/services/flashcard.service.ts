import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export interface Flashcard {
    question: string;
    answer: string;
}

/**
 * Safely extracts a JSON array from a string, ignoring conversational
 * filler or markdown code blocks (e.g., ```json ... ```) added by the LLM.
 */
function extractJsonArray(text: string): string {
    const start = text.indexOf('[');
    const end = text.lastIndexOf(']');

    if (start !== -1 && end !== -1 && end >= start) {
        return text.slice(start, end + 1);
    }

    return text;
}

export async function generateFlashcards(
    context: string,
    count = 10,
): Promise<Flashcard[]> {
    try {
        const completion = await client.chat.completions.create({
            model: "google/gemini-2.5-flash",
            max_tokens: 2000,
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

        const raw = completion.choices[0]?.message?.content ?? "[]";

        // Strip markdown and filler before parsing
        const cleanJson = extractJsonArray(raw);

        return JSON.parse(cleanJson);

    } catch (error) {
        // Catch both network failures from OpenRouter and JSON parsing errors
        console.error("Flashcard generation failed:", error);
        throw new Error("Failed to generate flashcards");
    }
}