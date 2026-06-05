import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "https://dojo.enhancedops.ninja",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(req: NextRequest) {
  const dochubKey = process.env.DOCHUB_API_KEY;

  let body: {
    msa_id: string;
    client_id: string;
    pdf_base64: string;
    title: string;
    recipient_email: string;
    recipient_name?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: CORS_HEADERS });
  }

  const { msa_id, client_id, pdf_base64, title, recipient_email, recipient_name } = body;
  if (!msa_id || !client_id || !pdf_base64 || !recipient_email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400, headers: CORS_HEADERS });
  }

  if (!dochubKey) {
    // No DocHub key — mark as sent so the manual auth path is available
    const supabase = getSupabaseAdmin();
    await supabase
      .from("msas")
      .update({ status: "sent", updated_at: new Date().toISOString() })
      .eq("id", msa_id);
    return NextResponse.json(
      { dochub_document_id: null, signing_url: null, manual: true },
      { headers: CORS_HEADERS }
    );
  }

  // Convert base64 PDF to Buffer for upload
  const pdfBuffer = Buffer.from(pdf_base64, "base64");
  const pdfBlob = new Blob([pdfBuffer], { type: "application/pdf" });

  // Upload document to DocHub
  const uploadForm = new FormData();
  uploadForm.append("file", pdfBlob, `${title}.pdf`);
  uploadForm.append("title", title);

  let documentId: string;
  let signingUrl: string | null = null;

  try {
    const uploadRes = await fetch("https://api.dochub.com/v1/documents", {
      method: "POST",
      headers: { Authorization: `Bearer ${dochubKey}` },
      body: uploadForm,
    });

    if (!uploadRes.ok) {
      const err = await uploadRes.json().catch(() => ({}));
      throw new Error((err as { message?: string }).message ?? `DocHub upload error ${uploadRes.status}`);
    }

    const uploadData = (await uploadRes.json()) as { id?: string; document_id?: string };
    documentId = uploadData.id ?? uploadData.document_id ?? "";
    if (!documentId) throw new Error("DocHub returned no document ID");

    // Create signing session
    const signRes = await fetch(`https://api.dochub.com/v1/documents/${documentId}/sign`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${dochubKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        signers: [{ email: recipient_email, name: recipient_name ?? recipient_email }],
        webhook_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://enhancedops.ninja"}/api/dochub/webhook`,
      }),
    });

    if (signRes.ok) {
      const signData = (await signRes.json()) as { signing_url?: string; url?: string };
      signingUrl = signData.signing_url ?? signData.url ?? null;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "DocHub error";
    return NextResponse.json({ error: message }, { status: 502, headers: CORS_HEADERS });
  }

  // Persist document ID and signing URL to msas record
  const supabase = getSupabaseAdmin();
  const { error: updateErr } = await supabase
    .from("msas")
    .update({
      status: "sent",
      dochub_document_id: documentId,
      dochub_signing_url: signingUrl,
      updated_at: new Date().toISOString(),
    })
    .eq("id", msa_id);

  if (updateErr) {
    console.error("[MSA send] Supabase update error:", updateErr.message);
    return NextResponse.json({ error: "DB update failed" }, { status: 500, headers: CORS_HEADERS });
  }

  return NextResponse.json(
    { dochub_document_id: documentId, signing_url: signingUrl },
    { headers: CORS_HEADERS }
  );
}
