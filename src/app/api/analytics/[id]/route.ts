import { NextRequest, NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: setId } = await params;
        const data = await getAnalytics(setId);

        if (!data) {
            return NextResponse.json({ error: "Set not found" }, { status: 404 });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("Analytics error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", message: error.message },
            { status: 500 }
        );
    }
}
    } catch (error: any) {
    console.error("Analytics error:", error);
    return NextResponse.json(
        { error: "Internal Server Error", message: error.message },
        { status: 500 }
    );
}
}
