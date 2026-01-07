import { z } from "zod";

export const QuestionSchema = z.object({
    question: z.string().min(1, "Question is required"),
    options: z.array(z.string()).min(2, "At least two options are required"),
    answer: z.string().min(1, "Answer is required"),
    explanation: z.string().optional(),
    pattern_tag: z.string().optional(),
});

export const MCQSetUploadSchema = z.object({
    title: z.string().min(1, "Title is required"),
    targetRounds: z.number().min(1).max(20).default(7),
    questions: z.array(QuestionSchema).min(1, "At least one question is required"),
});

export const MCQSetArraySchema = z.array(QuestionSchema).min(1, "At least one question is required");

export const StudySessionSchema = z.object({
    setId: z.string().min(1, "setId is required"),
    targetRounds: z.number().min(1).max(20).optional(),
});

export const RoundAttemptSchema = z.object({
    questionId: z.string().min(1),
    isCorrect: z.boolean(),
    timeTaken: z.number().optional(),
    roundNumber: z.number(),
});

export const RoundSchema = z.object({
    id: z.string().optional(),
    score: z.number().min(0),
    totalQuestions: z.number().min(1),
    startTime: z.string(),
    endTime: z.string().optional().nullable(),
    targetTime: z.number().nullable().optional(),
    attempts: z.array(RoundAttemptSchema).optional(),
    passed: z.boolean().optional(),
});

export const AnalyticsResponseSchema = z.object({
    set: z.object({
        id: z.string(),
        title: z.string(),
        totalQuestions: z.number(),
    }),
    summary: z.object({
        totalSessions: z.number(),
        completedSessions: z.number(),
        completionRate: z.number(),
        learningVelocity: z.number(),
        avgAcceleration: z.number(),
    }),
    sessionHistory: z.array(z.object({
        id: z.string(),
        createdAt: z.string(),
        targetRounds: z.number(),
        currentRound: z.number(),
        rounds: z.array(z.any()),
        totalDuration: z.number(),
        accelerationFactor: z.number(),
        startSpeed: z.number().nullable(),
        endSpeed: z.number().nullable(),
    })),
    roundStats: z.array(z.any()),
    questionStats: z.array(z.any()),
    convergenceData: z.array(z.any()),
    patternStats: z.array(z.any()),
});

export type MCQSetUpload = z.infer<typeof MCQSetUploadSchema>;
export type QuestionUpload = z.infer<typeof QuestionSchema>;
export type StudySessionInput = z.infer<typeof StudySessionSchema>;
export type RoundInput = z.infer<typeof RoundSchema>;
export type AnalyticsResponse = z.infer<typeof AnalyticsResponseSchema>;
