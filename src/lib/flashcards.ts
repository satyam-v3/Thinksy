import { api } from "./api";

export interface Flashcard {
    question: string;
    answer: string;
}

export async function generateFlashcards(
    topic: string,
    activeDocs: string[],
) {
    const { data } =
        await api.post(
            "/flashcards/generate",
            {
                topic,
                count: 10,
                activeDocs,
            },
        );

    return data.flashcards as Flashcard[];
}