import { api } from "./api";

export interface QuizQuestion {
    question: string;

    options: string[];

    correctIndex: number;

    explanation?: string;
}

export async function generateQuiz(
    topic: string,
    activeDocs: string[],
) {
    const { data } =
        await api.post(
            "/quiz/generate",
            {
                topic,
                count: 10,
                activeDocs,
            },
        );

    return data.questions as QuizQuestion[];
}