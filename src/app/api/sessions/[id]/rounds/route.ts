import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { RoundSchema } from "@/lib/schemas";
import { Prisma } from "@prisma/client";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;
        const body = await req.json();
        const result = RoundSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const { score, totalQuestions, startTime, endTime, targetTime, attempts, passed } = result.data;

        // Use a transaction to create the round and update the session's currentRound
        const savedRound = await prisma.$transaction(async (tx) => {

            const round = await tx.round.create({
                data: {
                    sessionId,
                    score,
                    totalQuestions,
                    startTime: startTime ? new Date(startTime) : undefined,
                    endTime: endTime ? new Date(endTime) : new Date(),
                    targetTime,
                    roundNumber: 0, // placeholder
                },
            });

            // Only increment currentRound if the user passed
            let session;
            if (passed) {
                session = await tx.studySession.update({
                    where: { id: sessionId },
                    data: {
                        currentRound: {
                            increment: 1,
                        },
                        activeState: Prisma.DbNull, // Clear transient progress when round is officially recorded
                    },
                });
            } else {
                session = await tx.studySession.update({
                    where: { id: sessionId },
                    data: {
                        activeState: Prisma.DbNull, // Also clear if recording a failure (to restart the round attempt)
                    },
                });
            }

            // Update the round with the correct round number from the session
            const updatedRound = await tx.round.update({
                where: { id: round.id },
                data: {
                    roundNumber: session!.currentRound - (passed ? 1 : 0),
                },
            });

            // Create attempts if provided
            if (attempts && Array.isArray(attempts)) {
                await tx.attempt.createMany({
                    data: attempts.map((a: any) => ({
                        sessionId,
                        questionId: a.questionId,
                        isCorrect: a.isCorrect,
                        timeTaken: a.timeTaken,
                        roundNumber: updatedRound.roundNumber,
                    })),
                });
            }

            return updatedRound;
        });

        return NextResponse.json(savedRound, { status: 201 });
    } catch (error: any) {
        console.error("Round recording error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
