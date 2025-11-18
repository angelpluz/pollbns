import { NextResponse } from "next/server";
import { getPoll } from "@/lib/polls";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: Promise<{ pollId: string }> },
) {
  const { pollId } = await context.params;
  const poll = await getPoll(pollId);
  if (!poll) {
    return NextResponse.json(
      { error: "ไม่พบ poll ที่ขอ" },
      { status: 404 },
    );
  }
  return NextResponse.json(poll);
}
