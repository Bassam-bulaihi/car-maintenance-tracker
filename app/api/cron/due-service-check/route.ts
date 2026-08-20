import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { evaluateDueServicesForVehicle } from "@/lib/dashboard/due-service-check";

// Daily sweep for the due-service → notification bridge (docs/PRD.md §5.4).
// Mileage-due items are also caught immediately on every new odometer
// reading (see lib/dashboard/due-service-check.ts), but a time-only item
// (interval_months, no interval_km) can become due with no odometer
// activity at all — this cron is what catches those. Runs once daily,
// ahead of odometer-requests/service-reminders so a same-day "just became
// due" notification can be chased by service-reminders without an extra
// day's delay.
// Vercel Cron invokes scheduled routes with GET.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: vehicles, error } = await supabase.from("vehicles").select("id");
  if (error) {
    console.error("due-service-check cron: vehicle query failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  let checked = 0;
  let flagged = 0;
  for (const vehicle of vehicles ?? []) {
    try {
      const result = await evaluateDueServicesForVehicle(supabase, vehicle.id);
      checked += result.checked;
      flagged += result.flagged;
    } catch (err) {
      console.error(`due-service-check cron: failed for vehicle ${vehicle.id}`, err);
    }
  }

  return NextResponse.json({ vehicles: vehicles?.length ?? 0, checked, flagged });
}
