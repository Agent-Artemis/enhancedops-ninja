import { NextRequest, NextResponse } from "next/server";
import {
  verifyRetellSignature,
  type RetellCallPayload,
} from "@/lib/retell";
import { logCall } from "@/lib/call-log";

export async function POST(req: NextRequest) {
  const rawBody = await req.text();

  if (
    !verifyRetellSignature(
      rawBody,
      req.headers.get("x-retell-signature")
    )
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: RetellCallPayload;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  const { event, call } = payload;
  console.log(`[Retell] ${event} — call_id: ${call.call_id}`);

  switch (event) {
    case "call_started":
      await logCall({
        call_id: call.call_id,
        agent_id: call.agent_id,
        from_number: call.from_number,
        to_number: call.to_number,
        direction: call.direction,
        start_timestamp: call.start_timestamp,
        event: "started",
      });
      break;

    case "call_ended":
      await logCall({
        call_id: call.call_id,
        end_timestamp: call.end_timestamp,
        call_status: call.call_status,
        disconnection_reason: call.disconnection_reason,
        event: "ended",
      });
      break;

    case "call_analyzed":
      await logCall({
        call_id: call.call_id,
        transcript: call.transcript,
        call_analysis: call.call_analysis,
        event: "analyzed",
      });

      // Surface follow-up actions if required
      if (call.call_analysis?.custom_analysis_data?.follow_up_required) {
        console.log(
          `[Retell] Follow-up required for call ${call.call_id}:`,
          call.call_analysis.custom_analysis_data.follow_up_notes
        );
      }
      break;

    default:
      console.log(`[Retell] Unhandled event: ${event}`);
  }

  return NextResponse.json({ received: true });
}
