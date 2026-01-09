import { useState, useEffect } from "react";

interface UseQuizTimerProps {
    targetTime: number | null;
    isFinished: boolean;
    isPaused: boolean;
    onTimeout?: () => void;
}

export function useQuizTimer({ targetTime, isFinished, isPaused, onTimeout }: UseQuizTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(targetTime);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [questionElapsedTime, setQuestionElapsedTime] = useState(0);

    // Sync timeLeft with targetTime changes
    useEffect(() => {
        if (targetTime !== null) {
            setTimeLeft(targetTime);
        }
    }, [targetTime]);

    // Timer effect (both count down and count up)
    useEffect(() => {
        if (isFinished || isPaused) return;

        const timer = setInterval(() => {
            // Always count up total round time
            setElapsedTime((prev) => prev + 1);
            setQuestionElapsedTime((prev) => prev + 1);

            // Count down if target exists
            setTimeLeft((prev) => {
                if (prev === null) return null;
                return prev > 0 ? prev - 1 : 0;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isFinished, isPaused, timeLeft === null]);

    // Handle timeout
    useEffect(() => {
        if (timeLeft === 0 && !isFinished && onTimeout) {
            onTimeout();
        }
    }, [timeLeft, isFinished, onTimeout]);

    const resetTimer = (newTime: number | null) => {
        setTimeLeft(newTime);
    };

    const resetQuestionTimer = () => {
        setQuestionElapsedTime(0);
    };

    return { timeLeft, setTimeLeft, resetTimer, elapsedTime, questionElapsedTime, resetQuestionTimer };
}
