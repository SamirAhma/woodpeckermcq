import { useState, useEffect } from "react";

interface UseRestTimerProps {
    isResting: boolean;
    initialTime: number;
}

export function useRestTimer({ isResting, initialTime }: UseRestTimerProps) {
    const [restTimeRemaining, setRestTimeRemaining] = useState<number>(initialTime);

    // Rest countdown timer
    useEffect(() => {
        if (!isResting || restTimeRemaining <= 0) return;

        const timer = setInterval(() => {
            setRestTimeRemaining((prev) => {
                if (prev <= 1) {
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isResting, restTimeRemaining]);

    const formatRestTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    return { restTimeRemaining, setRestTimeRemaining, formatRestTime };
}
