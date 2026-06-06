import {
    useMemo,
    useState,
} from "react";

import {
    X,
} from "lucide-react";

interface QuizQuestion {
    question: string;
    options: string[];
    correctIndex: number;
    explanation?: string;
}

interface Props {
    open: boolean;
    questions: QuizQuestion[];
    onClose: () => void;
}

export function QuizModal({
    open,
    questions,
    onClose,
}: Props) {
    const [answers,
        setAnswers] =
        useState<
            Record<number, number>
        >({});

    const [submitted,
        setSubmitted] =
        useState(false);

    const score =
        useMemo(() => {
            return questions.reduce(
                (
                    total,
                    question,
                    index,
                ) =>
                    total +
                    (answers[index] ===
                        question.correctIndex
                        ? 1
                        : 0),

                0,
            );
        }, [
            answers,
            questions,
        ]);

    if (
        !open ||
        questions.length === 0
    ) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70">

            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-surface p-6">

                <div className="mb-6 flex items-center justify-between">

                    <h2 className="text-xl font-semibold">
                        Quiz
                    </h2>

                    <button
                        onClick={
                            onClose
                        }
                    >
                        <X />
                    </button>

                </div>

                {questions.map(
                    (
                        question,
                        index,
                    ) => (
                        <div
                            key={index}
                            className="mb-8"
                        >
                            <h3 className="mb-4 font-medium">
                                {index + 1}.
                                {" "}
                                {question.question}
                            </h3>

                            <div className="space-y-2">

                                {question.options.map(
                                    (
                                        option,
                                        optionIndex,
                                    ) => (
                                        <label
                                            key={
                                                optionIndex
                                            }
                                            className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3"
                                        >
                                            <input
                                                type="radio"
                                                name={`q-${index}`}
                                                checked={
                                                    answers[
                                                    index
                                                    ] ===
                                                    optionIndex
                                                }
                                                disabled={
                                                    submitted
                                                }
                                                onChange={() =>
                                                    setAnswers(
                                                        (
                                                            prev,
                                                        ) => ({
                                                            ...prev,

                                                            [index]:
                                                                optionIndex,
                                                        }),
                                                    )
                                                }
                                            />

                                            <span>
                                                {
                                                    option
                                                }
                                            </span>
                                        </label>
                                    ),
                                )}

                            </div>

                            {submitted && (
                                <div className="mt-3 rounded-lg border border-border bg-surface2 p-3 text-sm">

                                    <div>
                                        {answers[
                                            index
                                        ] ===
                                            question.correctIndex
                                            ? "✅ Correct"
                                            : "❌ Incorrect"}
                                    </div>

                                    <div className="mt-2">

                                        Correct Answer:
                                        {" "}
                                        {
                                            question.options[
                                            question.correctIndex
                                            ]
                                        }

                                    </div>

                                    {question.explanation && (
                                        <div className="mt-2 text-muted">

                                            {
                                                question.explanation
                                            }

                                        </div>
                                    )}

                                </div>
                            )}

                        </div>
                    ),
                )}

                {!submitted && (
                    <button
                        onClick={() =>
                            setSubmitted(
                                true,
                            )
                        }
                        className="rounded-lg bg-accent px-4 py-2 font-medium text-black"
                    >
                        Submit Quiz
                    </button>
                )}

                {submitted && (
                    <div className="mt-8 rounded-xl border border-border p-4">

                        <h3 className="text-2xl font-bold">

                            Score:
                            {" "}
                            {score}
                            /
                            {questions.length}

                        </h3>

                    </div>
                )}

            </div>
        </div>
    );
}