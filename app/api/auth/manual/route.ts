import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserCookieName, getUserById, upsertUserProfile } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const rawId = body?.userId ? String(body.userId) : "";
  const username = body?.username ? String(body.username) : "";

  if (!rawId.trim()) {
    return NextResponse.json(
      { error: "กรุณาระบุ UID ของคุณ" },
      { status: 400 },
    );
  }

  if (!/^[0-9A-Za-z_-]+$/.test(rawId.trim())) {
    return NextResponse.json(
      { error: "UID ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น" },
      { status: 400 },
    );
  }

  await upsertUserProfile(rawId, username || rawId);
  const user = await getUserById(rawId);

  const response = NextResponse.json({ user });
  response.cookies.set(getUserCookieName(), user!.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}
