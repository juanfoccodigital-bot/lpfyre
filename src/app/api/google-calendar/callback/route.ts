import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const REDIRECT_URI = process.env.NEXT_PUBLIC_SITE_URL
  ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/google-calendar/callback`
  : "https://fyreoficial.com.br/api/google-calendar/callback";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) {
    return NextResponse.json({ error: "Missing code" }, { status: 400 });
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      redirect_uri: REDIRECT_URI,
      grant_type: "authorization_code",
    }),
  });

  const tokens = await tokenRes.json();

  if (tokens.error) {
    return NextResponse.json({ error: tokens.error_description || tokens.error }, { status: 400 });
  }

  // Store tokens in Supabase
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { error } = await supabase.from("integrations").upsert(
    {
      id: "google_calendar",
      provider: "google",
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (error) {
    // Table might not exist, try creating it
    console.error("Error storing tokens:", error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL || "https://fyreoficial.com.br"}/admin/calendario?google=error&msg=${encodeURIComponent(error.message)}`
    );
  }

  return NextResponse.redirect(
    `${process.env.NEXT_PUBLIC_SITE_URL || "https://fyreoficial.com.br"}/admin/calendario?google=connected`
  );
}
