import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

function verifyDocHubSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.DOCHUB_WEBHOOK_SECRET;
  if (!secret || !signature) return !secret; // pass if no secret configured
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (!verifyDocHubSignature(rawBody, req.headers.get("x-dochub-signature"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const event = payload.event as string | undefined;
  const documentId = (payload.document_id ?? payload.id) as string | undefined;

  // Only act on completed signature events
  if (!documentId || (event && !event.includes("complet") && !event.includes("sign"))) {
    return NextResponse.json({ received: true });
  }

  console.log(`[DocHub] ${event ?? "event"} — document_id: ${documentId}`);

  const supabase = getSupabaseAdmin();

  const { data: msa, error: msaLookupErr } = await supabase
    .from("msas")
    .select("id, client_id, briefing_id, status")
    .eq("dochub_document_id", documentId)
    .maybeSingle();

  if (msaLookupErr) {
    console.error("[DocHub] MSA lookup error:", msaLookupErr.message);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }

  if (!msa) {
    console.warn(`[DocHub] No MSA found for document_id ${documentId}`);
    return NextResponse.json({ received: true });
  }

  if (msa.status === "mission_authorized") {
    return NextResponse.json({ received: true }); // already cascaded, idempotent
  }

  const authorizedAt = new Date().toISOString();
  const signers = payload.signers as Array<{ name?: string; email?: string }> | undefined;
  const signer = signers?.[0];

  const [msaRes, mapRes, briefingRes, clientRes] = await Promise.all([
    supabase
      .from("msas")
      .update({
        status: "mission_authorized",
        authorized_at: authorizedAt,
        authorized_by_name: signer?.name ?? null,
        authorized_by_email: signer?.email ?? null,
        updated_at: authorizedAt,
      })
      .eq("id", msa.id),

    supabase
      .from("mission_maps")
      .update({ status: "live" })
      .eq("client_id", msa.client_id),

    msa.briefing_id
      ? supabase
          .from("briefings")
          .update({ status: "mission_authorized" })
          .eq("id", msa.briefing_id)
      : Promise.resolve({ error: null }),

    supabase
      .from("clients")
      .update({ pipeline_stage: "mission_funded", updated_at: authorizedAt })
      .eq("id", msa.client_id),
  ]);

  const errors = [msaRes.error, mapRes.error, briefingRes?.error, clientRes.error].filter(Boolean);
  if (errors.length) {
    console.error("[DocHub] Cascade errors:", errors.map((e) => e?.message).join(", "));
    return NextResponse.json({ error: "Cascade partial failure" }, { status: 500 });
  }

  console.log(`[DocHub] Mission authorized — client ${msa.client_id}, msa ${msa.id}`);
  return NextResponse.json({ received: true });
}
