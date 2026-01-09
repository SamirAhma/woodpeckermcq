import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: sessionId } = await params;
        const body = await req.json();

        // Body should be the active state object
        // { index, score, queue, incorrectIds, attempts, startTime }

        const session = await prisma.studySession.update({
            where: { id: sessionId },
            data: {
                activeState: body as any // Cast to any to handle Prisma Json type compatibility
            }
        });

        return NextResponse.json(session);
    } catch (error: any) {
        console.error("Progress save error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
