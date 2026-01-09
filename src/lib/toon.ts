/**
 * Token-Oriented Object Notation (TOON) Parser & Generator
 *
 * TOON matches JSON's data model but minimizes tokens.
 * Key features:
 * - YAML-style indentation for hierarchy (no braces/brackets)
 * - CSV-style layout for uniform arrays (headers + rows)
 */

export function parseTOON(input: string): any {
    // Basic implementation: Since TOON is "YAML-like" with CSV arrays,
    // we'll implement a heuristic parser focused on the user's likely use case:
    // Arrays of objects (MCQ sets).

    const lines = input.trim().split(/\r?\n/);
    if (lines.length === 0) return [];

    // Auto-detect CSV-style uniform array (common for MCQ lists)
    if (lines[0].includes("|") || lines[0].includes(",")) {
        return parseTable(lines);
    }

    // Fallback: If it looks more like YAML/Indented, we'd need a full parser.
    // For now, let's focus on the table format likely used for MCQs.
    // If the user pasted JSON, handle it gracefully
    if (input.trim().startsWith('[') || input.trim().startsWith('{')) {
        return JSON.parse(input);
    }

    throw new Error("Unsupported TOON format. Please use a tabular format for arrays.");
}

function parseTable(lines: string[]): any[] {
    const separator = lines[0].includes("|") ? "|" : ",";
    const headers = lines[0].split(separator).map(h => h.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = line.split(separator).map(v => v.trim());
        const obj: any = {};

        headers.forEach((header, index) => {
            // Handle array fields (like options) which might be separated by semicolons
            let value = values[index];
            if (header === 'options' && value) {
                obj[header] = value.split(';').map(o => o.trim());
            } else {
                obj[header] = value;
            }
        });

        result.push(obj);
    }

    return result;
}

export function toTOON(data: any): string {
    if (Array.isArray(data)) {
        if (data.length === 0) return "";

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
