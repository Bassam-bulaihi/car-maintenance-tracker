import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { sendServiceDueNotification } from "@/lib/messaging/send";
import { SERVICE_DUE_REMINDER_INTERVAL_DAYS } from "@/lib/config";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { ServiceType } from "@/lib/admin/service-types";

// Chases unanswered service_due/re_reminder notifications, independently
// per service item (PRD §5.5) — an unresolved engine-oil reminder never
// blocks a separate brake-fluid one, since each is its own notifications
// row. Runs at SERVICE_DUE_REMINDER_INTERVAL_DAYS, deliberately more
// aggressive than the odometer-request cadence.
//
// The first service_due notification for a newly-due item comes from
// lib/messaging/due-service-bridge.ts's evaluateAndNotifyDueServices
// (called on both odometer-entry paths and by the due-service-check cron);
// this route only ever re-chases rows that already exist.
// Vercel Cron invokes scheduled routes with GET.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();
  const cutoff = new Date(
    Date.now() - SERVICE_DUE_REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: stale, error } = await supabase
    .from("notifications")
    .select(
      "id, vehicle_id, service_item_id, vehicles(make, model, users(phone_number, language)), vehicle_service_items(service_type)",
    )
    .in("message_type", ["service_due", "re_reminder"])
    .is("response", null)
    .lte("sent_at", cutoff);

  if (error) {
    console.error("service-reminders cron: query failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  let sent = 0;
  for (const row of stale ?? []) {
    const vehicle = row.vehicles;
    const serviceItem = row.vehicle_service_items;
    if (!vehicle || !serviceItem || !row.service_item_id) continue;
    const user = vehicle.users;
    if (!user) continue;

    try {
      await sendServiceDueNotification(
        supabase,
        { id: row.vehicle_id, make: vehicle.make, model: vehicle.model },
        { phone_number: user.phone_number, language: user.language as Locale },
        { id: row.service_item_id, service_type: serviceItem.service_type as ServiceType },
        "re_reminder",
      );
      sent++;
    } catch (err) {
      console.error(`service-reminders cron: failed to re-send for notification ${row.id}`, err);
    }
  }

  return NextResponse.json({ candidates: stale?.length ?? 0, sent });
}
