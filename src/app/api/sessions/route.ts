import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { StudySessionSchema } from "@/lib/schemas";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = StudySessionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json({ error: "Invalid input", details: result.error.format() }, { status: 400 });
        }

        const { setId } = result.data;

        // Get the targetRounds from the MCQSet
        const set = await prisma.mCQSet.findUnique({
            where: { id: setId },
            select: { targetRounds: true }
        });

        if (!set) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }

        const session = await prisma.studySession.create({
            data: {
                setId,
                targetRounds: set.targetRounds,
            },
            include: {
                set: {
                    include: {
                        questions: true,
                    },
                },
            },
        });

        return NextResponse.json(session, { status: 201 });
    } catch (error: any) {
        console.error("Session creation error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
