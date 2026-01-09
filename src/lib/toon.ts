/**
 * Token-Oriented Object Notation (TOON) Parser & Generator
 *
 * TOON matches JSON's data model but minimizes tokens.
 * Key features:
 * - YAML-style indentation for hierarchy (no braces/brackets)
 * - CSV-style layout for uniform arrays (headers + rows)
 */

import { WOODPECKER_CONFIG } from "@/lib/config";

export function parseTOON(input: string): any {
    const lines = input.trim().split(/\r?\n/);
    if (lines.length === 0) return {};

    // Check for JSON first
    if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
        return JSON.parse(input);
    }

    const sections: any = {};
    let currentSection: string | null = null;
    let currentData: string[] = [];

    // First pass: Split into sections
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Detect section headers (e.g., "context:", "quiz[37]{...}:")
        if (line.match(/^[a-z]+(\[\d+\])?(\{.*\})?:$/)) {
            if (currentSection) {
                sections[currentSection] = parseSection(currentSection, currentData);
            }
            currentSection = line.split(':')[0].trim();
            currentData = [];
        } else if (currentSection) {
            currentData.push(line);
        }
    }
    // Process final section
    if (currentSection) {
        sections[currentSection] = parseSection(currentSection, currentData);
    }

    // Transform parsed sections into expected format
    return transformToMCQSet(sections);
}

function parseSection(header: string, lines: string[]): any {
    const name = header.split('[')[0]; // context, quiz, options

    // Key-Value pair section (YAML-like)
    if (name === "context") {
        const result: any = {};
        for (const line of lines) {
            const [key, ...rest] = line.split(':');
            if (key && rest) {
                result[key.trim()] = rest.join(':').trim();
            }
        }
        return result;
    }

    // Array section (CSV-like)
    if (name === "quiz" || name === "options") {
        // Extract existing headers from the section definition if present
        // e.g. quiz[37]{question,answer,explanation,tag} -> [question, answer, explanation, tag]
        const headerMatch = header.match(/\{([^}]+)\}/);
        const keys = headerMatch ? headerMatch[1].split(',').map(k => k.trim()) : [];

        return lines.map(line => {
            // Split by comma, respecting quotes if we were fully robust, 
            // but simple split is sufficient for this specific format example
            // Use a regex to look for commas that are not inside quotes or parentheses if needed,
            // but for simplicity and the provided format, a simple split works if no commas in content.
            // Given the content might have commas, we should be careful.
            // The provided example uses CSV style.

            // A better CSV split that handles quoted fields would be ideal, 
            // but for this specific TOON variant, let's assume standard CSV behavior or simple split.
            // Let's use a regex that handles commas inside quotes? 
            // Actually, the example: "What is JSX in React?,A JavaScript syntax extension,..."
            // It seems simple commas are separators. content with commas might be an issue without quotes.
            // Let's assume the user's format follows standard CSV rules if complexity arises.

            // For now: split by first N-1 commas? No, we don't know N if implicit. 
            // But we do know N from keys!

            if (keys.length > 0) {
                // If we have N keys, we expect N values.
                // We can split by comma, but limit to N parts? No, the last part might have commas.
                // Actually, looking at the input: "What is JSX in React?,A JavaScript syntax extension,..."
                // It seems strictly comma separated.
                const values = splitCSVLine(line);

                const obj: any = {};
                keys.forEach((key, i) => {
                    obj[key] = values[i] || "";
                });
                return obj;
            }

            // Otherwise return array of values (like for options)
            return splitCSVLine(line);
        });
    }

    return lines;
}

// Simple CSV splitter that respects quoted values
function splitCSVLine(line: string): string[] {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values;
}

function transformToMCQSet(sections: any): any {
    const context = sections["context"] || {};

    // Find the quiz section key (it might have dynamic numbering like quiz[37]...)
    const quizKey = Object.keys(sections).find(k => k.startsWith("quiz"));
    const optionsKey = Object.keys(sections).find(k => k.startsWith("options"));

    const quizItems = quizKey ? sections[quizKey] : [];
    const optionItems = optionsKey ? sections[optionsKey] : [];

    // Merge questions with their options
    const questions = quizItems.map((item: any, index: number) => {
        const itemOptions = optionItems[index] || [];

        // Handle tag splitting if "tag" field contains "Category / Difficulty"
        let patternTag = item.tag;
        if (patternTag && patternTag.includes('/')) {
            patternTag = patternTag.split('/')[0].trim();
        }

        return {
            question: item.question,
            answer: item.answer,
            explanation: item.explanation,
            pattern_tag: patternTag,
            options: itemOptions
        };
    });

    return {
        title: context.topic ? context.topic.replace(/_/g, ' ') : "Untitled Set",
        targetRounds: WOODPECKER_CONFIG.DEFAULT_TARGET_ROUNDS,
        questions: questions
    };
}

export function toTOON(data: any): string {
    if (Array.isArray(data)) {
        if (data.length === 0) return "";

        // Fallback to simple table for export if it's a simple list
        // Flatten object keys for headers
        const headers = Object.keys(data[0]);
        const headerRow = headers.join(" | ");

        const rows = data.map((item: any) => {
            return headers.map(key => {
                const val = item[key];
                if (Array.isArray(val)) {
                    return val.join("; "); // Semicolon for internal array
                }
                return String(val).replace(/\|/g, "\\|"); // Escape pipes
            }).join(" | ");
        });

        return [headerRow, ...rows].join("\n");
    }

    return JSON.stringify(data, null, 2); // Fallback
}
