import { NextResponse, type NextRequest } from "next/server";
import twilio from "twilio";
import { handleInboundMessage, type InboundWebhookFields } from "@/lib/messaging/inbound";

// Twilio's single inbound-message webhook (PRD §7.3's Meta equivalent: one
// endpoint, signature-verified, responds fast, dedupes on the provider's
// message id). No GET verification handshake here — that's Meta-specific;
// Twilio verifies webhook ownership by requiring the console-configured URL
// to match at signature-check time instead.
export async function POST(request: NextRequest) {
  const signature = request.headers.get("x-twilio-signature");
  const formData = await request.formData();
  const params: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    params[key] = String(value);
  }

  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const isValid =
    !!signature && twilio.validateRequest(authToken, signature, request.url, params);

  if (!isValid) {
    return new NextResponse("Invalid signature", { status: 403 });
  }

  const fields: InboundWebhookFields = {
    MessageSid: params.MessageSid || params.SmsMessageSid || "",
    From: params.From || "",
    Body: params.Body,
    ButtonText: params.ButtonText,
    ButtonPayload: params.ButtonPayload,
  };

  if (!fields.MessageSid || !fields.From) {
    return twiml(null);
  }

  try {
    const result = await handleInboundMessage(fields);
    return twiml(result.reply);
  } catch (error) {
    // Always respond fast so Twilio doesn't retry-storm us (PRD §7.3);
    // failures are still visible via server logs / notifications rows.
    console.error("whatsapp webhook error", error);
    return twiml(null);
  }
}

function twiml(message: string | null) {
  const body = message
    ? `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escapeXml(message)}</Message></Response>`
    : `<?xml version="1.0" encoding="UTF-8"?><Response/>`;
  return new NextResponse(body, { status: 200, headers: { "Content-Type": "text/xml" } });
}

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
