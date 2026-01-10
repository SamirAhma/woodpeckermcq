import { useState, useEffect } from "react";
import { StudySession, Round } from "@prisma/client";

type SessionWithRounds = StudySession & { rounds: Round[] };

interface UseQuizSessionProps {
    setId: string;
    initialSession?: SessionWithRounds;
    targetRounds: number;
}

export function useQuizSession({ setId, initialSession, targetRounds }: UseQuizSessionProps) {
    console.log('[useQuizSession] Initialized with:', { setId, hasInitialSession: !!initialSession, targetRounds });
    const [session, setSession] = useState<SessionWithRounds | undefined>(initialSession);
    const [loading, setLoading] = useState(!initialSession);

    const startNewSession = async () => {
        console.log('[useQuizSession] Starting new session...');
        setLoading(true);
        try {
            const resp = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ setId, targetRounds }),
            });
            const data = await resp.json();
            console.log('[useQuizSession] New session created:', data);
            setSession(data);
        } catch (e) {
            console.error("Failed to start session", e);
        } finally {
            setLoading(false);
        }
    };

    const saveProgress = async (newState: any) => {
        if (!session) return;
        try {
            await fetch(`/api/sessions/${session.id}/progress`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newState),
            });
        } catch (e) {
            console.error("Failed to save progress", e);
        }
    };

    const finishRound = async (
        score: number,
        totalQuestions: number,
        attempts: any[],
        startTime: number,
        targetTime: number | null
    ) => {
        if (!session) return;
        try {
            await fetch(`/api/sessions/${session.id}/rounds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score,
                    totalQuestions,
                    attempts,
                    startTime: new Date(startTime).toISOString(),
                    endTime: new Date().toISOString(),
                    targetTime,
                    passed: true, // Mark as passed to trigger round increment
                }),
            });
            // Reload session
            const resp = await fetch(`/api/sessions/${session.id}`);
            const updatedSession = await resp.json();
            setSession(updatedSession);
        } catch (e) {
            console.error("Failed to finish round", e);
        }
    };

    useEffect(() => {
        console.log('[useQuizSession] useEffect', {
            hasSession: !!session,
            loading,
            setId
        });

        if (!session) {
            console.log('[useQuizSession] No session, starting new one');
            startNewSession();
        }
    }, [setId]);

    return {
        session,
        loading,
        saveProgress,
        finishRound,
        startNewSession,
    };
}
