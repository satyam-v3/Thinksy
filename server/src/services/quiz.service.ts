import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

/**
 * Safely extracts a JSON object from a string, ignoring conversational
 * filler or markdown code blocks (e.g., ```json ... ```) added by the LLM.
 */
function extractJsonObject(text: string): string {
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');

    if (start !== -1 && end !== -1 && end >= start) {
        return text.slice(start, end + 1);
    }

    return text;
}

export async function generateQuiz(
    context: string,
    count = 10,
): Promise<QuizQuestion[]> {
    try {
        const completion = await client.chat.completions.create({
            model: "google/gemini-2.5-flash",
            max_tokens: 2000,
            messages: [
                {
                    role: "system",
                    content: `
Generate ${count} multiple choice questions ONLY from the provided context.

Return STRICT JSON.

Format:

{
  "questions":[
    {
      "question":"...",
      "options":[
        "Option 1",
        "Option 2",
        "Option 3",
        "Option 4"
      ],
      "correctIndex":0,
      "explanation":"..."
    }
  ]
}

Rules:

- correctIndex must be 0,1,2 or 3
- options must NOT include A., B., C., D.
- Use ONLY information from context
- Return JSON only
- No markdown
- No extra text
`,
                },
                {
                    role: "user",
                    content: context,
                },
            ],
        });

        const raw = completion.choices[0]?.message?.content ?? "";

        // Strip markdown and filler before parsing
        const cleanJson = extractJsonObject(raw);

        const parsed = JSON.parse(cleanJson);
        return parsed.questions;

    } catch (error) {
        // Catch both network failures from OpenRouter and JSON parsing errors
        console.error("Quiz generation failed:", error);
        throw new Error("Failed to generate quiz");
    }
}