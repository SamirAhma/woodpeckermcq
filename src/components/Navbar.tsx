"use client";

import Link from "next/link";
import { useState } from "react";
import LogoutButton from "./LogoutButton";
import CreateSetModal from "./CreateSetModal";

export default function Navbar() {
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    return (
        <>
            <nav className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16 gap-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
                                W
                            </div>
                            <span className="font-bold text-xl tracking-tight hidden sm:block">Woodpecker</span>
                        </Link>

                        <div className="flex-1" />

                        {/* Right Actions */}
                        <div className="flex items-center gap-3 flex-shrink-0">
                            <Link
                                href="/"
                                className="flex items-center gap-1 px-3 py-2 text-sm font-semibold text-slate-700 hover:text-primary transition-colors"
                            >
                                🏠 <span className="hidden sm:inline">Home</span>
                            </Link>

                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-sm font-semibold rounded-full hover:bg-purple-600 transition-all shadow-sm hover:shadow-md active:scale-95"
                            >
                                <span>+</span> Create
                            </button>

                            {/* Mobile Create Icon */}
                            <button
                                onClick={() => setIsCreateOpen(true)}
                                className="sm:hidden w-10 h-10 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-sm hover:bg-purple-600 transition-all"
                            >
                                +
                            </button>

                            <div className="h-6 w-px bg-slate-200 mx-1"></div>

                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            <CreateSetModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </>
    );
}
