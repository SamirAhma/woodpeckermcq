"use client";

import { useState } from "react";
import SetCard from "./SetCard";

interface SetData {
    id: string;
    title: string;
    targetRounds: number;
    isFavorite: boolean;
    createdAt: string; // Serialized date
    _count: {
        questions: number;
    };
}

interface SetListProps {
    initialSets: SetData[];
}

export default function SetList({ initialSets }: SetListProps) {
    const [sets, setSets] = useState<SetData[]>(initialSets);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState<'all' | 'favorites'>('all');

    const handleUpdateSet = (updatedSet: Partial<SetData> & { id: string }) => {
        setSets(prev => prev.map(s => s.id === updatedSet.id ? { ...s, ...updatedSet } : s));
    };

    const handleDeleteSet = (id: string) => {
        setSets(prev => prev.filter(s => s.id !== id));
    };

    const filteredSets = sets.filter(set => {
        const matchesSearch = set.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || (filter === 'favorites' && set.isFavorite);
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl border shadow-sm">
                <div className="relative w-full sm:w-96">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Search sets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border rounded-lg focus:ring-2 focus:ring-primary outline-none transition-all"
                    />
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('favorites')}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all flex items-center gap-1 ${filter === 'favorites'
                                ? 'bg-white text-red-600 shadow-sm'
                                : 'text-slate-500 hover:text-red-500'
                            }`}
                    >
                        <span>♥</span> Favorites
                    </button>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredSets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed bg-slate-50/50">
                        {sets.length === 0
                            ? "No sets found. Upload a JSON to get started."
                            : "No sets match your search."}
                    </div>
                ) : (
                    filteredSets.map((set) => (
                        <SetCard
                            key={set.id}
                            set={set}
                            onUpdate={handleUpdateSet}
                            onDelete={handleDeleteSet}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
