import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { evaluateAndNotifyDueServices } from "@/lib/messaging/due-service-bridge";

// Re-runs the mileage-OR-time due check (docs/PRD.md §5.4) across every
// vehicle with an outstanding "ok" service item, once a day. Mileage-based
// items normally flip the moment a new odometer reading comes in (both
// odometer-entry paths call evaluateAndNotifyDueServices directly), but
// time-based items need their own periodic check regardless of odometer
// activity — this is that check, and the backstop for mileage items too.
// Vercel Cron invokes scheduled routes with GET.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const supabase = createServiceClient();

  const { data: pending, error } = await supabase
    .from("vehicle_service_items")
    .select("vehicle_id")
    .eq("status", "ok");

  if (error) {
    console.error("due-service-check cron: query failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }

  const vehicleIds = [...new Set((pending ?? []).map((row) => row.vehicle_id))];

  let sent = 0;
  for (const vehicleId of vehicleIds) {
    try {
      sent += await evaluateAndNotifyDueServices(supabase, vehicleId);
    } catch (err) {
      console.error(`due-service-check cron: failed for vehicle ${vehicleId}`, err);
    }
  }

  return NextResponse.json({ vehicles: vehicleIds.length, sent });
}
