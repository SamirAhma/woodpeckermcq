import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await req.json();

        // Allow explicit setting or toggling if implementation desires, 
        // but simple boolean `isFavorite` in body is best.
        const { isFavorite } = body;

        if (typeof isFavorite !== 'boolean') {
            return NextResponse.json({ error: "isFavorite must be a boolean" }, { status: 400 });
        }

        const updatedSet = await prisma.mCQSet.update({
            where: { id },
            data: { isFavorite }
        });

        return NextResponse.json(updatedSet);
    } catch (error) {
        console.error("Favorite toggle error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
