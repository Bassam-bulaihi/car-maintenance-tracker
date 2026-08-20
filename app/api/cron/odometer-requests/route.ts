import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendOdometerRequest } from "@/lib/messaging/send";
import { ODOMETER_REQUEST_INTERVAL_DAYS } from "@/lib/config";
import type { Locale } from "@/lib/i18n/dictionaries";

// Runs on the Vercel Cron schedule in vercel.json. The cron itself fires
// daily; whether any given vehicle actually gets asked today is decided
// here against ODOMETER_REQUEST_INTERVAL_DAYS (PRD §5.3 — cadence must be
// configuration, not hardcoded into the trigger).
// Vercel Cron invokes scheduled routes with GET.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoff = new Date(
    Date.now() - ODOMETER_REQUEST_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: vehicles, error } = await supabase
    .from("vehicles")
    .select("id, make, model, odometer_updated_at, users(phone_number, language)")
    .or(`odometer_updated_at.is.null,odometer_updated_at.lt.${cutoff}`);

  if (error) {
    console.error("odometer-requests cron: vehicle query failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  const candidates = vehicles ?? [];
  if (candidates.length === 0) {
    return NextResponse.json({ candidates: 0, sent: 0 });
  }

  // A vehicle already asked within the window doesn't get asked again just
  // because odometer_updated_at hasn't moved yet (the user simply hasn't
  // replied) — otherwise a daily cron would re-ask every single day.
  const { data: recentRequests } = await supabase
    .from("notifications")
    .select("vehicle_id")
    .eq("message_type", "odometer_request")
    .in(
      "vehicle_id",
      candidates.map((v) => v.id),
    )
    .gte("sent_at", cutoff);

  const recentlyAsked = new Set((recentRequests ?? []).map((n) => n.vehicle_id));

  let sent = 0;
  for (const vehicle of candidates) {
    if (recentlyAsked.has(vehicle.id)) continue;
    const user = vehicle.users;
    if (!user) continue;

    try {
      await sendOdometerRequest(
        supabase,
        { id: vehicle.id, make: vehicle.make, model: vehicle.model },
        { phone_number: user.phone_number, language: user.language as Locale },
      );
      sent++;
    } catch (err) {
      console.error(`odometer-requests cron: failed to send for vehicle ${vehicle.id}`, err);
    }
  }

  return NextResponse.json({ candidates: candidates.length, sent });
}
