import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: setId } = await params;

        // Get all sessions for this set with rounds and attempts
        const sessions = await prisma.studySession.findMany({
            where: { setId },
            include: {
                rounds: {
                    orderBy: { roundNumber: "asc" },
                },
                attempts: {
                    include: {
                        question: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        });

        // Get the set info
        const set = await prisma.mCQSet.findUnique({
            where: { id: setId },
            include: {
                questions: true,
            },
        });

        if (!set) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }

        // Calculate analytics
        const totalSessions = sessions.length;
        const completedSessions = sessions.filter(
            (s) => s.currentRound > s.targetRounds
        ).length;

        // Round-by-round performance
        const roundStats = sessions.flatMap((session) =>
            session.rounds.map((round) => ({
                sessionId: session.id,
                roundNumber: round.roundNumber,
                score: round.score,
                totalQuestions: round.totalQuestions,
                accuracy: (round.score / round.totalQuestions) * 100,
                timeTaken: round.endTime
                    ? Math.round(
                        (new Date(round.endTime).getTime() -
                            new Date(round.startTime).getTime()) /
                        1000
                    )
                    : null,
                targetTime: round.targetTime,
                createdAt: round.startTime,
            }))
        );

        // Question difficulty analysis (based on attempts)
        const questionStats = set.questions.map((q) => {
            const attempts = sessions.flatMap((s) =>
                s.attempts.filter((a) => a.questionId === q.id)
            );
            const correctAttempts = attempts.filter((a) => a.isCorrect).length;
            const totalAttempts = attempts.length;

            return {
                questionId: q.id,
                question: q.question,
                patternTag: q.patternTag,
                totalAttempts,
                correctAttempts,
                incorrectAttempts: totalAttempts - correctAttempts,
                accuracy: totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0,
            };
        });

        // Sort by difficulty (lowest accuracy = hardest)
        questionStats.sort((a, b) => a.accuracy - b.accuracy);

        // Time improvement analysis (Convergence Chart data)
        const convergenceData = Object.entries(
            roundStats.filter((r) => r.timeTaken !== null).reduce((acc, round) => {
                const key = round.roundNumber;
                if (!acc[key]) acc[key] = [];
                acc[key].push(round.timeTaken!);
                return acc;
            }, {} as Record<number, number[]>)
        ).map(([round, times]) => {
            const sortedTimes = [...times].sort((a, b) => a - b);
            const mean = times.reduce((a, b) => a + b, 0) / times.length;
            const median = sortedTimes.length % 2 === 0
                ? (sortedTimes[sortedTimes.length / 2 - 1] + sortedTimes[sortedTimes.length / 2]) / 2
                : sortedTimes[Math.floor(sortedTimes.length / 2)];

            return {
                round: parseInt(round),
                meanTime: Math.round(mean * 10) / 10,
                medianTime: Math.round(median * 10) / 10,
                count: times.length,
            };
        }).sort((a, b) => a.round - b.round);

        // Knowledge Gaps (Pattern Tag grouping)
        const patternStats = Object.entries(
            questionStats.reduce((acc, q) => {
                const tag = q.patternTag || "Uncategorized";
                if (!acc[tag]) acc[tag] = { totalTime: 0, count: 0, accuracy: 0, totalAttempts: 0 };

                // Estimate time spent on this pattern from attempts
                const patternAttempts = sessions.flatMap(s =>
                    s.attempts.filter(a => a.questionId === q.questionId && a.timeTaken !== null)
                );
                const avgTime = patternAttempts.length > 0
                    ? patternAttempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / patternAttempts.length
                    : 0;

                acc[tag].totalTime += avgTime;
                acc[tag].count += 1;
                acc[tag].accuracy += q.accuracy;
                acc[tag].totalAttempts += q.totalAttempts;
                return acc;
            }, {} as Record<string, { totalTime: number; count: number; accuracy: number; totalAttempts: number }>)
        ).map(([tag, data]) => ({
            tag,
            avgTime: Math.round((data.totalTime / data.count) * 10) / 10,
            avgAccuracy: Math.round(data.accuracy / data.count),
            totalAttempts: data.totalAttempts,
        })).sort((a, b) => b.avgTime - a.avgTime); // Slowest patterns first

        // Group rounds and attempts by session for comparison
        const sessionHistory = sessions.map(session => {
            const sessionRounds = session.rounds.map(round => ({
                roundNumber: round.roundNumber,
                score: round.score,
                totalQuestions: round.totalQuestions,
                timeTaken: round.endTime
                    ? Math.round((new Date(round.endTime).getTime() - new Date(round.startTime).getTime()) / 1000)
                    : null,
            })).filter(r => r.timeTaken !== null);

            if (sessionRounds.length === 0) return null;

            const firstRound = sessionRounds[0];
            const lastRound = sessionRounds[sessionRounds.length - 1];

            // Acceleration Factor: R1 Time / Last Round Time
            const accelerationFactor = lastRound.timeTaken && lastRound.timeTaken > 0
                ? Math.round((firstRound.timeTaken! / lastRound.timeTaken) * 10) / 10
                : 1;

            return {
                id: session.id,
                createdAt: session.createdAt,
                targetRounds: session.targetRounds,
                currentRound: session.currentRound,
                rounds: sessionRounds,
                totalDuration: sessionRounds.reduce((sum, r) => sum + (r.timeTaken || 0), 0),
                accelerationFactor,
                startSpeed: firstRound.timeTaken,
                endSpeed: lastRound.timeTaken
            };
        }).filter(s => s !== null).reverse(); // Oldest first for progression

        // Learning Velocity: Improvement in Round 1 over time
        let learningVelocity = 0;
        if (sessionHistory.length >= 2) {
            const firstSession = sessionHistory[0];
            const lastSession = sessionHistory[sessionHistory.length - 1];
            const speedImprovement = (firstSession.startSpeed || 0) - (lastSession.startSpeed || 0);
            learningVelocity = speedImprovement; // Positive means faster
        }

        return NextResponse.json({
            set: {
                id: set.id,
                title: set.title,
                totalQuestions: set.questions.length,
            },
            summary: {
                totalSessions,
                completedSessions,
                completionRate: totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0,
                learningVelocity,
                avgAcceleration: sessionHistory.length > 0
                    ? Math.round((sessionHistory.reduce((sum, s) => sum + s.accelerationFactor, 0) / sessionHistory.length) * 10) / 10
                    : 1
            },
            sessionHistory,
            roundStats,
            questionStats,
            convergenceData,
            patternStats,
        });
    } catch (error: any) {
        console.error("Analytics error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
