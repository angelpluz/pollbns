import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserVote } from "@/lib/polls";
import { getUserCookieName, getUserById } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: { pollId: string } },
) {
  const userId = cookies().get(getUserCookieName())?.value ?? null;
  if (!userId) {
    return NextResponse.json({ vote: null });
  }
  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json({ vote: null });
  }
  const vote = await getUserVote(context.params.pollId, user.id);
  return NextResponse.json({ vote });
}
