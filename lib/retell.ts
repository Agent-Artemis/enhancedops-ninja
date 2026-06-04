import crypto from "crypto";

export const RETELL_API_KEY = process.env.RETELL_API_KEY ?? "";
export const CLINIC_AGENT_ID =
  process.env.RETELL_CLINIC_AGENT_ID ?? "agent_256d2b6f4217d7a1a0ef674a95";

// Verify Retell webhook signature: v={timestamp},d={hex_digest}
// HMAC-SHA256(rawBody + timestamp, apiKey)
export function verifyRetellSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  if (!signatureHeader || !RETELL_API_KEY) return false;

  const match = signatureHeader.match(/^v=(\d+),d=(.+)$/);
  if (!match) return false;

  const [, timestamp, receivedDigest] = match;

  // Replay attack guard: reject if older than 5 minutes
  const age = Date.now() - parseInt(timestamp, 10);
  if (age > 5 * 60 * 1000) return false;

  const expected = crypto
    .createHmac("sha256", RETELL_API_KEY)
    .update(rawBody + timestamp)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected, "hex"),
    Buffer.from(receivedDigest, "hex")
  );
}

export type RetellEvent =
  | "call_started"
  | "call_ended"
  | "call_analyzed"
  | "transcript_updated"
  | "transfer_started"
  | "transfer_bridged"
  | "transfer_cancelled"
  | "transfer_ended";

export interface RetellCallPayload {
  event: RetellEvent;
  call: {
    call_id: string;
    agent_id: string;
    call_type: string;
    from_number?: string;
    to_number?: string;
    direction?: string;
    start_timestamp?: number;
    end_timestamp?: number;
    call_status?: string;
    disconnection_reason?: string;
    transcript?: string;
    transcript_object?: unknown;
    call_analysis?: {
      call_summary?: string;
      user_sentiment?: string;
      call_successful?: boolean;
      custom_analysis_data?: Record<string, unknown>;
    };
    metadata?: Record<string, unknown>;
  };
}
