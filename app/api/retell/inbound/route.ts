import { NextRequest, NextResponse } from "next/server";
import { CLINIC_AGENT_ID } from "@/lib/retell";

// Inbound call webhook — Retell fires this when a call arrives on a registered number.
// Respond with the agent to use + any dynamic context.
// Retell waits up to 10 seconds for this response before falling back to the configured agent.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { event, from_number, to_number } = body;

  if (event !== "call_inbound") {
    return NextResponse.json({ error: "Unexpected event" }, { status: 400 });
  }

  console.log(`[Retell] Inbound call from ${from_number} → ${to_number}`);

  return NextResponse.json({
    call_inbound: {
      override_agent_id: CLINIC_AGENT_ID,
      dynamic_variables: {
        caller_number: from_number ?? "unknown",
        called_number: to_number ?? "unknown",
        inbound_timestamp: new Date().toISOString(),
      },
      metadata: {
        source: "inbound_webhook",
        routed_at: new Date().toISOString(),
      },
    },
  });
}
