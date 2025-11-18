import { NextResponse } from "next/server";
import { getPoll } from "@/lib/polls";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  context: { params: { pollId: string } },
) {
  const poll = await getPoll(context.params.pollId);
  if (!poll) {
    return NextResponse.json(
      { error: "ไม่พบ poll ที่ขอ" },
      { status: 404 },
    );
  }
  return NextResponse.json(poll);
}
