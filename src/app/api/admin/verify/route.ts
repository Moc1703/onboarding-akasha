import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    try {
        const { secret } = await request.json();
        const adminSecret = process.env.ADMIN_SECRET;

        if (!adminSecret) {
            return NextResponse.json(
                { error: "ADMIN_SECRET not configured on the server." },
                { status: 503 }
            );
        }

        if (!secret || secret !== adminSecret) {
            return NextResponse.json({ error: "Invalid secret" }, { status: 401 });
        }

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
}
