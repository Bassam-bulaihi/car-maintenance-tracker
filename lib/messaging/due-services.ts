import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { sendServiceDueNotification } from "@/lib/messaging/send";
import { computeServiceStatus } from "@/lib/dashboard/service-status";
import { schedulerUserIdPrefix, SERVICE_DUE_REMINDER_INTERVAL_DAYS } from "@/lib/config";
import type { Locale } from "@/lib/i18n/dictionaries";
import type { ServiceType } from "@/lib/admin/service-types";

type ServiceClient = SupabaseClient<Database>;

export type DueServiceRun = { evaluated: number; due: number; sent: number; unlinked: number };

/**
 * Evaluates service items against the PRD §5.4 rule (mileage OR time,
 * whichever comes first) and sends a reminder for each due one.
 *
 * Runs from the daily cron for every vehicle, and right after a new odometer
 * reading for that one vehicle (PRD §5.4: "evaluated on every new odometer
 * reading"), from either the web form or a Telegram reply.
 *
 * Each item has its own reminder clock (PRD §5.5), so an unanswered
 * engine-oil reminder never holds back a brake-fluid one. The first message
 * for an item is "service_due"; later chases are "re_reminder", no more often
 * than SERVICE_DUE_REMINDER_INTERVAL_DAYS — which also covers an item the
 * user answered "Not done" on. Users without a linked Telegram chat are
 * counted as `unlinked` and skipped.
 */
export async function notifyDueServices(
  supabase: ServiceClient,
  options: { vehicleId?: string } = {},
): Promise<DueServiceRun> {
  const cutoff = new Date(
    Date.now() - SERVICE_DUE_REMINDER_INTERVAL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  let query = supabase
    .from("vehicle_service_items")
    .select(
      "id, service_type, interval_km, interval_months, last_service_odometer, last_service_date, status, vehicles!inner(id, make, model, current_odometer, users!inner(id, telegram_chat_id, language))",
    );
  if (options.vehicleId) query = query.eq("vehicle_id", options.vehicleId);
  const testPrefix = schedulerUserIdPrefix();
  if (testPrefix) query = query.like("vehicles.user_id", `${testPrefix}%`);

  const { data: items, error } = await query;
  if (error) throw error;

  const due = (items ?? []).filter(
    (item) => computeServiceStatus(item, item.vehicles.current_odometer) === "due",
  );
  const run: DueServiceRun = { evaluated: items?.length ?? 0, due: due.length, sent: 0, unlinked: 0 };
  if (due.length === 0) return run;

  // Most recent send per item: inside the window → skip; none → first ask.
  const { data: previous } = await supabase
    .from("notifications")
    .select("service_item_id, sent_at")
    .in("message_type", ["service_due", "re_reminder"])
    .in(
      "service_item_id",
      due.map((item) => item.id),
    )
    .not("sent_at", "is", null)
    .order("sent_at", { ascending: false });

  const lastSentAt = new Map<string, string>();
  for (const row of previous ?? []) {
    if (row.service_item_id && !lastSentAt.has(row.service_item_id)) {
      lastSentAt.set(row.service_item_id, row.sent_at!);
    }
  }

  for (const item of due) {
    // Keep the stored status honest for anything reading the column
    // directly (the UI recomputes it live from the same rule).
    if (item.status === "ok") {
      await supabase.from("vehicle_service_items").update({ status: "due" }).eq("id", item.id);
    }

    const previousSend = lastSentAt.get(item.id);
    if (previousSend && previousSend > cutoff) continue;

    const vehicle = item.vehicles;
    const user = vehicle.users;
    if (user.telegram_chat_id === null) {
      run.unlinked++;
      continue;
    }

    try {
      await sendServiceDueNotification(
        supabase,
        { id: vehicle.id, make: vehicle.make, model: vehicle.model },
        { id: user.id, telegram_chat_id: user.telegram_chat_id, language: user.language as Locale },
        { id: item.id, service_type: item.service_type as ServiceType },
        previousSend ? "re_reminder" : "service_due",
      );
      run.sent++;
    } catch (err) {
      console.error(`due-services: failed to send for item ${item.id}`, err);
    }
  }

  return run;
}
