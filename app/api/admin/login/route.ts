import { NextResponse } from "next/server";
import { getAdminCookieName, validateAdminPassword } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";

  if (!password) {
    return NextResponse.json({ error: "กรุณากรอกรหัสผ่าน" }, { status: 400 });
  }

  try {
    if (!validateAdminPassword(password)) {
      return NextResponse.json({ error: "รหัสผ่านไม่ถูกต้อง" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ยังไม่ได้ตั้งค่า ADMIN_DASHBOARD_PASSWORD" },
      { status: 500 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60,
  });
  return response;
}
