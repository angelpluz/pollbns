import AdminLogin from "@/components/admin-login";
import AdminLogoutButton from "@/components/admin-logout-button";
import { isAdminAuthenticated } from "@/lib/admin";
import { getTextAnswers, listPolls, type TextAnswer } from "@/lib/polls";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const authed = await isAdminAuthenticated();
  const polls = await listPolls();
  const poll = polls.find((p) => p.id === "bns-reds-feedback");

  if (!authed) {
    return (
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "4rem 1rem" }}>
        <AdminLogin />
      </div>
    );
  }

  if (!poll) {
    return <div style={{ color: "#fca5a5" }}>ไม่พบแบบสอบถาม</div>;
  }

  const textAnswers = await getTextAnswers(poll.id);
  const groupedText = new Map<string, { question: string; answers: TextAnswer[] }>();
  textAnswers.forEach((answer) => {
    if (!groupedText.has(answer.questionId)) {
      groupedText.set(answer.questionId, { question: answer.questionText, answers: [] });
    }
    groupedText.get(answer.questionId)!.answers.push(answer);
  });

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2rem 1rem 4rem" }}>
      <header style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
        <div>
          <p className="badge">Dashboard BNS REDS</p>
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>สรุปผลแบบสอบถาม</h1>
          <p style={{ color: "#cbd5f5" }}>ตอบแล้วทั้งหมด {poll.totalResponses} คน</p>
        </div>
        <AdminLogoutButton />
      </header>

      {poll.questions.map((question) => (
        <section key={question.id} className="poll-card" style={{ marginBottom: "1.5rem" }}>
          <h2>{question.text}</h2>
          {question.responseKind === "text" ? (
            <div style={{ marginTop: "0.75rem" }}>
              {groupedText.get(question.id)?.answers.length ? (
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {groupedText.get(question.id)!.answers.map((answer) => (
                    <li
                      key={`${answer.id}-${answer.userId}`}
                      style={{
                        marginBottom: "0.75rem",
                        padding: "0.75rem 1rem",
                        borderRadius: 10,
                        background: "rgba(15,23,42,0.7)",
                        border: "1px solid rgba(148,163,184,0.2)",
                      }}
                    >
                      <p style={{ margin: 0 }}>{answer.answerText}</p>
                      <small style={{ color: "#94a3b8" }}>
                        UID: {answer.userId} • {answer.submittedAt.toLocaleString()}
                      </small>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="status-text">ยังไม่มีคำตอบข้อความ</p>
              )}
            </div>
          ) : (
            <div style={{ marginTop: "0.75rem" }}>
              {question.options.map((option) => (
                <div
                  key={option.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0.4rem 0.5rem",
                    borderBottom: "1px solid rgba(148,163,184,0.1)",
                  }}
                >
                  <span>{option.text}</span>
                  <span className="badge">{option.votes} โหวต</span>
                </div>
              ))}
            </div>
          )}
        </section>
      ))}
    </div>
  );
}
