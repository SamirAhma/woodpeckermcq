"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WOODPECKER_CONFIG } from "@/lib/config";

interface SetUploadFormProps {
    onSuccess?: () => void;
}

export default function SetUploadForm({ onSuccess }: SetUploadFormProps) {
    const [title, setTitle] = useState("");
    const [targetRounds, setTargetRounds] = useState<number>(WOODPECKER_CONFIG.DEFAULT_TARGET_ROUNDS);
    const [input, setInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpload = async () => {
        setError(null);
        setLoading(true);

        try {
            // Determine content type
            const isJson = input.trim().startsWith('[') || input.trim().startsWith('{');
            const contentType = isJson ? "application/json" : "text/plain";

            let body: any = input;

            if (isJson) {
                try {
                    const parsed = JSON.parse(input);
                    // Legacy wrapper support for full JSON object uploads
                    if (!Array.isArray(parsed) && parsed.questions) {
                        body = JSON.stringify({ ...parsed, title: title || parsed.title, targetRounds });
                    } else if (Array.isArray(parsed)) {
                        body = JSON.stringify({
                            title,
                            targetRounds,
                            questions: parsed
                        });
                    }
                } catch (e) {
                    // Not valid JSON, treat as text/plain if needed, or let API fail
                }
            } else {
                // For TOON, inject title if missing from context
                if (!input.includes("context:")) {
                    body = `context:\n  topic: ${title.replace(/ /g, '_')}\n\n${input}`;
                }
            }

            const response = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": contentType },
                body: body,
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.details) {
                    const fieldErrors = data.details._errors || [];
                    const questionErrors = data.details.questions?._errors || [];
                    throw new Error(`Validation failed: ${fieldErrors.concat(questionErrors).join(", ")}`);
                }
                throw new Error(data.error || "Upload failed");
            }

            setInput("");
            setTitle("");
            setTargetRounds(WOODPECKER_CONFIG.DEFAULT_TARGET_ROUNDS);
            router.refresh();
            alert("Set created successfully!");
            if (onSuccess) onSuccess();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                        Set Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., React Advanced Patterns"
                        className="w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                        Target Rounds
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={targetRounds}
                        onChange={(e) => setTargetRounds(parseInt(e.target.value))}
                        className="w-full p-3 bg-background border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                    Questions Data (JSON or TOON)
                </label>
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Paste JSON or TOON content here..."
                    className="w-full h-48 p-4 bg-background border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                />
            </div>

            <div className="bg-slate-50 p-4 rounded-lg border text-sm text-slate-600">
                <details>
                    <summary className="font-semibold cursor-pointer hover:text-primary transition-colors">Supported Formats (Click to expand)</summary>
                    <div className="mt-4 space-y-4">
                        <div>
                            <p className="font-semibold text-slate-800 mb-1">1. Full JSON</p>
                            <pre className="bg-white p-2 border rounded overflow-x-auto text-xs">
                                {`[
  {
    "question": "What is React?",
    "options": ["Library", "Framework", "Language"],
    "answer": "Library",
    "explanation": "React is a JS library.",
    "patternTag": "Basics"
  }
]`}
                            </pre>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-800 mb-1">2. Minified JSON (Compact)</p>
                            <pre className="bg-white p-2 border rounded overflow-x-auto text-xs">
                                {`[
  {"q":"What is React?","o":["Library","Framework"],"a":"Library","e":"JS lib","t":"Basics"}
]`}
                            </pre>
                            <p className="text-xs mt-1 text-slate-500">Keys: q=question, o=options, a=answer, e=explanation, t=tag</p>
                        </div>

                        <div>
                            <p className="font-semibold text-slate-800 mb-1">3. TOON (Token-Oriented Object Notation)</p>
                            <pre className="bg-white p-2 border rounded overflow-x-auto text-xs">
                                {`context:
  topic: React_Basics
  
quiz:
  What is React?,Library,React is a JS library.,Basics
  
options:
  Library,Framework,Language`}
                            </pre>
                            <p className="text-xs mt-1 text-slate-500">Best for LLM generation. Use context for metadata.</p>
                        </div>
                    </div>
                </details>
            </div>

            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={loading || !input.trim()}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:shadow-xl disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {loading ? "Processing..." : "Initialize Woodpecker Set"}
            </button>
        </div>
    );
}
