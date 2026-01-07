import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const response = NextResponse.json({ success: true });

    // Clear cookie
    response.cookies.set("auth_session", "", {
        httpOnly: true,
        path: "/",
        maxAge: 0
    });

    return response;
}
