"use client";

import { useState } from "react";

interface DownloadSetButtonProps {
    setId: string;
    title: string;
    variant?: "buttons" | "menu";
}

export default function DownloadSetButton({ setId, title, variant = "buttons" }: DownloadSetButtonProps) {
    const [loading, setLoading] = useState(false);

    const handleDownload = async (format: "json" | "toon") => {
        setLoading(true);
        try {
            const res = await fetch(`/api/export/${setId}?format=${format}`);
            if (!res.ok) throw new Error("Download failed");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${title.replace(/\s+/g, "_")}.${format}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download set.");
        } finally {
            setLoading(false);
        }
    };

    if (variant === "menu") {
        return (
            <>
                <button
                    onClick={() => handleDownload("toon")}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-md flex items-center gap-2"
                >
                    <span>📥</span> Download TOON
                </button>
                <button
                    onClick={() => handleDownload("json")}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-md flex items-center gap-2"
                >
                    <span>📥</span> Download JSON
                </button>
            </>
        );
    }

    return (
        <div className="grid grid-cols-2 gap-3">
            <button
                onClick={() => handleDownload("toon")}
                disabled={loading}
                className="w-full py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
                Download TOON
            </button>
            <button
                onClick={() => handleDownload("json")}
                disabled={loading}
                className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
            >
                Download JSON
            </button>
        </div>
    );
}
