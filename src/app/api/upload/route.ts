import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { parseTOON } from "@/lib/toon";
import { MCQSetUploadSchema, MCQSetArraySchema } from "@/lib/schemas";
import { WOODPECKER_CONFIG } from "@/lib/config";

export async function POST(req: NextRequest) {
    try {
        let body;
        const contentType = req.headers.get("content-type");

        if (contentType?.includes("text/plain")) {
            const text = await req.text();
            body = parseTOON(text);
        } else {
            body = await req.json();

            // Support minified JSON format: [{q,o,a,e,t}, ...]
            if (Array.isArray(body) && body.length > 0 && "q" in body[0]) {
                body = body.map((item: any) => ({
                    question: item.q,
                    options: item.o,
                    answer: item.a,
                    explanation: item.e,
                    pattern_tag: item.t
                }));
            }
        }

        // Try to validate as a structured object first, then as a direct array
        let title = "Untitled Set";
        let questions = [];

        const structuredResult = MCQSetUploadSchema.safeParse(body);
        if (structuredResult.success) {
            title = structuredResult.data.title || title;
            questions = structuredResult.data.questions;
        } else {
            const arrayResult = MCQSetArraySchema.safeParse(body);
            if (arrayResult.success) {
                questions = arrayResult.data;
            } else {
                // If both fail, return error with details
                return NextResponse.json(
                    {
                        error: "Invalid JSON format",
                        details: structuredResult.error.format(),
                        arrayErrors: arrayResult.error.format(),
                    },
                    { status: 400 }
                );
            }
        }

        // Save to database
        const newSet = await prisma.mCQSet.create({
            data: {
                title: title,
                targetRounds: structuredResult.success ? (structuredResult.data.targetRounds || WOODPECKER_CONFIG.DEFAULT_TARGET_ROUNDS) : WOODPECKER_CONFIG.DEFAULT_TARGET_ROUNDS,
                questions: {
                    create: questions.map((q) => ({
                        question: q.question,
                        options: q.options,
                        answer: q.answer,
                        explanation: q.explanation,
                        patternTag: q.pattern_tag,
                    })),
                },
            },
            include: {
                questions: true,
            },
        });

        revalidatePath("/");
        return NextResponse.json(newSet, { status: 201 });
    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
