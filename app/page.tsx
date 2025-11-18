import PollBoard from "@/components/poll-board";
import { listPolls } from "@/lib/polls";
import { getUserCookieName, getUserById } from "@/lib/auth";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const polls = await listPolls();
  const survey = polls.find((poll) => poll.id === "bns-reds-feedback");
  const cookieStore = await cookies();
  const userId = cookieStore.get(getUserCookieName())?.value ?? null;
  const user = userId ? await getUserById(userId) : null;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", paddingBottom: "4rem" }}>
      <header style={{ marginBottom: "2rem" }}>
        <p className="badge">UID verified poll</p>
        <h1 style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>
          แบบสอบถาม BNS REDS
        </h1>
        <p style={{ color: "#cbd5f5", maxWidth: 640 }}>
          ใส่ UID (เช่น Discord UID หรือรหัสที่ทีมงานแจกให้) เพื่อผูกผลโหวตกับตัวเอง
          แบบสอบถามนี้รองรับทั้งเลือกหลายข้อและตอบเป็นข้อความ
        </p>
      </header>

      {survey ? (
        <PollBoard polls={[survey]} currentUser={user} />
      ) : (
        <p style={{ color: "#fca5a5" }}>ไม่พบแบบสอบถามในระบบ</p>
      )}
    </div>
  );
}
