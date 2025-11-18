import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserVote } from "@/lib/polls";
import { getUserCookieName, getUserById } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ pollId: string }> },
) {
  const { pollId } = await context.params;
  const cookieStore = await cookies();
  const userId = cookieStore.get(getUserCookieName())?.value ?? null;
  if (!userId) {
    return NextResponse.json({ vote: null });
  }
  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ vote: null });
  }
  const vote = await getUserVote(pollId, user.id);
  return NextResponse.json({ vote });
}
