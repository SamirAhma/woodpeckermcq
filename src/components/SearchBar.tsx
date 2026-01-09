"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { WOODPECKER_CONFIG } from "@/lib/config";
import { useEffect, useState, useTransition } from "react";

export default function SearchBar() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [text, setText] = useState(searchParams.get("q") || "");
    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (text) {
                params.set("q", text);
            } else {
                params.delete("q");
            }
            startTransition(() => {
                router.replace(`/?${params.toString()}`);
            });
        }, WOODPECKER_CONFIG.AUTO_ADVANCE_DELAY_MS);

        return () => clearTimeout(timeoutId);
    }, [text, router, searchParams]); // Warning: searchParams dependency might cause loops if not careful, but toString() creates new instance.
    // Ideally we only depend on text, but we need current params to preserve other filters if any.

    return (
        <div className="relative w-full max-w-md hidden md:block">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
            <input
                type="text"
                placeholder="Search sets..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-100 border-none rounded-full focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm"
            />
        </div>
    );
}
