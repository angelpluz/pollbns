"use client";

import { useState, useTransition } from "react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setError(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");
        return;
      }
      window.location.reload();
    });
  };

  return (
    <div className="poll-card" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>เข้าสู่ระบบแอดมิน</h2>
      <p className="status-text">กรอกรหัสผ่านสำหรับ dashboard เพื่อตรวจสอบผลสำรวจ</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Admin password"
        style={{
          width: "100%",
          marginTop: "1rem",
          padding: "0.6rem",
          borderRadius: 10,
          border: "1px solid rgba(148,163,184,0.4)",
          background: "rgba(15,23,42,0.6)",
          color: "#f8fafc",
        }}
      />
      {error && (
        <div className="alert alert-error" style={{ marginTop: "0.75rem" }}>
          {error}
        </div>
      )}
      <button
        className="primary-button"
        style={{ marginTop: "1rem", width: "100%" }}
        onClick={submit}
        disabled={isPending || !password.trim()}
      >
        {isPending ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}
      </button>
    </div>
  );
}
