"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const handleLogout = async () => {
        const resp = await fetch("/api/logout", {
            method: "POST",
        });

        if (resp.ok) {
            router.push("/login");
            router.refresh();
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-destructive transition-colors"
        >
            Logout
        </button>
    );
}
