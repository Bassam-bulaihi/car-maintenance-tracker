import "server-only";
import { requireAdminUser } from "@/lib/auth/session";
import { createServiceClient } from "@/lib/supabase/service";
import { computeServiceStatus } from "@/lib/dashboard/service-status";
import { todayInAppTimeZone } from "@/lib/config";

const DAY_MS = 24 * 60 * 60 * 1000;

/** The last `days` calendar days (Riyadh), oldest first, as YYYY-MM-DD. */
function dayKeys(days: number) {
  const now = Date.now();
  return Array.from({ length: days }, (_, i) => todayInAppTimeZone(new Date(now - (days - 1 - i) * DAY_MS)));
}

function bucketByDay<T>(rows: T[], days: string[], at: (row: T) => string | null, value: (row: T) => number = () => 1) {
  const totals = new Map(days.map((d) => [d, 0]));
  for (const row of rows) {
    const ts = at(row);
    if (!ts) continue;
    const key = todayInAppTimeZone(new Date(ts));
    if (totals.has(key)) totals.set(key, totals.get(key)! + value(row));
  }
  return days.map((d) => totals.get(d)!);
}

export type DayPoint = { day: string; values: number[] };

/**
 * Everything the admin dashboard plots. Volumes are small (one row per
 * user / reading / message), so rows in the window are fetched and bucketed
 * by Saudi calendar day here rather than in SQL.
 */
export async function getAdminDashboard() {
  await requireAdminUser();
  const db = createServiceClient();
  const since30 = new Date(Date.now() - 30 * DAY_MS).toISOString();
  const since14 = new Date(Date.now() - 14 * DAY_MS).toISOString();
  const since7 = new Date(Date.now() - 7 * DAY_MS).toISOString();

  const [users, vehicles, readings, notifications, items, openMessages, presets] = await Promise.all([
    db.from("users").select("created_at, telegram_chat_id"),
    db.from("vehicles").select("make, created_at"),
    db.from("odometer_readings").select("recorded_at, source").gte("recorded_at", since30),
    db.from("notifications").select("created_at, sent_at, delivery_status, message_type").gte("created_at", since14),
    db
      .from("vehicle_service_items")
      .select("service_type, interval_km, interval_months, last_service_odometer, last_service_date, vehicles!inner(current_odometer)"),
    db.from("support_messages").select("id", { count: "exact", head: true }).eq("status", "open"),
    db.from("vehicle_presets").select("id", { count: "exact", head: true }).eq("is_active", true),
  ]);

  const userRows = users.data ?? [];
  const vehicleRows = vehicles.data ?? [];
  const readingRows = readings.data ?? [];
  const notificationRows = notifications.data ?? [];

  const days30 = dayKeys(30);
  const days14 = dayKeys(14);

  // Signups per day.
  const signups = bucketByDay(userRows, days30, (u) => u.created_at);

  // Readings per day split by channel.
  const telegramReadings = bucketByDay(readingRows.filter((r) => r.source === "telegram"), days30, (r) => r.recorded_at);
  const webReadings = bucketByDay(readingRows.filter((r) => r.source === "web"), days30, (r) => r.recorded_at);

  // Bot messages sent per day.
  const sent = notificationRows.filter((n) => n.sent_at);
  const messagesPerDay = bucketByDay(sent, days14, (n) => n.sent_at);

  // Delivery over the last 7 days.
  const recent = notificationRows.filter((n) => n.created_at >= since7);
  const delivered7 = recent.filter((n) => n.delivery_status !== "failed" && n.delivery_status !== "pending").length;
  const failed7 = recent.filter((n) => n.delivery_status === "failed").length;

  // Services due now, by type.
  const dueByType = new Map<string, number>();
  for (const item of items.data ?? []) {
    if (computeServiceStatus(item, item.vehicles.current_odometer) === "due") {
      dueByType.set(item.service_type, (dueByType.get(item.service_type) ?? 0) + 1);
    }
  }

  // Vehicles by make: top 8, the tail folded into "Other".
  const byMake = new Map<string, number>();
  for (const v of vehicleRows) byMake.set(v.make, (byMake.get(v.make) ?? 0) + 1);
  const sortedMakes = [...byMake.entries()].sort((a, b) => b[1] - a[1]);
  const topMakes = sortedMakes.slice(0, 8);
  const otherMakes = sortedMakes.slice(8).reduce((sum, [, n]) => sum + n, 0);

  return {
    kpis: {
      users: userRows.length,
      newUsers7: userRows.filter((u) => u.created_at >= since7).length,
      linked: userRows.filter((u) => u.telegram_chat_id !== null).length,
      vehicles: vehicleRows.length,
      newVehicles7: vehicleRows.filter((v) => v.created_at >= since7).length,
      dueNow: [...dueByType.values()].reduce((a, b) => a + b, 0),
      openMessages: openMessages.count ?? 0,
      presets: presets.count ?? 0,
      delivered7,
      failed7,
    },
    signups: days30.map((day, i) => ({ day, values: [signups[i]] })),
    readings: days30.map((day, i) => ({ day, values: [telegramReadings[i], webReadings[i]] })),
    messages: days14.map((day, i) => ({ day, values: [messagesPerDay[i]] })),
    dueByType: [...dueByType.entries()].sort((a, b) => b[1] - a[1]),
    vehiclesByMake: otherMakes > 0 ? [...topMakes, ["__other__", otherMakes] as [string, number]] : topMakes,
  };
}
