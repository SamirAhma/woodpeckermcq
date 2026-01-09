import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { toTOON } from "@/lib/toon";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const searchParams = req.nextUrl.searchParams;
        const format = searchParams.get("format") || "json";

        const set = await prisma.mCQSet.findUnique({
            where: { id },
            include: {
                questions: {
                    select: {
                        question: true,
                        options: true,
                        answer: true,
                        explanation: true,
                        patternTag: true,
                    }
                }
            }
        });

        if (!set) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }

        // Format data for export
        const data = set.questions.map(q => ({
            question: q.question,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation || "",
            pattern_tag: q.patternTag || ""
        }));

        if (format === "toon") {
            const toonData = toTOON(data);
            return new NextResponse(toonData, {
                headers: {
                    "Content-Type": "text/plain",
                    "Content-Disposition": `attachment; filename="${set.title}.toon"`
                }
            });
        }

        return NextResponse.json(data, {
            headers: {
                "Content-Disposition": `attachment; filename="${set.title}.json"`
            }
        });

    } catch (error: any) {
        console.error("Export error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
