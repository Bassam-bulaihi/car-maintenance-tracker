import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { notifyDueServices } from "@/lib/messaging/due-services";

// Daily sweep of every service item (the time-based half of PRD §5.4 —
// mileage-based items are also evaluated the moment a new reading arrives).
// Cadence lives in lib/config.ts, not in the vercel.json schedule.
// Vercel Cron invokes scheduled routes with GET.
export async function GET(request: NextRequest) {
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const supabase = createServiceClient();
    const run = await notifyDueServices(supabase);

    // Housekeeping: Telegram only redelivers an update for about a day, so
    // week-old dedupe keys and dead link tokens are safe to drop.
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await supabase.from("inbound_message_events").delete().lt("received_at", weekAgo);
    await supabase.from("telegram_link_tokens").delete().lt("expires_at", weekAgo);

    return NextResponse.json(run);
  } catch (error) {
    console.error("service-reminders cron: query failed", error);
    return NextResponse.json({ error: "query failed" }, { status: 500 });
  }
}
