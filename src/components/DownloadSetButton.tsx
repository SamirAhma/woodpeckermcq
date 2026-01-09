"use client";

import { useState } from "react";

interface DownloadSetButtonProps {
    setId: string;
    title: string;
}

export default function DownloadSetButton({ setId, title }: DownloadSetButtonProps) {
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

    return (
        <div className="flex gap-2 mt-4">
            <button
                onClick={() => handleDownload("toon")}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-100 rounded-md hover:bg-emerald-200 transition-colors disabled:opacity-50"
            >
                {loading ? "..." : "Download TOON"}
            </button>
            <button
                onClick={() => handleDownload("json")}
                disabled={loading}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50"
            >
                {loading ? "..." : "Download JSON"}
            </button>
        </div>
    );
}
