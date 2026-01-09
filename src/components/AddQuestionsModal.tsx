"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AddQuestionsModalProps {
    setId: string;
    setTitle: string;
    isOpen: boolean;
    onClose: () => void;
}

export default function AddQuestionsModal({ setId, setTitle, isOpen, onClose }: AddQuestionsModalProps) {
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    if (!isOpen) return null;

    const handleAdd = async () => {
        setError(null);
        setLoading(true);

        try {
            // We send raw text, the API parser handles detection (JSON/TOON)
            const response = await fetch(`/api/sets/${setId}/questions`, {
                method: "POST",
                headers: { "Content-Type": "text/plain" },
                body: input,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Failed to add questions");
            }

            alert(data.message);
            setInput("");
            onClose();
            router.refresh();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background w-full max-w-2xl rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Add Questions</h2>
                        <p className="text-sm text-muted-foreground">Appending to: {setTitle}</p>
                    </div>
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <p className="text-sm text-slate-600">
                        Paste new questions below. Supported formats:
                        <span className="font-mono text-xs bg-slate-100 px-1 mx-1 rounded">JSON</span>
                        <span className="font-mono text-xs bg-slate-100 px-1 mx-1 rounded">Minified</span>
                        <span className="font-mono text-xs bg-slate-100 px-1 mx-1 rounded">TOON</span>
                    </p>

                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Paste additional questions here..."
                        className="w-full h-64 p-4 bg-slate-50 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    />

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-lg text-sm">
                            {error}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t bg-slate-50/50 flex justify-end gap-2 rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleAdd}
                        disabled={loading || !input.trim()}
                        className="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition-all active:scale-95"
                    >
                        {loading ? "Adding..." : "Append Questions"}
                    </button>
                </div>
            </div>
        </div>
    );
}
