import OpenAI from "openai";

const client = new OpenAI({
    apiKey:
        process.env.OPENROUTER_API_KEY,

    baseURL:
        "https://openrouter.ai/api/v1",
});

export interface QuizQuestion {
    question: string;

    options: string[];

    correctIndex: number;

    explanation?: string;
}

export async function generateQuiz(
    context: string,
    count = 10,
): Promise<QuizQuestion[]> {

    const completion =
        await client.chat.completions.create({
            model:
                "openai/gpt-3.5-turbo",

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

    const raw =
        completion.choices[0]
            ?.message?.content ?? "";

    try {
        const parsed =
            JSON.parse(raw);

        return parsed.questions;
    } catch (error) {
        console.error(
            "Quiz JSON parse failed:",
            raw,
        );

        throw new Error(
            "Failed to generate quiz",
        );
    }
}