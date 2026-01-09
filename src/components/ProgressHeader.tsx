import { Round } from "@prisma/client";

interface ProgressHeaderProps {
    currentRound: number;
    targetRounds: number;
    score: number;
    totalQuestions: number;
    timeLeft: number | null;
    targetTime: number | null;
    errorCount: number;
    remainingQuestions: number;
    elapsedTime: number;
    questionElapsedTime: number;
    pastRounds: Round[];
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
    elapsedTime,
    questionElapsedTime,
    pastRounds,
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
                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-sm text-muted-foreground mb-1">Question Timer</p>
                        <p className="text-2xl font-bold text-blue-600">
                            {Math.floor(questionElapsedTime / 60)}:{String(questionElapsedTime % 60).padStart(2, "0")}s
                        </p>
                    </div>
                    {timeLeft !== null && targetTime !== null && (
                        <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Time Left (Goal)</p>
                            <p className={`text-3xl font-bold ${getTimerColor()}`}>
                                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, "0")}
                            </p>
                        </div>
                    )}
                </div>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 mb-4">
                <div
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(score / totalQuestions) * 100}%` }}
                />
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-4 border-t border-slate-100">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cycle Durations:</span>
                {pastRounds.map((r) => {
                    const duration = r.endTime && r.startTime
                        ? Math.round((new Date(r.endTime).getTime() - new Date(r.startTime).getTime()) / 1000)
                        : 0;
                    return (
                        <div key={r.id} className="text-sm font-medium text-slate-600">
                            Round {r.roundNumber}: <span className="text-slate-900">{Math.floor(duration / 60)}:{String(duration % 60).padStart(2, "0")}s</span>
                        </div>
                    );
                })}
                <div className="text-sm font-medium text-blue-600 animate-pulse">
                    Round {currentRound} (Ongoing): <span className="font-bold">{Math.floor(elapsedTime / 60)}:{String(elapsedTime % 60).padStart(2, "0")}s</span>
                </div>
            </div>
        </div>
    );
}
