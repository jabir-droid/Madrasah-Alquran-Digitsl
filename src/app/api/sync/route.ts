import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import defaultData from "@/data/db.json";

const DB_FILE_PATH = path.join(process.cwd(), "src", "data", "db.json");
const KVDB_URL = "https://kvdb.io/HjnL4Nd8s6KU9ZmNT8D6Ca/madrasah_data";

// In-memory backup cache on server
let memoryCache: any = null;

async function readLocalDb() {
  try {
    const raw = await fs.readFile(DB_FILE_PATH, "utf-8");
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.cards) && Array.isArray(parsed.members)) {
      return parsed;
    }
  } catch (err) {
    console.warn("Failed to read local db.json from disk:", err);
  }
  return null;
}

async function writeLocalDb(data: any) {
  try {
    await fs.writeFile(DB_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Failed to write db.json to disk:", err);
    return false;
  }
}

export async function GET() {
  // 1. Check cloud KVDB first for real-time multi-device sync
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(KVDB_URL, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache" },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const parsed = await res.json();
      if (parsed && Array.isArray(parsed.cards) && Array.isArray(parsed.members)) {
        memoryCache = parsed;
        writeLocalDb(parsed).catch(() => {});
        return NextResponse.json(parsed, {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            "Access-Control-Allow-Origin": "*"
          }
        });
      }
    }
  } catch (err) {
    // KVDB unreachable or slow, gracefully fallback to local disk
  }

  // 2. Read from local disk file
  const localData = await readLocalDb();
  if (localData) {
    memoryCache = localData;
    return NextResponse.json(localData, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Access-Control-Allow-Origin": "*"
      }
    });
  }

  // 3. Fallback to memory cache or bundled defaultData
  const fallback = memoryCache || defaultData;
  return NextResponse.json(fallback, {
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Access-Control-Allow-Origin": "*"
    }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || !Array.isArray(body.cards)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
    }

    if (Array.isArray(body.members)) {
      body.members = body.members.filter((m: any) => m.id !== "u_faruq" && !m.name?.toLowerCase().includes("faruq"));
    }
    if (Array.isArray(body.cards)) {
      body.cards = body.cards.map((c: any) => c.assigneeId === "u_faruq" ? { ...c, assigneeId: "u_numan" } : c);
    }

    body.updatedAt = body.updatedAt || Date.now();
    memoryCache = body;

    // Persist to local disk and cloud KVDB concurrently
    await Promise.allSettled([
      writeLocalDb(body),
      fetch(KVDB_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      })
    ]);

    return NextResponse.json({ success: true, timestamp: body.updatedAt }, {
      headers: {
        "Cache-Control": "no-store, no-cache",
        "Access-Control-Allow-Origin": "*"
      }
    });
  } catch (err: any) {
    console.error("POST /api/sync error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
