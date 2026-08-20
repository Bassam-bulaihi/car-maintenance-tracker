import { NextResponse, type NextRequest } from "next/server";
import twilio from "twilio";
import { createServiceClient } from "@/lib/supabase/service";
import type { Database } from "@/lib/supabase/database.types";

type DeliveryStatus = Database["public"]["Enums"]["notification_delivery_status"];

// Twilio's MessageStatus values map onto the existing
// notification_delivery_status enum (PRD §7.3's "statuses events" concept,
// same idea under Twilio's naming).
const STATUS_MAP: Record<string, DeliveryStatus> = {
  queued: "pending",
  accepted: "pending",
  sending: "pending",
  sent: "sent",
  delivered: "delivered",
  read: "read",
  failed: "failed",
  undelivered: "failed",
};

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

  const messageSid = params.MessageSid;
  const mapped = params.MessageStatus ? STATUS_MAP[params.MessageStatus] : undefined;

  if (messageSid && mapped) {
    const supabase = createServiceClient();
    await supabase
      .from("notifications")
      .update({ delivery_status: mapped })
      .eq("provider_message_sid", messageSid);
  }

  return new NextResponse(null, { status: 200 });
}
