import {
    useState,
} from "react";

import {
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import type {
    Flashcard,
} from "../lib/flashcards";

interface Props {
    open: boolean;

    flashcards: Flashcard[];

    onClose: () => void;
}

export function FlashcardModal({
    open,
    flashcards,
    onClose,
}: Props) {
    const [index, setIndex] =
        useState(0);

    const [showAnswer, setShowAnswer] =
        useState(false);

    if (
        !open ||
        flashcards.length === 0
    ) {
        return null;
    }

    const card =
        flashcards[index];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">

            <div className="w-full max-w-2xl rounded-2xl border border-border bg-surface p-6">

                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                        Flashcards
                    </h2>

                    <button
                        onClick={
                            onClose
                        }
                    >
                        <X />
                    </button>
                </div>

                <div
                    onClick={() =>
                        setShowAnswer(
                            (v) => !v,
                        )
                    }
                    className="flex min-h-[250px] cursor-pointer items-center justify-center rounded-xl border border-border p-6 text-center"
                >
                    <div>
                        <div className="mb-3 text-xs text-muted">
                            {showAnswer
                                ? "ANSWER"
                                : "QUESTION"}
                        </div>

                        <div className="text-lg font-medium">
                            {showAnswer
                                ? card.answer
                                : card.question}
                        </div>
                    </div>
                </div>

                <div className="mt-4 flex items-center justify-between">

                    <button
                        disabled={
                            index === 0
                        }
                        onClick={() => {
                            setIndex(
                                (i) =>
                                    i - 1,
                            );

                            setShowAnswer(
                                false,
                            );
                        }}
                    >
                        <ChevronLeft />
                    </button>

                    <span>
                        {index + 1} /{" "}
                        {
                            flashcards.length
                        }
                    </span>

                    <button
                        disabled={
                            index ===
                            flashcards.length -
                            1
                        }
                        onClick={() => {
                            setIndex(
                                (i) =>
                                    i + 1,
                            );

                            setShowAnswer(
                                false,
                            );
                        }}
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>
        </div>
    );
}