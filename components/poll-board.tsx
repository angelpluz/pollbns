"use client";

import { useState, useTransition } from "react";
import type { PollWithStats } from "@/lib/polls";
import type { PollUser } from "@/lib/auth";
import PollCard from "./poll-card";

interface PollBoardProps {
  polls: PollWithStats[];
  currentUser: PollUser | null;
}

export default function PollBoard({ polls, currentUser }: PollBoardProps) {
  const [uid, setUid] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, startLogin] = useTransition();
  const [isLoggingOut, startLogout] = useTransition();

  const handleLogin = () => {
    setLoginError(null);
    startLogin(async () => {
      const response = await fetch("/api/auth/manual", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: uid.trim(),
          username: displayName.trim(),
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setLoginError(data.error ?? "ไม่สามารถบันทึก UID ได้");
        return;
      }
      window.location.reload();
    });
  };

  const handleLogout = () => {
    startLogout(async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.reload();
    });
  };

  return (
    <section>
      <div
        className="actions"
        style={{
          justifyContent: "space-between",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {currentUser ? (
          <>
            <div className="badge">
              <span>ล็อกอินด้วย UID:</span>
              <strong>{currentUser.displayName}</strong>
            </div>
            <button
              className="secondary-button"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? "กำลังออก" : "ออกจากระบบ"}
            </button>
          </>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
              width: "100%",
              maxWidth: 420,
            }}
          >
            <span className="status-text">
              ใส่ Discord UID ของคุณ (หรือสร้าง UID เอง) เพื่อผูกกับผลโหวต
            </span>
            <input
              type="text"
              placeholder="UID เช่น 1234567890"
              value={uid}
              onChange={(e) => setUid(e.target.value)}
              style={{
                padding: "0.6rem",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.4)",
              }}
            />
            <input
              type="text"
              placeholder="ชื่อที่อยากให้แสดง (ไม่บังคับ)"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              style={{
                padding: "0.6rem",
                borderRadius: 8,
                border: "1px solid rgba(148,163,184,0.2)",
              }}
            />
            <div className="actions" style={{ justifyContent: "flex-start" }}>
              <button
                className="primary-button"
                onClick={handleLogin}
                disabled={isLoggingIn || !uid.trim()}
              >
                {isLoggingIn ? "กำลังบันทึก..." : "ผูก UID และเข้าสู่ระบบ"}
              </button>
              {loginError && (
                <span className="status-text" style={{ color: "#fca5a5" }}>
                  {loginError}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card-grid">
        {polls.map((poll) => (
          <PollCard key={poll.id} poll={poll} currentUser={currentUser} />
        ))}
      </div>
    </section>
  );
}
