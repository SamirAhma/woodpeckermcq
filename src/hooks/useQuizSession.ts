import { useState, useEffect } from "react";
import { StudySession, Round } from "@prisma/client";

type SessionWithRounds = StudySession & { rounds: Round[] };

interface UseQuizSessionProps {
    setId: string;
    initialSession?: SessionWithRounds;
    targetRounds: number;
}

export function useQuizSession({ setId, initialSession, targetRounds }: UseQuizSessionProps) {
    const [session, setSession] = useState<SessionWithRounds | undefined>(initialSession);
    const [loading, setLoading] = useState(false);

    const startNewSession = async () => {
        setLoading(true);
        try {
            const resp = await fetch("/api/sessions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ setId, targetRounds }),
            });
            const data = await resp.json();
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

    const finishRound = async (score: number, totalQuestions: number, attempts: any[]) => {
        if (!session) return;
        try {
            await fetch(`/api/sessions/${session.id}/rounds`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    score,
                    totalQuestions,
                    attempts,
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
        if (!session) {
            startNewSession();
        }
    }, []);

    return {
        session,
        loading,
        saveProgress,
        finishRound,
        startNewSession,
    };
}
