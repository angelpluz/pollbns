import PollBoard from "@/components/poll-board";
import { listPolls } from "@/lib/polls";
import { getUserCookieName, getUserById } from "@/lib/auth";
import { cookies } from "next/headers";

export default async function HomePage() {
  const polls = await listPolls();
  const userId = cookies().get(getUserCookieName())?.value ?? null;
  const user = userId ? await getUserById(userId) : null;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p className="badge">UID verified poll</p>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
          Pulse check แบบ real-time ของทีมเรา
        </h1>
        <p style={{ color: "#cbd5f5", maxWidth: 640 }}>
          ลงชื่อด้วย UID (หรือ Discord ID) เพื่อผูกกับผลโหวต และดูผลรวมอัปเดตทันที
          ทุกคำถามรองรับ multi-question, multi-select ตามที่คุยกันไว้.
        </p>
      </header>

      <PollBoard polls={polls} currentUser={user} />
    </div>
  );
}
