import { cookies } from "next/headers";
import type { RowDataPacket } from "mysql2";
import { getPool } from "./db";

export type PollUser = {
  id: string;
  username: string;
  displayName: string;
};

const COOKIE_NAME = process.env.USER_COOKIE_NAME ?? "poll_user_id";

export const getUserCookieName = () => COOKIE_NAME;

export const readUserIdFromCookies = () => {
  return cookies().get(COOKIE_NAME)?.value ?? null;
};

export const upsertUserProfile = async (id: string, username: string) => {
  const cleanId = id.trim();
  const cleanUsername = username.trim() || cleanId;

  await getPool().query(
    `
      INSERT INTO discord_users (id, username, global_name)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE
        username = VALUES(username),
        global_name = VALUES(global_name),
        updated_at = CURRENT_TIMESTAMP
    `,
    [cleanId, cleanUsername, cleanUsername],
  );
};

export const getUserById = async (id: string): Promise<PollUser | null> => {
  const [rows] = await getPool().query<RowDataPacket[]>(
    "SELECT id, username, COALESCE(global_name, username) AS display_name FROM discord_users WHERE id = ?",
    [id],
  );

  if (!rows.length) {
    return null;
  }

  const row = rows[0];
  return {
    id: row.id.toString(),
    username: row.username as string,
    displayName: row.display_name as string,
  };
};
