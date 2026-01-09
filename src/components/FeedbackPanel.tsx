interface FeedbackPanelProps {
    isCorrect: boolean;
    explanation?: string;
    correctAnswer: string;
}

export default function FeedbackPanel({ isCorrect, explanation, correctAnswer }: FeedbackPanelProps) {
    return (
        <div
            className={`mt-4 p-6 rounded-xl border-2 ${isCorrect
                    ? "bg-emerald-50 border-emerald-200"
                    : "bg-red-50 border-red-200"
                }`}
        >
            <div className="flex items-start gap-3">
                <span className="text-2xl">{isCorrect ? "✓" : "✗"}</span>
                <div className="flex-1">
                    <h4 className={`font-bold text-lg mb-2 ${isCorrect ? "text-emerald-700" : "text-red-700"
                        }`}>
                        {isCorrect ? "Correct!" : "Incorrect"}
                    </h4>
                    {!isCorrect && (
                        <p className="text-sm text-red-600 mb-2">
                            <span className="font-semibold">Correct answer:</span> {correctAnswer}
                        </p>
                    )}
                    {explanation && (
                        <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-sm font-semibold text-slate-700 mb-1">
                                {explanation ? "Here&apos;s why:" : "Explanation"}
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">{explanation}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
