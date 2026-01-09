import { z } from "zod";
import { parseTOON } from "./toon";
import { QuestionSchema } from "./schemas";

// Schema for raw question input
export const QuestionInputSchema = z.object({
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    explanation: z.string().optional(),
    patternTag: z.string().optional()
});

export const MinifiedQuestionInputSchema = z.object({
    q: z.string(),
    o: z.array(z.string()),
    a: z.string(),
    e: z.string().optional(),
    t: z.string().optional()
});

export function parseQuestionInput(input: string): z.infer<typeof QuestionSchema>[] {
    const trimmed = input.trim();
    const isJson = trimmed.startsWith('[') || trimmed.startsWith('{');

    if (!isJson) {
        // Assume TOON
        const toonData = parseTOON(trimmed);
        if (!toonData.questions || toonData.questions.length === 0) {
            throw new Error("No valid questions found in TOON input.");
        }
        return toonData.questions;
    }

    // Handle JSON
    let parsed;
    try {
        parsed = JSON.parse(input);
    } catch (e) {
        throw new Error("Invalid JSON format.");
    }

    // Ensure array
    const dataArray = Array.isArray(parsed) ? parsed : (parsed.questions ? parsed.questions : [parsed]);

    if (!Array.isArray(dataArray)) {
        throw new Error("Could not extract questions array from JSON.");
    }

    // Transform and Validate
    return dataArray.map((item: any) => {
        // Check for minified format
        if (item.q && item.a) {
            const minified = MinifiedQuestionInputSchema.safeParse(item);
            if (minified.success) {
                return {
                    question: minified.data.q,
                    options: minified.data.o,
                    answer: minified.data.a,
                    explanation: minified.data.e || "",
                    patternTag: minified.data.t || "" // Removed "Minified" default to keep generic
                };
            }
        }

        // Standard format
        const result = QuestionInputSchema.safeParse(item);
        if (result.success) {
            return {
                question: result.data.question,
                options: result.data.options,
                answer: result.data.answer,
                explanation: result.data.explanation,
                patternTag: result.data.patternTag
            };
        }

        throw new Error(`Invalid question format: ${JSON.stringify(item).slice(0, 50)}...`);
    });
}
