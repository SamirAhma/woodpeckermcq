"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import DownloadSetButton from "./DownloadSetButton";
import AddQuestionsModal from "./AddQuestionsModal";

interface SetData {
    id: string;
    title: string;
    createdAt: string; // Standardized to string for client consistency
    isFavorite: boolean;
    _count: {
        questions: number;
    };
}

interface SetCardProps {
    set: SetData;
    onUpdate?: (updated: Partial<SetData> & { id: string }) => void;
    onDelete?: (id: string) => void;
}

export default function SetCard({ set, onUpdate, onDelete }: SetCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isFavLoading, setIsFavLoading] = useState(false);

    const toggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (isFavLoading) return;

        setIsFavLoading(true);
        const newStatus = !set.isFavorite;

        // Optimistic update
        if (onUpdate) onUpdate({ id: set.id, isFavorite: newStatus });

        try {
            await fetch(`/api/sets/${set.id}/favorite`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isFavorite: newStatus }),
            });
            // Success, state already updated optimistically
            router.refresh();
        } catch (error) {
            console.error(error);
            // Revert on error
            if (onUpdate) onUpdate({ id: set.id, isFavorite: !newStatus });
            alert("Failed to update favorite status");
        } finally {
            setIsFavLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this set? This action cannot be undone.")) return;

        setIsDeleting(true);
        try {
            const res = await fetch(`/api/sets/${set.id}`, { method: "DELETE" });
            if (res.ok) {
                if (onDelete) {
                    onDelete(set.id);
                } else {
                    router.refresh();
                }
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
        <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
            <button
                onClick={toggleFavorite}
                className={`absolute top-4 right-4 p-2 rounded-full transition-all ${set.isFavorite
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "text-slate-300 hover:text-red-400 hover:bg-slate-50"
                    }`}
                title={set.isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
                <span className={`text-xl leading-none ${isFavLoading ? "opacity-50" : ""}`}>
                    {set.isFavorite ? "❤️" : "🤍"}
                </span>
            </button>

            <div className="mb-6 pr-10">
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

                <div className="col-span-2 pt-2 border-t border-slate-100 flex gap-2">
                    <DownloadSetButton setId={set.id} title={set.title} />

                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="flex items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors gap-2 group flex-1"
                        title="Add more questions"
                    >
                        <span className="text-xl leading-none font-bold">+</span>
                        <span className="text-xs font-bold uppercase tracking-wider">Add Qs</span>
                    </button>
                </div>
            </div>

            <AddQuestionsModal
                setId={set.id}
                setTitle={set.title}
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
