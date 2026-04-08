import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fyreoficial.com.br";
const CRON_SECRET = process.env.CRON_SECRET || "fyre-sync-2026";

const EVOLUTION_URL = "https://evolution.fyreoficial.com.br";
const EVOLUTION_KEY = "KS2rnpBe7QXyj0pnGOOPAqBDBjC0r0UM";
const INSTANCE = "fyre";
const GROUP_ID = "120363403463588067@g.us";

async function sendGroupMessage(text: string) {
  try {
    await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: EVOLUTION_KEY },
      body: JSON.stringify({ number: GROUP_ID, text }),
    });
  } catch { /* silent */ }
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const results: string[] = [];

  // ═══════════════════════════════════════════════
  // PART 1: SYNC NEW GOOGLE CALENDAR EVENTS
  // ═══════════════════════════════════════════════
  try {
    const calRes = await fetch(`${SITE_URL}/api/google-calendar/events`);
    const calData = await calRes.json();

    if (calData.connected && calData.events) {
      const events = calData.events as {
        id: string; title: string; description: string | null;
        scheduled_at: string; end_at: string; meeting_link: string | null;
        attendees: { email: string; name: string }[];
        calendar: string | null;
      }[];

      const { data: syncedRows } = await supabase
        .from("synced_gcal_events")
        .select("gcal_event_id");
      const syncedIds = new Set((syncedRows || []).map((r: { gcal_event_id: string }) => r.gcal_event_id));

      const newEvents = events.filter((e) => !syncedIds.has(e.id));

      for (const event of newEvents) {
        // Extract contact name
        const contactName = event.title
          .replace(/^Reuni[ãa]o\s+com\s+/i, "")
          .replace(/\s+e\s+Fyre\s+Solu[çc][õo]es.*/i, "")
          .replace(/\s*[xX]\s*FYRE.*/i, "")
          .replace(/\s*-\s*\d{2}\/\d{2}.*/i, "")
          .trim();

        // Format date/time
        let dateStr = "", timeStr = "", endTimeStr = "", duration = 0;
        try {
          const start = new Date(event.scheduled_at);
          const end = event.end_at ? new Date(event.end_at) : null;
          dateStr = start.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
          timeStr = start.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
          if (end) {
            endTimeStr = end.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
            duration = Math.round((end.getTime() - start.getTime()) / 60000);
          }
        } catch { /* skip */ }

        // Send notification
        const lines = [
          "📅 *Nova Reunião Agendada*",
          "",
          `🏷️ *${event.title}*`,
          `📆 Data: ${dateStr}`,
          `⏰ Horário: ${timeStr}${endTimeStr ? ` — ${endTimeStr}` : ""}${duration ? ` (${duration}min)` : ""}`,
        ];
        if (contactName && contactName !== event.title) lines.push(`👤 Contato: ${contactName}`);
        if (event.description) lines.push(`📝 ${event.description}`);
        if (event.meeting_link) lines.push(`🔗 Link: ${event.meeting_link}`);
        lines.push("", "_Ayla | FYRE Automação & I.A_ 🤖");

        await sendGroupMessage(lines.join("\n"));

        // Auto-create/move lead
        try {
          const leadRes = await fetch(`${SITE_URL}/api/auto-lead`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: contactName || event.title, source: "google_calendar" }),
          });
          const leadData = await leadRes.json();
          const leadId = leadData.lead?.id;
          if (leadId) {
            if (leadData.action === "created") {
              await supabase.from("leads").update({ status: "agendado" }).eq("id", leadId);
            } else {
              const { data: current } = await supabase.from("leads").select("status").eq("id", leadId).single();
              const noMove = ["agendado", "call_realizada", "proposta_encaminhada", "em_negociacao", "venda_realizada", "perdido"];
              if (current && !noMove.includes(current.status)) {
                await supabase.from("leads").update({ status: "agendado" }).eq("id", leadId);
              }
            }
          }
        } catch { /* silent */ }

        // Mark as synced
        await supabase.from("synced_gcal_events").insert({
          gcal_event_id: event.id,
          title: event.title,
          scheduled_at: event.scheduled_at,
          synced_at: new Date().toISOString(),
        });

        results.push(`NEW: ${event.title}`);
      }
    }
  } catch { /* silent */ }

  // ═══════════════════════════════════════════════
  // PART 2: 15-MINUTE REMINDERS
  // ═══════════════════════════════════════════════
  try {
    const now = new Date();
    const in15 = new Date(now.getTime() + 15 * 60 * 1000);
    const in10 = new Date(now.getTime() + 10 * 60 * 1000);

    // Check reminders table to avoid duplicates
    const { data: sentReminders } = await supabase
      .from("synced_gcal_events")
      .select("gcal_event_id")
      .not("reminded_at", "is", null);
    const remindedIds = new Set((sentReminders || []).map((r: { gcal_event_id: string }) => r.gcal_event_id));

    // Get Google Calendar events
    const calRes = await fetch(`${SITE_URL}/api/google-calendar/events`);
    const calData = await calRes.json();
    const gcalEvents = (calData.events || []) as {
      id: string; title: string; scheduled_at: string;
      meeting_link: string | null; description: string | null;
    }[];

    // Also get Supabase meetings
    const { data: dbMeetings } = await supabase
      .from("meetings")
      .select("id, titulo, scheduled_at, meeting_link, status")
      .eq("status", "agendado");

    // Combine all meetings
    const allUpcoming = [
      ...gcalEvents.map((e) => ({ id: e.id, title: e.title, scheduled_at: e.scheduled_at, link: e.meeting_link, source: "google" as const })),
      ...(dbMeetings || []).map((m: { id: string; titulo: string; scheduled_at: string; meeting_link: string | null }) => ({
        id: `db_${m.id}`, title: m.titulo, scheduled_at: m.scheduled_at, link: m.meeting_link, source: "system" as const,
      })),
    ];

    for (const meeting of allUpcoming) {
      if (remindedIds.has(meeting.id)) continue;

      const meetingTime = new Date(meeting.scheduled_at);

      // Check if meeting is between 10-15 minutes from now
      if (meetingTime >= in10 && meetingTime <= in15) {
        const timeStr = meetingTime.toLocaleTimeString("pt-BR", {
          hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo",
        });

        const reminderLines = [
          "⏰ *Lembrete: Reunião em 15 minutos!*",
          "",
          `🏷️ *${meeting.title}*`,
          `🕐 Horário: ${timeStr}`,
        ];
        if (meeting.link) reminderLines.push(`🔗 Link: ${meeting.link}`);
        reminderLines.push("", "_Ayla | FYRE Automação & I.A_ 🤖");

        await sendGroupMessage(reminderLines.join("\n"));

        // Mark as reminded
        if (meeting.source === "google") {
          await supabase.from("synced_gcal_events")
            .update({ reminded_at: new Date().toISOString() })
            .eq("gcal_event_id", meeting.id);
        } else {
          // For system meetings, insert a reminder record
          await supabase.from("synced_gcal_events").upsert({
            gcal_event_id: meeting.id,
            title: meeting.title,
            scheduled_at: meeting.scheduled_at,
            synced_at: new Date().toISOString(),
            reminded_at: new Date().toISOString(),
          }, { onConflict: "gcal_event_id" });
        }

        results.push(`REMINDER: ${meeting.title}`);
      }
    }
  } catch { /* silent */ }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    results,
    timestamp: new Date().toISOString(),
  });
}
