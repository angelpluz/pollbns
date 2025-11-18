import { NextResponse } from "next/server";
import { getUserCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = NextResponse.json({ loggedOut: true });
  response.cookies.set(getUserCookieName(), "", {
    path: "/",
    maxAge: 0,
  });
  return response;
}
