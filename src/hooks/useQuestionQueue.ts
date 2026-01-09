import { useState, useEffect } from "react";
import { Question } from "@prisma/client";

// Fisher-Yates shuffle
function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

interface UseQuestionQueueProps {
    questions: Question[];
    activeState?: any;
    onSaveProgress: (state: any) => void;
    loading?: boolean; // Add loading flag
}

export function useQuestionQueue({ questions, activeState, onSaveProgress, loading = false }: UseQuestionQueueProps) {
    console.log('[useQuestionQueue] Initialized with:', {
        questionCount: questions.length,
        hasActiveState: !!activeState,
        loading,
        activeState
    });
    const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [incorrectIds, setIncorrectIds] = useState(new Set<string>());
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());

    // Initialize queue from activeState or fresh
    useEffect(() => {
        console.log('[useQuestionQueue] useEffect triggered', {
            hasActiveState: !!activeState,
            queueLength: questionQueue.length,
            loading,
            activeStateData: activeState
        });

        // Wait for session to finish loading before initializing
        if (loading) {
            console.log('[useQuestionQueue] Waiting for session to load...');
            return;
        }

        if (activeState && activeState.queue && activeState.queue.length > 0) {
            console.log('[useQuestionQueue] Restoring from activeState');
            const restoredQueue = activeState.queue
                .map((id: string) => questions.find(q => q.id === id))
                .filter(Boolean) as Question[];
            setQuestionQueue(restoredQueue);
            setCurrentIndex(activeState.index || 0);
            setScore(activeState.score || 0);
            setIncorrectIds(new Set(activeState.incorrectIds || []));
            setAttempts(activeState.attempts || []);
            setQuestionStartTime(Date.now()); // Reset start time on restore
        } else if (questionQueue.length === 0 && questions.length > 0) {
            console.log('[useQuestionQueue] Creating fresh shuffled queue');
            const shuffled = shuffleArray([...questions]);
            setQuestionQueue(shuffled);
            onSaveProgress({
                index: 0,
                score: 0,
                incorrectIds: [],
                queue: shuffled.map(q => q.id),
                attempts: [],
                startTime: new Date().toISOString()
            });
            setQuestionStartTime(Date.now());
        }
    }, [activeState, questions.length, loading]); // Re-run when activeState or loading changes

    const handleAnswer = (option: string, currentQuestion: Question, roundNumber: number) => {
        const isCorrect = option === currentQuestion.answer;
        const now = Date.now();
        const timeTaken = (now - questionStartTime) / 1000; // Accurate duration in seconds

        setSelectedOption(option);
        setShowFeedback(true);

        const newAttempts = [...attempts, {
            questionId: currentQuestion.id,
            isCorrect,
            timeTaken,
            roundNumber,
        }];
        setAttempts(newAttempts);

        let newScore = score;
        const newIncorrectIds = new Set(incorrectIds);

        if (isCorrect) {
            newScore = score + 1;
            setScore(newScore);
            newIncorrectIds.delete(currentQuestion.id);
        } else {
            newIncorrectIds.add(currentQuestion.id);
        }
        setIncorrectIds(newIncorrectIds);

        onSaveProgress({
            index: currentIndex,
            score: newScore,
            incorrectIds: Array.from(newIncorrectIds),
            queue: questionQueue.map(q => q.id),
            attempts: newAttempts,
            startTime: new Date().toISOString()
        });
    };

    const nextQuestion = () => {
        setQuestionStartTime(Date.now()); // Reset start time for the next question
        let newIndex = currentIndex;
        let newQueue = questionQueue;

        if (currentIndex + 1 < questionQueue.length) {
            newIndex = currentIndex + 1;
            setCurrentIndex(newIndex);
            setShowFeedback(false);
            setSelectedOption(null);
        } else if (incorrectIds.size > 0) {
            // Retry incorrect questions
            const incorrectQuestions = questionQueue.filter(q => incorrectIds.has(q.id));
            newQueue = shuffleArray(incorrectQuestions);
            newIndex = 0;
            setQuestionQueue(newQueue);
            setCurrentIndex(newIndex);
            setShowFeedback(false);
            setSelectedOption(null);
        } else {
            // Round complete
            return true;
        }

        // Persist the new index/queue immediately
        onSaveProgress({
            index: newIndex,
            score,
            incorrectIds: Array.from(incorrectIds),
            queue: newQueue.map(q => q.id),
            attempts,
            startTime: new Date().toISOString()
        });

        return false;
    };

    return {
        questionQueue,
        currentIndex,
        score,
        attempts,
        incorrectIds,
        showFeedback,
        selectedOption,
        currentQuestion: questionQueue[currentIndex],
        handleAnswer,
        nextQuestion,
        setShowFeedback,
        setSelectedOption,
        questionStartTime,
    };
}
