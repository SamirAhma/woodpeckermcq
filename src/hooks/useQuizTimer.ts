import { useState, useEffect } from "react";

interface UseQuizTimerProps {
    targetTime: number | null;
    isFinished: boolean;
    isPaused: boolean;
    onTimeout?: () => void;
}

export function useQuizTimer({ targetTime, isFinished, isPaused, onTimeout }: UseQuizTimerProps) {
    const [timeLeft, setTimeLeft] = useState<number | null>(targetTime);

    // Sync timeLeft with targetTime changes
    useEffect(() => {
        if (targetTime !== null) {
            setTimeLeft(targetTime);
        }
    }, [targetTime]);

    // Countdown timer
    useEffect(() => {
        if (timeLeft === null || isFinished || isPaused || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev !== null && prev > 0) return prev - 1;
                return prev;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, isFinished, isPaused]);

    // Handle timeout
    useEffect(() => {
        if (timeLeft === 0 && !isFinished && onTimeout) {
            onTimeout();
        }
    }, [timeLeft, isFinished, onTimeout]);

    const resetTimer = (newTime: number | null) => {
        setTimeLeft(newTime);
    };

    return { timeLeft, setTimeLeft, resetTimer };
}
