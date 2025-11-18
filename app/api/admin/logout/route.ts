import { NextResponse } from "next/server";
import { getAdminCookieName } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(getAdminCookieName(), "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
