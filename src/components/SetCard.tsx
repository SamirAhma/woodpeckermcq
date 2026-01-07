"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
    const [rounds, setRounds] = useState("7");
    const router = useRouter();

    const handleStart = () => {
        router.push(`/study/${set.id}?rounds=${rounds}`);
    };

    return (
        <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
            <div>
                <h3 className="font-medium">{set.title}</h3>
                <p className="text-sm text-muted-foreground">
                    {set._count.questions} questions • {new Date(set.createdAt).toLocaleDateString()}
                </p>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => router.push(`/analytics/${set.id}`)}
                    className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80"
                >
                    Analytics
                </button>
                <button
                    onClick={handleStart}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
                >
                    Start Woodpecker
                </button>
            </div>
        </div>
    );
}
