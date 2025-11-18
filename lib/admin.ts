import { cookies } from "next/headers";

const ADMIN_COOKIE = process.env.ADMIN_COOKIE_NAME ?? "poll_admin_session";

export const getAdminCookieName = () => ADMIN_COOKIE;

export const isAdminAuthenticated = async () => {
  const store = await cookies();
  const flag = store.get(ADMIN_COOKIE)?.value;
  return flag === "1";
};

export const validateAdminPassword = (password: string) => {
  const expected = process.env.ADMIN_DASHBOARD_PASSWORD;
  if (!expected) {
    throw new Error("ยังไม่ได้ตั้งค่า ADMIN_DASHBOARD_PASSWORD");
  }
  return password === expected;
};
