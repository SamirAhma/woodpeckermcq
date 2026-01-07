import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { username, password } = await req.json();

        if (username === "madin" && password === "4321") {
            const response = NextResponse.json({ success: true });

            // Set cookie for 7 days
            response.cookies.set("auth_session", "true", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7
            });

            return response;
        }

        return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    } catch (e) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
