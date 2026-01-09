"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DownloadSetButton from "./DownloadSetButton";

interface SetCardProps {
    set: {
        id: string;
        title: string;
        createdAt: Date;
        _count: {
            questions: number;
        };
    };
}

export default function SetCard({ set }: SetCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this set? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/sets/${set.id}`, { method: "DELETE" });
            if (res.ok) {
                router.refresh();
            } else {
                alert("Failed to delete set");
            }
        } catch (e) {
            console.error(e);
            alert("Error deleting set");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-1 group-hover:text-purple-700 transition-colors">
                    {set.title}
                </h3>
                <p className="text-sm text-slate-500 font-medium flex items-center gap-2">
                    <span className="inline-block px-2 py-0.5 bg-slate-100 rounded text-slate-600 text-xs">
                        {set._count.questions} questions
                    </span>
                    <span>•</span>
                    {new Date(set.createdAt).toLocaleDateString()}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <Link
                    href={`/study/${set.id}`}
                    className="col-span-2 py-2.5 bg-slate-900 hover:bg-purple-700 text-white font-semibold rounded-lg text-center transition-colors shadow-sm"
                >
                    Start Woodpecker
                </Link>

                <Link
                    href={`/analytics/${set.id}`}
                    className="py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium rounded-lg text-center text-sm transition-colors"
                >
                    Analytics
                </Link>

                <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="py-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-medium rounded-lg text-center text-sm transition-colors disabled:opacity-50"
                >
                    {isDeleting ? "..." : "Delete Set"}
                </button>

                <div className="col-span-2 pt-2 border-t border-slate-100">
                    <DownloadSetButton setId={set.id} title={set.title} />
                </div>
            </div>
        </div>
    );
}
