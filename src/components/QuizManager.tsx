"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MCQSet, Question, StudySession, Round } from "@prisma/client";
import { WOODPECKER_CONFIG } from "@/lib/config";
import { useQuizTimer } from "@/hooks/useQuizTimer";
import { useRestTimer } from "@/hooks/useRestTimer";
import { useQuizSession } from "@/hooks/useQuizSession";
import { useQuestionQueue } from "@/hooks/useQuestionQueue";
import ProgressHeader from "./ProgressHeader";
import QuestionCard from "./QuestionCard";
import FeedbackPanel from "./FeedbackPanel";

type SetWithQuestions = MCQSet & { questions: Question[] };
type SessionWithRounds = StudySession & { rounds: Round[] };

interface Props {
    set: SetWithQuestions;
    initialSession?: SessionWithRounds;
    targetRounds?: number;
}

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

export default function QuizManager({ set, initialSession, targetRounds = WOODPECKER_CONFIG.DEFAULT_TARGET_ROUNDS }: Props) {
    console.log('[QuizManager] Rendered with:', {
        setId: set.id,
        hasInitialSession: !!initialSession,
        targetRounds,
        initialSessionData: initialSession
    });
    const router = useRouter();
    const [isFinished, setIsFinished] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [isResting, setIsResting] = useState(false);
    const [targetTime, setTargetTime] = useState<number | null>(null);

    // Session management
    const { session, loading, saveProgress, finishRound } = useQuizSession({
        setId: set.id,
        initialSession,
        targetRounds,
    });

    console.log('[QuizManager] Session state:', { session, loading });

    // Question queue management - wait for session to be ready
    const {
        questionQueue,
        currentIndex,
        score,
        attempts,
        incorrectIds,
        showFeedback,
        selectedOption,
        currentQuestion,
        handleAnswer: handleAnswerBase,
        nextQuestion: nextQuestionBase,
    } = useQuestionQueue({
        questions: set.questions,
        activeState: session?.activeState, // Use session.activeState, not initialSession
        onSaveProgress: saveProgress,
        loading, // Pass loading state to prevent race condition
    });

    // Timer management
    const { timeLeft, setTimeLeft, resetTimer, elapsedTime, questionElapsedTime, resetQuestionTimer } = useQuizTimer({
        targetTime,
        isFinished,
        isPaused,
        onTimeout: () => finishRound(score, questionQueue.length, attempts)
    });

    const { restTimeRemaining, setRestTimeRemaining, formatRestTime } = useRestTimer({
        isResting,
        initialTime: 0
    });

    // Shuffle options for current question
    const shuffledOptions = useMemo(() => {
        if (!currentQuestion) return [];
        return shuffleArray(currentQuestion.options);
    }, [currentQuestion]);

    const handleAnswer = (option: string) => {
        if (showFeedback || (timeLeft !== null && timeLeft <= 0)) return;
        const currentRound = (session?.rounds?.length || 0) + 1;
        handleAnswerBase(option, currentQuestion, currentRound);
    };

    const nextQuestion = () => {
        resetQuestionTimer(); // Reset the live question timer
        const isRoundComplete = nextQuestionBase();
        if (isRoundComplete) {
            finishRound(score, questionQueue.length, attempts);
            setIsFinished(true);
        }
    };

    const currentRound = (session?.rounds?.length || 0) + 1;
    const totalRounds = session?.targetRounds || targetRounds;
    const isComplete = currentRound > totalRounds;

    // Calculate target time for the current round
    useEffect(() => {
        if (!session || session.rounds.length === 0) {
            setTargetTime(null);
            return;
        }

        // Find the most recent PASSED round to base the next target on
        const passedRounds = session.rounds.filter((r: Round) => r.score === r.totalQuestions);
        if (passedRounds.length === 0) {
            setTargetTime(null);
            return;
        }

        const lastPassedRound = passedRounds[passedRounds.length - 1];
        if (lastPassedRound.endTime && lastPassedRound.startTime) {
            const duration = (new Date(lastPassedRound.endTime).getTime() - new Date(lastPassedRound.startTime).getTime()) / 1000;
            const newTarget = Math.max(
                WOODPECKER_CONFIG.MIN_TARGET_TIME_SECONDS,
                Math.round(duration / WOODPECKER_CONFIG.TARGET_TIME_HALVING_FACTOR)
            );
            setTargetTime(newTarget);
        }
    }, [session?.rounds]);

    // Auto-advance logic
    useEffect(() => {
        if (showFeedback && selectedOption === currentQuestion?.answer) {
            const timer = setTimeout(() => {
                nextQuestion();
            }, WOODPECKER_CONFIG.AUTO_ADVANCE_DELAY_MS);
            return () => clearTimeout(timer);
        }
    }, [showFeedback, selectedOption, currentQuestion?.answer]);

    // Loading state
    if (loading || !session || questionQueue.length === 0) {
        return <div className="text-center py-20">Loading...</div>;
    }

    // Rest period state
    if (isResting) {
        return (
            <div className="bg-blue-500/10 border border-blue-500/20 p-8 rounded-xl text-center">
                <h3 className="text-2xl font-bold text-blue-600 mb-4">Consolidation Period</h3>
                <p className="text-sm text-muted-foreground mb-6">
                    Your brain is consolidating patterns. Next round unlocks in:
                </p>
                <div className="text-4xl font-mono font-bold text-primary mb-6">
                    {formatRestTime(restTimeRemaining)}
                </div>
                <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:scale-[1.02] transition-transform"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // Round complete state
    if (isFinished || isComplete) {
        return (
            <div className="space-y-4">
                <div className="bg-green-500/10 border border-green-500/20 p-6 rounded-xl">
                    <h3 className="text-2xl font-bold text-green-600 mb-2">
                        {isComplete ? "🎉 Woodpecker Complete!" : "Round Complete!"}
                    </h3>
                    <p className="text-muted-foreground">
                        {isComplete
                            ? `You've completed all ${totalRounds} rounds!`
                            : `Round ${currentRound - 1} finished. Score: ${score}/${questionQueue.length}`}
                    </p>
                </div>
                <button
                    onClick={() => router.push("/")}
                    className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:scale-[1.02] transition-transform shadow-lg"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // Main quiz UI
    const isTimedOut = timeLeft !== null && timeLeft <= 0;

    return (
        <div className="space-y-6">
            <ProgressHeader
                currentRound={currentRound}
                targetRounds={totalRounds}
                score={score}
                totalQuestions={questionQueue.length}
                timeLeft={timeLeft}
                targetTime={targetTime}
                errorCount={incorrectIds.size}
                remainingQuestions={questionQueue.length - currentIndex}
                elapsedTime={elapsedTime}
                questionElapsedTime={questionElapsedTime}
                pastRounds={session.rounds}
            />

            {isTimedOut && (
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <p className="text-sm font-bold text-red-600">⏰ Time's Up! Round will finish automatically.</p>
                </div>
            )}

            <QuestionCard
                question={currentQuestion}
                questionNumber={currentIndex + 1}
                totalQuestions={questionQueue.length}
                selectedOption={selectedOption}
                showFeedback={showFeedback}
                onAnswer={handleAnswer}
                disabled={showFeedback || isTimedOut}
            />

            {showFeedback && (
                <div className="animate-in slide-in-from-bottom-4 duration-300">
                    <FeedbackPanel
                        isCorrect={selectedOption === currentQuestion.answer}
                        explanation={currentQuestion.explanation || undefined}
                        correctAnswer={currentQuestion.answer}
                        timeTaken={attempts[attempts.length - 1]?.timeTaken}
                    />

                    {selectedOption !== currentQuestion.answer && (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl mb-4 mt-4">
                            <p className="text-sm font-medium text-yellow-700 dark:text-yellow-400">
                                ⚠️ This question will be repeated in this round until answered correctly.
                            </p>
                        </div>
                    )}

                    <button
                        onClick={nextQuestion}
                        className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:shadow-xl transition-all mt-4"
                    >
                        {currentIndex + 1 < questionQueue.length ? "Next Question" : (incorrectIds.size > 0 ? "Retry Incorrect Questions" : "Finish Round")}
                    </button>
                </div>
            )}
        </div>
    );
}
