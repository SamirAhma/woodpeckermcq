interface ProgressHeaderProps {
    currentRound: number;
    targetRounds: number;
    score: number;
    totalQuestions: number;
    timeLeft: number | null;
    targetTime: number | null;
    errorCount: number;
    remainingQuestions: number;
}

export default function ProgressHeader({
    currentRound,
    targetRounds,
    score,
    totalQuestions,
    timeLeft,
    targetTime,
    errorCount,
    remainingQuestions,
}: ProgressHeaderProps) {
    const getTimerColor = () => {
        if (timeLeft === null || targetTime === null) return "text-slate-600";
        const ratio = timeLeft / targetTime;
        if (ratio > 0.5) return "text-emerald-600";
        if (ratio > 0.25) return "text-amber-600";
        return "text-red-600";
    };

    return (
        <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        Round {currentRound} of {targetRounds}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Score: {score}/{totalQuestions} • Errors: {errorCount} • Remaining: {remainingQuestions}
                    </p>
                </div>
                {timeLeft !== null && targetTime !== null && (
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Time Left</p>
                        <p className={`text-3xl font-bold ${getTimerColor()}`}>
                            {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                        </p>
                    </div>
                )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(score / totalQuestions) * 100}%` }}
                />
            </div>
        </div>
    );
}
