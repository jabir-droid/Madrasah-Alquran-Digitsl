import { NextResponse } from "next/server";
import defaultData from "@/data/db.json";

const KVDB_URL = "https://kvdb.io/HjnL4Nd8s6KU9ZmNT8D6Ca/madrasah_data";

// In-memory backup cache on server
let memoryCache: any = null;

export async function GET() {
  try {
    const res = await fetch(KVDB_URL, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache"
      }
    });

    if (res.ok) {
      const text = await res.text();
      try {
        const parsed = JSON.parse(text);
        if (parsed && Array.isArray(parsed.cards) && Array.isArray(parsed.members)) {
          memoryCache = parsed;
          return NextResponse.json(parsed, {
            headers: {
              "Cache-Control": "no-store, no-cache, must-revalidate",
              "Access-Control-Allow-Origin": "*"
            }
          });
        }
      } catch (parseErr) {
        console.warn("KVDB returned invalid JSON, initializing default data...", parseErr);
      }
    }
  } catch (err) {
    console.error("Error reading from KVDB:", err);
  }

  // Fallback to memory cache or default data
  const fallback = memoryCache || defaultData;
  
  // Try to re-seed KVDB with fallback data
  try {
    fetch(KVDB_URL, {
      method: "POST",
      body: JSON.stringify(fallback)
    }).catch(() => {});
  } catch {}

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

    memoryCache = body;

    // Persist to KVDB in background
    try {
      await fetch(KVDB_URL, {
        method: "POST",
        body: JSON.stringify(body)
      });
    } catch (e) {
      console.error("Failed to persist to KVDB:", e);
    }

    return NextResponse.json({ success: true, timestamp: Date.now() }, {
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
