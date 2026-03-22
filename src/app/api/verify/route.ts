import { NextRequest, NextResponse } from "next/server";
import { getInternById } from "@/data/interns";

export async function POST(request: NextRequest) {
  try {
    const { internId, accessKey } = await request.json();

    if (!internId || !accessKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const intern = getInternById(internId);
    if (!intern) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (new Date(intern.accessExpires).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Access expired" }, { status: 403 });
    }

    if (accessKey !== intern.accessKey) {
      return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      credentials: intern.credentials,
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
