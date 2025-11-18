import mysql from "mysql2/promise";

type DbConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
};

const getConfig = (): DbConfig => {
  const host = process.env.DB_HOST;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME;
  const port = process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306;

  if (!host || !user || !password || !database) {
    throw new Error("Database environment variables are missing");
  }

  return { host, user, password, database, port };
};

let pool: mysql.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    const config = getConfig();
    pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 5,
      supportBigNumbers: true,
      bigNumberStrings: true,
      timezone: "Z",
    });
  }
  return pool;
};

export const withConnection = async <T>(
  fn: (conn: mysql.PoolConnection) => Promise<T>,
) => {
  const conn = await getPool().getConnection();
  try {
    return await fn(conn);
  } finally {
    conn.release();
  }
};
