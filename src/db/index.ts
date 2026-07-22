import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import * as schema from "./schema.ts";
import fs from "fs";
import path from "path";

export const createPool = () => {
  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  const sqlHost = process.env.SQL_HOST || "";
  const isConnectionString = sqlHost.startsWith("postgres://") || sqlHost.startsWith("postgresql://");

  const isRemotePg = isConnectionString || (
    sqlHost.includes("supabase") || 
    sqlHost.includes("neon") || 
    sqlHost.includes("elephantsql") ||
    sqlHost.includes("aiven") ||
    sqlHost.includes("cockroach")
  );
  const useSsl = process.env.SQL_SSL === "true" || isProd || isRemotePg;
  const sslConfig = useSsl ? { rejectUnauthorized: false } : undefined;

  if (isConnectionString) {
    return new Pool({
      connectionString: sqlHost,
      connectionTimeoutMillis: 15000,
      ssl: sslConfig,
    });
  }

  const portVal = process.env.SQL_PORT ? parseInt(process.env.SQL_PORT, 10) : 5432;

  return new Pool({
    host: sqlHost || undefined,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    port: isNaN(portVal) ? 5432 : portVal,
    connectionTimeoutMillis: 15000,
    ssl: sslConfig,
  });
};

// Simple in-memory tables for Drizzle fallbacks
const inMemoryTables: Record<string, any[]> = {
  users: [
    {
      id: 1,
      name: "MAHI",
      email: "admin@tracker.com",
      password: "secret123",
      role: "ROLE_ADMIN",
      status: "ACTIVE",
      school: "DPS International",
      board: "CBSE",
      classLevel: "12",
      stream: "Science",
      profileImage: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=120"
    },
    {
      id: 2,
      name: "salsa",
      email: "student@tracker.com",
      password: "secret123",
      role: "ROLE_STUDENT",
      status: "ACTIVE",
      school: "DPS International",
      board: "CBSE",
      classLevel: "12",
      stream: "Science",
      phone: "+91 99999 88888",
      parentId: 3,
      profileImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=120"
    },
    {
      id: 3,
      name: "Rajesh Sharma",
      email: "parent@tracker.com",
      password: "secret123",
      role: "ROLE_PARENT",
      status: "ACTIVE",
      school: "DPS International",
      board: "CBSE",
      classLevel: "12",
      stream: "Science",
      phone: "+91 98888 77777",
      profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
    }
  ],
  personal_notes: [],
  goals: [],
  timetable_slots: [],
  todos: [],
  syllabus_chapters: []
};

const IN_MEMORY_DB_PATH = path.join(process.cwd(), "in_memory_db.json");

export function loadInMemoryDb() {
  try {
    if (fs.existsSync(IN_MEMORY_DB_PATH)) {
      const raw = fs.readFileSync(IN_MEMORY_DB_PATH, "utf8");
      const data = JSON.parse(raw);
      for (const key of Object.keys(data)) {
        inMemoryTables[key] = data[key];
      }
      console.log("[IN-MEMORY DB] Loaded successfully from in_memory_db.json");
    } else {
      saveInMemoryDb();
    }
  } catch (err) {
    console.error("[IN-MEMORY DB] Failed to load:", err);
  }
}

export function saveInMemoryDb() {
  try {
    fs.writeFileSync(IN_MEMORY_DB_PATH, JSON.stringify(inMemoryTables, null, 2), "utf8");
  } catch (err) {
    console.error("[IN-MEMORY DB] Failed to save:", err);
  }
}

// Initial Load
loadInMemoryDb();

function getTableName(table: any): string {
  if (!table) return "users";
  if (typeof table === "string") return table;
  if (typeof table?._?.name === "string") return table._.name;
  if (typeof table?._?.name?.name === "string") return table._.name.name;
  if (typeof table?.className === "string") return table.className;
  if (typeof table?.name === "string") return table.name;
  return "users";
}

class MockBuilder {
  private tableName: string = "users";
  private operation: "select" | "insert" | "update" | "delete" = "select";
  private valuesToInsert: any = null;
  private updateValues: any = null;
  private whereClause: any = null;

  constructor(operation: any, values: any = null) {
    this.operation = operation;
    if (operation === "insert") this.valuesToInsert = values;
    if (operation === "update") this.updateValues = values;
  }

  from(table: any) {
    this.tableName = getTableName(table);
    if (!inMemoryTables[this.tableName]) {
      inMemoryTables[this.tableName] = [];
    }
    return this;
  }

  set(values: any) {
    this.updateValues = values;
    return this;
  }

  where(clause: any) {
    this.whereClause = clause;
    return this;
  }

  returning() {
    return this;
  }

  values(val: any) {
    this.valuesToInsert = val;
    return this;
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    const list = inMemoryTables[this.tableName] || [];
    let result: any = [];

    let field: string | undefined = undefined;
    let value: any = undefined;

    if (this.whereClause) {
      const traverse = (obj: any) => {
        if (!obj || typeof obj !== "object") return;
        if (obj.name && typeof obj.name === "string" && obj.table) {
          field = obj.name;
        }
        if (obj.value !== undefined) {
          value = obj.value;
        }
        if (obj.left && typeof obj.left === "object" && obj.left.name) {
          field = obj.left.name;
        }
        if (obj.right !== undefined) {
          value = obj.right;
        }
        for (const k of Object.keys(obj)) {
          traverse(obj[k]);
        }
      };
      traverse(this.whereClause);
    }

    if (this.operation === "select") {
      result = [...list];
      if (field && value !== undefined) {
        result = result.filter((item: any) => String(item[field!]) === String(value));
      }
    } else if (this.operation === "insert") {
      const newItems = Array.isArray(this.valuesToInsert) ? this.valuesToInsert : [this.valuesToInsert];
      const inserted: any[] = [];
      newItems.forEach((item) => {
        const newItem = {
          id: list.length > 0 ? Math.max(...list.map(x => x.id || 0)) + 1 : 1,
          ...item
        };
        list.push(newItem);
        inserted.push(newItem);
      });
      result = inserted;
      saveInMemoryDb();
    } else if (this.operation === "update") {
      let targets = [...list];
      if (field && value !== undefined) {
        targets = targets.filter((item: any) => String(item[field!]) === String(value));
      }
      targets.forEach((item) => {
        Object.assign(item, this.updateValues);
      });
      result = targets;
      saveInMemoryDb();
    } else if (this.operation === "delete") {
      if (field && value !== undefined) {
        inMemoryTables[this.tableName] = list.filter((item: any) => String(item[field!]) !== String(value));
      } else {
        inMemoryTables[this.tableName] = [];
      }
      result = [];
      saveInMemoryDb();
    }

    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

export const mockDb = {
  select: () => new MockBuilder("select"),
  insert: (table: any) => new MockBuilder("insert").from(table),
  update: (table: any) => new MockBuilder("update").from(table),
  delete: (table: any) => new MockBuilder("delete").from(table),
  execute: () => Promise.resolve({ rows: [] })
};

async function initPostgresTables(pool: any) {
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL DEFAULT 'secret123',
          role TEXT NOT NULL DEFAULT 'ROLE_STUDENT',
          status TEXT NOT NULL DEFAULT 'ACTIVE',
          school TEXT NOT NULL DEFAULT '',
          board TEXT NOT NULL DEFAULT '',
          class_level TEXT NOT NULL DEFAULT '',
          stream TEXT NOT NULL DEFAULT '',
          phone TEXT,
          profile_image TEXT,
          parent_id INTEGER,
          parent_email TEXT,
          auto_notify_parent BOOLEAN NOT NULL DEFAULT false,
          auto_notify_self BOOLEAN NOT NULL DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS personal_notes (
          id SERIAL PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          tags JSONB NOT NULL DEFAULT '[]'::jsonb,
          favorite BOOLEAN NOT NULL DEFAULT false,
          links JSONB NOT NULL DEFAULT '[]'::jsonb,
          file_name TEXT,
          file_size TEXT,
          file_data TEXT
        );

        CREATE TABLE IF NOT EXISTS goals (
          id SERIAL PRIMARY KEY,
          description TEXT NOT NULL,
          deadline TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS timetable_slots (
          id SERIAL PRIMARY KEY,
          day TEXT NOT NULL,
          time_slot TEXT NOT NULL,
          subject TEXT NOT NULL,
          type TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS todos (
          id SERIAL PRIMARY KEY,
          text TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT false,
          subject TEXT NOT NULL DEFAULT 'General',
          priority TEXT NOT NULL DEFAULT 'MEDIUM',
          due_date TEXT,
          reminder_time TEXT,
          reminder_triggered BOOLEAN NOT NULL DEFAULT false
        );

        CREATE TABLE IF NOT EXISTS syllabus_chapters (
          id SERIAL PRIMARY KEY,
          class_level TEXT NOT NULL DEFAULT '11',
          subject TEXT NOT NULL,
          unit TEXT NOT NULL,
          chapter TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'NOT_STARTED',
          revision_count INTEGER NOT NULL DEFAULT 0,
          completion_percentage INTEGER NOT NULL DEFAULT 0,
          estimated_time_hours INTEGER NOT NULL DEFAULT 10,
          time_spent_hours INTEGER NOT NULL DEFAULT 0,
          has_learned BOOLEAN NOT NULL DEFAULT false,
          has_revision BOOLEAN NOT NULL DEFAULT false,
          has_pyqs BOOLEAN NOT NULL DEFAULT false,
          has_notes BOOLEAN NOT NULL DEFAULT false,
          has_test BOOLEAN NOT NULL DEFAULT false,
          has_short_notes BOOLEAN NOT NULL DEFAULT false,
          custom_subtopics JSONB NOT NULL DEFAULT '[]'::jsonb,
          excluded_checkpoints JSONB NOT NULL DEFAULT '[]'::jsonb,
          course_type TEXT NOT NULL DEFAULT 'NCERT'
        );
      `);
      console.log("[SUPABASE / POSTGRES] Tables verified and ensured.");
    } finally {
      client.release();
    }
  } catch (err: any) {
    console.warn("[SUPABASE / POSTGRES] Table initialization error:", err.message || err);
  }
}

let realDb: any = null;
let useMock = !process.env.SQL_HOST;

if (!useMock) {
  try {
    const pool = createPool();
    pool.on("error", (err) => {
      console.error("Unexpected error on idle SQL pool client:", err);
    });
    initPostgresTables(pool);
    realDb = drizzle(pool, { schema });
  } catch (err) {
    console.warn("Failed to initialize database pool:", err);
    useMock = true;
  }
}

export const db: any = new Proxy({}, {
  get: (_, prop) => {
    if (useMock) {
      return (mockDb as any)[prop];
    }
    const val = realDb[prop];
    if (typeof val === "function") {
      return (...args: any[]) => {
        try {
          const result = val.apply(realDb, args);
          if (result && typeof result.then === "function") {
            const originalThen = result.then;
            result.then = function (onfulfilled: any, onrejected: any) {
              return originalThen.call(result, onfulfilled, (err: any) => {
                console.warn("[AI Studio] Database query failed, falling back to mock:", err.message || err);
                useMock = true;
                const mockResult = (mockDb as any)[prop](...args);
                return mockResult.then(onfulfilled, onrejected);
              });
            };
          }
          return result;
        } catch (err: any) {
          console.warn("[AI Studio] Database action failed, falling back to mock:", err.message || err);
          useMock = true;
          return (mockDb as any)[prop](...args);
        }
      };
    }
    return val;
  }
});

