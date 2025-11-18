import { NextResponse } from "next/server";
import { listPolls } from "@/lib/polls";

export const dynamic = "force-dynamic";

export async function GET() {
  const polls = await listPolls();
  return NextResponse.json(polls);
}
