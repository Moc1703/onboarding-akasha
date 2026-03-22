import { NextRequest, NextResponse } from "next/server";
import { getIntern } from "@/lib/get-interns";
import type { InternCredential } from "@/data/interns";

function getCredentialsFromEnv(): InternCredential[] {
  const account = process.env.ONBOARD_1P_ACCOUNT;
  const password = process.env.ONBOARD_1P_PASSWORD;
  const secretKey = process.env.ONBOARD_1P_SECRET_KEY;

  if (!account || !password || !secretKey) return [];

  return [
    { label: "Account", value: account, sensitive: false },
    { label: "Password", value: password, sensitive: true },
    { label: "Secret Key", value: secretKey, sensitive: true },
  ];
}

export async function POST(request: NextRequest) {
  try {
    const { internId, accessKey } = await request.json();

    if (!internId || !accessKey) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const intern = await getIntern(internId);
    if (!intern) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (new Date(intern.accessExpires).getTime() <= Date.now()) {
      return NextResponse.json({ error: "Access expired" }, { status: 403 });
    }

    if (accessKey !== intern.accessKey) {
      return NextResponse.json({ error: "Invalid access key" }, { status: 401 });
    }

    const credentials = intern.credentials.length > 0
      ? intern.credentials
      : getCredentialsFromEnv();

    return NextResponse.json({
      success: true,
      credentials,
    });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
