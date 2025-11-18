"use client";

export default function AdminLogoutButton() {
  const logout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.reload();
  };
  return (
    <button className="secondary-button" onClick={logout}>
      ออกจากระบบแอดมิน
    </button>
  );
}
