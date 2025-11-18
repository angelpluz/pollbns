import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { submitVote, PollError, type QuestionAnswer } from "@/lib/polls";
import { getUserCookieName, getUserById } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  context: { params: { pollId: string } },
) {
  const userId = cookies().get(getUserCookieName())?.value ?? null;
  if (!userId) {
    return NextResponse.json(
      { error: "กรุณาเข้าสู่ระบบด้วย UID ก่อน" },
      { status: 401 },
    );
  }

  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json(
      { error: "ไม่พบ UID นี้ในระบบ" },
      { status: 401 },
    );
  }

  let payload: QuestionAnswer[];
  try {
    payload = (await request.json()) as QuestionAnswer[];
  } catch (error) {
    return NextResponse.json(
      { error: "body ต้องเป็น JSON" },
      { status: 400 },
    );
  }

  try {
    const poll = await submitVote(context.params.pollId, user.id, payload);
    if (!poll) {
      return NextResponse.json(
        { error: "ไม่พบ poll นี้" },
        { status: 404 },
      );
    }
    return NextResponse.json({ poll, submittedBy: user });
  } catch (error) {
    if (error instanceof PollError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }
    throw error;
  }
}
