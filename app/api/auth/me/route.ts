import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserById, getUserCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const userId = cookies().get(getUserCookieName())?.value ?? null;
  const user = userId ? await getUserById(userId) : null;
  return NextResponse.json({ user });
}
