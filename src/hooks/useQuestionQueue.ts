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
}

export function useQuestionQueue({ questions, activeState, onSaveProgress }: UseQuestionQueueProps) {
    const [questionQueue, setQuestionQueue] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [attempts, setAttempts] = useState<any[]>([]);
    const [incorrectIds, setIncorrectIds] = useState(new Set<string>());
    const [showFeedback, setShowFeedback] = useState(false);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);

    // Initialize queue from activeState or fresh
    useEffect(() => {
        if (activeState && activeState.queue && activeState.queue.length > 0) {
            const restoredQueue = activeState.queue
                .map((id: string) => questions.find(q => q.id === id))
                .filter(Boolean) as Question[];
            setQuestionQueue(restoredQueue);
            setCurrentIndex(activeState.index || 0);
            setScore(activeState.score || 0);
            setIncorrectIds(new Set(activeState.incorrectIds || []));
            setAttempts(activeState.attempts || []);
        } else if (questionQueue.length === 0) {
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
        }
    }, [activeState, questions]);

    const handleAnswer = (option: string, currentQuestion: Question, roundNumber: number) => {
        const isCorrect = option === currentQuestion.answer;
        const timeTaken = Date.now() / 1000; // Simplified

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
        if (currentIndex + 1 < questionQueue.length) {
            setCurrentIndex(currentIndex + 1);
            setShowFeedback(false);
            setSelectedOption(null);
        } else if (incorrectIds.size > 0) {
            // Retry incorrect questions
            const incorrectQuestions = questionQueue.filter(q => incorrectIds.has(q.id));
            const shuffled = shuffleArray(incorrectQuestions);
            setQuestionQueue(shuffled);
            setCurrentIndex(0);
            setShowFeedback(false);
            setSelectedOption(null);
        } else {
            // Round complete
            return true;
        }
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
    };
}
