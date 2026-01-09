"use client";

import { useState, useEffect } from "react";
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


    const formatRestTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        if (h > 0) return `${h}h ${m}m`;
        if (m > 0) return `${m}m ${s}s`;
        return `${s}s`;
    };

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
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    // Close menu when clicking outside
    const toggleMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <div className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-all group relative flex flex-col h-full border-slate-200">

            {/* Header / Meta */}
            <div className="p-6 pb-20 flex-1">
                <div className="flex justify-between items-start mb-2 pr-16">
                    <h3 className="text-lg font-bold leading-tight group-hover:text-primary transition-colors line-clamp-2 text-slate-900">
                        {set.title}
                    </h3>
                    <button
                        onClick={toggleFavorite}
                        className={`p-1.5 rounded-full transition-all flex-shrink-0 ml-2 ${set.isFavorite
                            ? "text-red-500 bg-red-50"
                            : "text-slate-300 hover:text-red-400 hover:bg-slate-50"
                            }`}
                    >
                        {set.isFavorite ? "❤️" : "🤍"}
                    </button>
                </div>

                <p className="text-xs text-slate-500 font-medium flex items-center gap-2 mb-4">
                    <span className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                        {set._count.questions} Qs
                    </span>
                    <span>•</span>
                    {new Date(set.createdAt).toLocaleDateString()}
                </p>
            </div>

            {/* Bottom Actions Area */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-slate-50/50 border-t border-slate-100 rounded-b-xl flex items-center gap-2">
                <Link
                    href={`/study/${set.id}`}
                    className="w-full py-3 px-4 bg-gradient-to-r from-primary to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                    Start
                </Link>
                <Link
                    href={`/analytics/${set.id}`}
                    className="px-3 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors"
                    title="Analytics"
                >
                    📊
                </Link>

                {/* More Menu */}
                <div className="relative">
                    <button
                        onClick={toggleMenu}
                        className={`w-10 h-10 flex items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors ${isMenuOpen ? 'bg-slate-100 ring-2 ring-slate-200' : ''}`}
                    >
                        ⋮
                    </button>

                    {isMenuOpen && (
                        <>
                            <div className="fixed inset-0 z-10" onClick={() => setIsMenuOpen(false)} />
                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-20 overflow-hidden animate-in zoom-in-95 duration-200">
                                <div className="p-1">
                                    <button
                                        onClick={() => { setIsAddModalOpen(true); setIsMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-md flex items-center gap-2"
                                    >
                                        <span>➕</span> Add Questions
                                    </button>
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <DownloadSetButton setId={set.id} title={set.title} variant="menu" />
                                    <div className="h-px bg-slate-100 my-1"></div>
                                    <button
                                        onClick={() => { handleDelete(); setIsMenuOpen(false); }}
                                        className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md flex items-center gap-2"
                                    >
                                        <span>🗑️</span> Delete Set
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
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
