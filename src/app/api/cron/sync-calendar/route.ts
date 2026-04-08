import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fyreoficial.com.br";
const CRON_SECRET = process.env.CRON_SECRET || "fyre-sync-2026";

export async function GET(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  try {
    // 1. Fetch Google Calendar events
    const calRes = await fetch(`${SITE_URL}/api/google-calendar/events`);
    const calData = await calRes.json();

    if (!calData.connected || !calData.events) {
      return NextResponse.json({ error: "Google Calendar not connected", connected: false });
    }

    const events = calData.events as {
      id: string;
      title: string;
      description: string | null;
      scheduled_at: string;
      end_at: string;
      meeting_link: string | null;
      attendees: { email: string; name: string }[];
      calendar: string | null;
    }[];

    // 2. Get already-synced event IDs from Supabase
    const { data: syncedRows } = await supabase
      .from("synced_gcal_events")
      .select("gcal_event_id");

    const syncedIds = new Set((syncedRows || []).map((r: { gcal_event_id: string }) => r.gcal_event_id));

    // 3. Find new events
    const newEvents = events.filter((e) => !syncedIds.has(e.id));

    if (newEvents.length === 0) {
      return NextResponse.json({ message: "No new events", synced: 0 });
    }

    const results: { event: string; notification: boolean; lead: string | null }[] = [];

    for (const event of newEvents) {
      // Extract contact name from title (e.g. "Dr. Alfredo X FYRE" → "Dr. Alfredo")
      const contactName = event.title
        .replace(/\s*[xX]\s*FYRE.*/i, "")
        .replace(/\s*\|\s*FYRE.*/i, "")
        .replace(/\s*-\s*\d{2}\/\d{2}.*/i, "")
        .trim();

      // Format date for notification
      let dateStr = "";
      let timeStr = "";
      let endTimeStr = "";
      let duration = 0;
      try {
        const startDate = new Date(event.scheduled_at);
        const endDate = event.end_at ? new Date(event.end_at) : null;
        dateStr = startDate.toLocaleDateString("pt-BR", {
          weekday: "long",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        timeStr = startDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "America/Sao_Paulo",
        });
        if (endDate) {
          endTimeStr = endDate.toLocaleTimeString("pt-BR", {
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Sao_Paulo",
          });
          duration = Math.round((endDate.getTime() - startDate.getTime()) / 60000);
        }
      } catch { /* skip date parsing errors */ }

      // 4. Send notification to DIRETORIA group
      let notified = false;
      try {
        const notifyRes = await fetch(`${SITE_URL}/api/notify-meeting`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: event.title,
            date: dateStr,
            time: timeStr,
            endTime: endTimeStr || undefined,
            duration: duration || undefined,
            contact: contactName !== event.title ? contactName : undefined,
            link: event.meeting_link || undefined,
            createdBy: "Ayla (Google Calendar)",
          }),
        });
        const notifyData = await notifyRes.json();
        notified = !!notifyData.success;
      } catch { /* silent */ }

      // Auto-create lead OR move existing to "agendado"
      let leadAction: string | null = null;
      try {
        const leadRes = await fetch(`${SITE_URL}/api/auto-lead`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: contactName,
            source: "google_calendar",
          }),
        });
        const leadData = await leadRes.json();

        if (leadData.action === "created") {
          // New lead created, set to agendado
          if (leadData.lead?.id) {
            await supabase.from("leads").update({ status: "agendado" }).eq("id", leadData.lead.id);
          }
          leadAction = `created + agendado: "${leadData.lead?.nome}"`;
        } else if (leadData.action === "exists") {
          // Existing lead, move to agendado if not already past that
          const existingId = leadData.lead?.id;
          if (existingId) {
            const { data: current } = await supabase.from("leads").select("status").eq("id", existingId).single();
            const noMove = ["agendado", "call_realizada", "proposta_encaminhada", "em_negociacao", "venda_realizada", "perdido"];
            if (current && !noMove.includes(current.status)) {
              await supabase.from("leads").update({ status: "agendado" }).eq("id", existingId);
              leadAction = `moved "${leadData.lead?.nome}" to agendado`;
            } else {
              leadAction = `"${leadData.lead?.nome}" already at ${current?.status}`;
            }
          }
        }
      } catch { /* silent */ }

      // 5. Mark event as synced
      await supabase.from("synced_gcal_events").insert({
        gcal_event_id: event.id,
        title: event.title,
        scheduled_at: event.scheduled_at,
        synced_at: new Date().toISOString(),
      });

      results.push({
        event: event.title,
        notification: notified,
        lead: leadAction,
      });
    }

    return NextResponse.json({
      message: `Synced ${results.length} new events`,
      synced: results.length,
      results,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
