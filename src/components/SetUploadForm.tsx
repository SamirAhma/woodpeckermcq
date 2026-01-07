"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SetUploadForm() {
    const [title, setTitle] = useState("");
    const [targetRounds, setTargetRounds] = useState(7);
    const [jsonInput, setJsonInput] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleUpload = async () => {
        setError(null);
        setLoading(true);

        try {
            let questions;
            try {
                questions = JSON.parse(jsonInput);
                if (!Array.isArray(questions)) {
                    throw new Error("JSON must be an array of questions.");
                }
            } catch (e: any) {
                throw new Error(e.message || "Invalid JSON format. Please check your syntax.");
            }

            const response = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    targetRounds,
                    questions
                }),
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

            setJsonInput("");
            setTitle("");
            setTargetRounds(7);
            router.refresh();
            alert("Set created successfully!");
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
                    Questions JSON Array
                </label>
                <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    placeholder='Paste your JSON data here (e.g., [{"question": "...", "options": [...], "answer": "..."}])'
                    className="w-full h-48 p-4 bg-background border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                />
            </div>

            {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                    <strong>Error:</strong> {error}
                </div>
            )}

            <button
                onClick={handleUpload}
                disabled={loading || !jsonInput.trim() || !title.trim()}
                className="w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl text-lg hover:shadow-xl disabled:opacity-50 transition-all active:scale-[0.98]"
            >
                {loading ? "Creating Set..." : "Initialize Woodpecker Set"}
            </button>
        </div>
    );
}
