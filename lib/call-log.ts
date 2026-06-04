import fs from "fs/promises";
import path from "path";

// File-based call log for local testing.
// Replace with Supabase insert when the DB is wired in.
const LOG_FILE = path.join(process.cwd(), "call-log.json");

export interface CallLogEntry {
  call_id: string;
  event: "started" | "ended" | "analyzed";
  logged_at: string;
  [key: string]: unknown;
}

async function readLog(): Promise<CallLogEntry[]> {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeLog(entries: CallLogEntry[]): Promise<void> {
  await fs.writeFile(LOG_FILE, JSON.stringify(entries, null, 2));
}

export async function logCall(data: Omit<CallLogEntry, "logged_at">): Promise<void> {
  const entries = await readLog();

  if (data.event === "started") {
    entries.push({ ...data, logged_at: new Date().toISOString() } as CallLogEntry);
  } else {
    // Merge into existing entry for this call_id
    const idx = entries.findLastIndex((e) => e.call_id === data.call_id);
    if (idx !== -1) {
      entries[idx] = {
        ...entries[idx],
        ...data,
        logged_at: new Date().toISOString(),
      };
    } else {
      entries.push({ ...data, logged_at: new Date().toISOString() } as CallLogEntry);
    }
  }

  // Keep last 500 calls
  await writeLog(entries.slice(-500));
}

export async function getRecentCalls(limit = 20): Promise<CallLogEntry[]> {
  const entries = await readLog();
  return entries.slice(-limit).reverse();
}
