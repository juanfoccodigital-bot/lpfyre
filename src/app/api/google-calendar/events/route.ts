import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function refreshToken(refreshTokenStr: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: refreshTokenStr,
      grant_type: "refresh_token",
    }),
  });
  return res.json();
}

export async function GET(req: NextRequest) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get stored tokens
  const { data: integration, error: fetchErr } = await supabase
    .from("integrations")
    .select("*")
    .eq("id", "google_calendar")
    .single();

  if (fetchErr || !integration) {
    return NextResponse.json({ error: "Google Calendar not connected", connected: false }, { status: 401 });
  }

  let accessToken = integration.access_token;

  // Check if token expired
  if (new Date(integration.expires_at) < new Date()) {
    const refreshed = await refreshToken(integration.refresh_token);
    if (refreshed.error) {
      return NextResponse.json({ error: "Token refresh failed", connected: false }, { status: 401 });
    }
    accessToken = refreshed.access_token;

    // Update stored token
    await supabase.from("integrations").update({
      access_token: refreshed.access_token,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", "google_calendar");
  }

  // Fetch all calendars first
  const timeMin = req.nextUrl.searchParams.get("timeMin") || new Date().toISOString();
  const timeMax = req.nextUrl.searchParams.get("timeMax") || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

  const calListRes = await fetch(
    "https://www.googleapis.com/calendar/v3/users/me/calendarList",
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  const calListData = await calListRes.json();
  const calendars = (calListData.items || []).map((c: { id: string; summary?: string }) => ({
    id: c.id,
    name: c.summary || c.id,
  }));

  // Fetch events from ALL calendars
  const allItems: {
    id: string;
    summary?: string;
    description?: string;
    start?: { dateTime?: string; date?: string };
    end?: { dateTime?: string; date?: string };
    hangoutLink?: string;
    htmlLink?: string;
    attendees?: { email: string; displayName?: string; responseStatus?: string }[];
    location?: string;
    calendarName?: string;
  }[] = [];

  // Only fetch from calendars with "Fyre" in the name
  const fyreCalendars = calendars.filter((c: { id: string; name: string }) =>
    c.name.toLowerCase().includes("fyre")
  );

  await Promise.all(
    fyreCalendars.map(async (cal: { id: string; name: string }) => {
      const params = new URLSearchParams({
        timeMin,
        timeMax,
        singleEvents: "true",
        orderBy: "startTime",
        maxResults: "50",
      });
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(cal.id)}/events?${params.toString()}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      if (data.items) {
        data.items.forEach((item: typeof allItems[number]) => {
          item.calendarName = cal.name;
          allItems.push(item);
        });
      }
    })
  );

  // Map events to our format
  const events = allItems.map((event) => ({
    id: `gcal_${event.id}`,
    title: event.summary || "Sem título",
    description: event.description || null,
    scheduled_at: event.start?.dateTime || event.start?.date || "",
    end_at: event.end?.dateTime || event.end?.date || "",
    meeting_link: event.hangoutLink || event.htmlLink || null,
    attendees: event.attendees?.map((a) => ({
      email: a.email,
      name: a.displayName || a.email,
      status: a.responseStatus,
    })) || [],
    location: event.location || null,
    calendar: event.calendarName || null,
    source: "google_calendar",
  }));

  return NextResponse.json({ events, connected: true });
}

const FYRE_CALENDAR_ID = "d783e2623d65b4478ad0bb216dbfaef75d9f5b49d6a33fff2506b0d0e5eb2c72@group.calendar.google.com";

export async function POST(req: NextRequest) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Get stored tokens
  const { data: integration, error: fetchErr } = await supabase
    .from("integrations")
    .select("*")
    .eq("id", "google_calendar")
    .single();

  if (fetchErr || !integration) {
    return NextResponse.json({ error: "Google Calendar not connected" }, { status: 401 });
  }

  let accessToken = integration.access_token;

  // Check if token expired
  if (new Date(integration.expires_at) < new Date()) {
    const refreshed = await refreshToken(integration.refresh_token);
    if (refreshed.error) {
      return NextResponse.json({ error: "Token refresh failed" }, { status: 401 });
    }
    accessToken = refreshed.access_token;

    // Update stored token
    await supabase.from("integrations").update({
      access_token: refreshed.access_token,
      expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", "google_calendar");
  }

  // Parse request body
  const body = await req.json();
  const { title, description, start, end, meeting_link, attendees } = body as {
    title: string;
    description?: string;
    start: string;
    end: string;
    meeting_link?: string;
    attendees?: string[];
  };

  // Build Google Calendar event payload
  const eventPayload: Record<string, unknown> = {
    summary: title,
    description: description || undefined,
    start: { dateTime: start, timeZone: "America/Sao_Paulo" },
    end: { dateTime: end, timeZone: "America/Sao_Paulo" },
  };

  if (meeting_link) {
    eventPayload.location = meeting_link;
  }

  if (attendees && attendees.length > 0) {
    eventPayload.attendees = attendees.map((email: string) => ({ email }));
  }

  // Create event on Google Calendar
  const createRes = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(FYRE_CALENDAR_ID)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(eventPayload),
    }
  );

  const createdEvent = await createRes.json();

  if (!createRes.ok) {
    return NextResponse.json({ error: "Failed to create event", details: createdEvent }, { status: createRes.status });
  }

  return NextResponse.json({ event: createdEvent, success: true });
}
