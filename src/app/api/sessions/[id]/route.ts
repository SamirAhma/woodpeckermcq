import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;

        const session = await prisma.studySession.findUnique({
            where: { id: sessionId },
            include: {
                set: {
                    include: {
                        questions: true,
                    },
                },
                rounds: {
                    orderBy: {
                        roundNumber: "asc",
                    },
                },
            },
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        return NextResponse.json(session);
    } catch (error: any) {
        console.error("Session fetch error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
