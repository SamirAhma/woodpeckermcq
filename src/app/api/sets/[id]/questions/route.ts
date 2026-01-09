import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseQuestionInput } from "@/lib/parser";

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: setId } = await params;
        const contentType = req.headers.get("content-type");
        const bodyText = await req.text(); // Read as text to handle both JSON and TOON via our parser

        // Validate Set exists
        const set = await prisma.mCQSet.findUnique({ where: { id: setId } });
        if (!set) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }

        let newQuestions: any[] = [];
        try {
            // Use the shared parser which handles JSON (Standard/Minified) and TOON
            newQuestions = parseQuestionInput(bodyText);
        } catch (e: any) {
            return NextResponse.json({ error: e.message || "Failed to parse input" }, { status: 400 });
        }

        if (newQuestions.length === 0) {
            return NextResponse.json({ error: "No valid questions found in input" }, { status: 400 });
        }

        // Batch insert
        const created = await prisma.question.createMany({
            data: newQuestions.map(q => ({
                setId: setId,
                question: q.question,
                options: q.options,
                answer: q.answer,
                explanation: q.explanation || null,
                patternTag: q.patternTag || null
            }))
        });

        // Trigger revalidation if needed (not strictly needed for API but good for cache)
        // revalidatePath("/"); // Can't easily import here without next module, skipping as this is an API response.

        return NextResponse.json({
            success: true,
            count: created.count,
            message: `Successfully added ${created.count} questions.`
        }, { status: 201 });

    } catch (error: any) {
        console.error("Append questions error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
