import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import fs from "fs";
import path from "path";

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

let prisma: any;

const connectionString = process.env.DATABASE_URL;

if (process.env.NODE_ENV === "production") {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set in environment variables.");
  }
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });
} else {
  // In development, mock the client to read/write data/local_db.json
  const LOCAL_DB_PATH = path.join(process.cwd(), "data", "local_db.json");

  const readLocalDb = () => {
    if (!fs.existsSync(LOCAL_DB_PATH)) {
      fs.mkdirSync(path.dirname(LOCAL_DB_PATH), { recursive: true });
      fs.writeFileSync(
        LOCAL_DB_PATH,
        JSON.stringify({ users: [], response_logs: [], survey_logs: [] }, null, 2),
        "utf-8"
      );
    }
    try {
      const content = fs.readFileSync(LOCAL_DB_PATH, "utf-8");
      return JSON.parse(content);
    } catch {
      return { users: [], response_logs: [], survey_logs: [] };
    }
  };

  const writeLocalDb = (data: any) => {
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf-8");
  };

  prisma = {
    user: {
      groupBy: async ({ by, _count }: { by: string[]; _count?: Record<string, boolean> }) => {
        const db = readLocalDb();
        const counts: Record<string, number> = { A: 0, B: 0, C: 0 };
        for (const u of db.users) {
          counts[u.group_assigned] = (counts[u.group_assigned] || 0) + 1;
        }
        return Object.entries(counts).map(([group, count]) => ({
          group_assigned: group,
          _count: { group_assigned: count }
        }));
      },
      create: async ({ data }: { data: any }) => {
        const db = readLocalDb();
        const newUser = {
          ...data,
          start_time: data.start_time instanceof Date ? data.start_time.toISOString() : data.start_time || new Date().toISOString(),
          end_time: null,
          tutorial_time_seconds: data.tutorial_time_seconds || null,
          feedback: null
        };
        db.users.push(newUser);
        writeLocalDb(db);
        return newUser;
      },
      update: async ({ where, data }: { where: { user_id: string }; data: any }) => {
        const db = readLocalDb();
        const idx = db.users.findIndex((u: any) => u.user_id === where.user_id);
        if (idx === -1) {
          const err = new Error("Record to update not found.") as any;
          err.code = "P2025";
          throw err;
        }
        db.users[idx] = {
          ...db.users[idx],
          ...data,
          end_time: data.end_time instanceof Date ? data.end_time.toISOString() : data.end_time || db.users[idx].end_time,
          tutorial_time_seconds: data.tutorial_time_seconds !== undefined ? data.tutorial_time_seconds : db.users[idx].tutorial_time_seconds,
        };
        writeLocalDb(db);
        return db.users[idx];
      },
      findMany: async ({ orderBy }: { orderBy?: any }) => {
        const db = readLocalDb();
        return [...db.users].sort(
          (a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
        );
      }
    },
    responseLog: {
      create: async ({ data }: { data: any }) => {
        const db = readLocalDb();
        const newLog = {
          id: db.response_logs.length + 1,
          ...data,
          hover_count: data.hover_count || 0,
          hover_details: data.hover_details || null,
          chat_count: data.chat_count || 0,
          chat_history: data.chat_history || null,
          interactive_clicks: data.interactive_clicks || 0,
          created_at: new Date().toISOString()
        };
        db.response_logs.push(newLog);
        writeLocalDb(db);
        return newLog;
      },
      findMany: async ({ orderBy }: { orderBy?: any }) => {
        const db = readLocalDb();
        return [...db.response_logs].sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    },
    surveyLog: {
      createMany: async ({ data }: { data: any[] }) => {
        const db = readLocalDb();
        const startId = db.survey_logs.length + 1;
        const newLogs = data.map((item: any, index: number) => ({
          id: startId + index,
          ...item,
          created_at: item.created_at instanceof Date ? item.created_at.toISOString() : item.created_at || new Date().toISOString()
        }));
        db.survey_logs.push(...newLogs);
        writeLocalDb(db);
        return { count: newLogs.length };
      },
      findMany: async ({ orderBy }: { orderBy?: any }) => {
        const db = readLocalDb();
        return [...db.survey_logs].sort(
          (a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
    }
  };
}

export { prisma };
export * from "../generated/prisma/client";
