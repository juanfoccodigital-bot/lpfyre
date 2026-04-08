import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Round-robin between Juan and Rodrigo
const USERS = [
  "1bab39ad-f161-4da0-b65f-5b56a9e32dd5", // Juan
  "50872c28-4457-4642-833b-b512c68b2941", // Rodrigo
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Evolution API sends different event types
    const event = body.event;

    // Only process incoming messages (not from us)
    if (event !== "messages.upsert") {
      return NextResponse.json({ ok: true, skipped: "not a message event" });
    }

    const data = body.data;
    if (!data) return NextResponse.json({ ok: true, skipped: "no data" });

    // Skip messages from the bot itself
    if (data.key?.fromMe) {
      return NextResponse.json({ ok: true, skipped: "from me" });
    }

    // Skip group messages - only process direct messages to Ayla
    const remoteJid = data.key?.remoteJid || "";
    if (remoteJid.includes("@g.us")) {
      return NextResponse.json({ ok: true, skipped: "group message" });
    }

    // Only process WhatsApp contacts
    if (!remoteJid.includes("@s.whatsapp.net")) {
      return NextResponse.json({ ok: true, skipped: "not whatsapp" });
    }

    // Extract phone and name
    const phone = remoteJid.split("@")[0]; // e.g. "5541997246413"
    const pushName = data.pushName || "";

    if (!phone || !pushName) {
      return NextResponse.json({ ok: true, skipped: "no phone or name" });
    }

    // Extract DDD
    let ddd: string | null = null;
    if (phone.startsWith("55") && phone.length >= 12) {
      ddd = phone.substring(2, 4);
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Check if lead already exists by phone
    const { data: existingByPhone } = await supabase
      .from("leads")
      .select("id, nome, telefone")
      .eq("telefone", phone)
      .limit(1);

    if (existingByPhone && existingByPhone.length > 0) {
      return NextResponse.json({
        ok: true,
        action: "exists",
        lead: existingByPhone[0].nome,
      });
    }

    // Also check by name (fuzzy)
    const firstName = pushName.split(" ")[0];
    const { data: existingByName } = await supabase
      .from("leads")
      .select("id, nome, telefone")
      .ilike("nome", `%${firstName}%`)
      .limit(5);

    // If found by name AND phone is similar, skip
    if (existingByName && existingByName.length > 0) {
      const exactMatch = existingByName.find(
        (l: { telefone?: string }) => l.telefone && l.telefone.includes(phone.slice(-8))
      );
      if (exactMatch) {
        return NextResponse.json({
          ok: true,
          action: "exists",
          lead: exactMatch.nome,
        });
      }
    }

    // Round-robin assignment
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });
    const assignedTo = USERS[(count || 0) % USERS.length];

    // Create lead
    const { data: newLead, error } = await supabase
      .from("leads")
      .insert({
        nome: pushName,
        telefone: phone,
        ddd,
        status: "lead_novo",
        fonte: "whatsapp_ayla",
        assigned_to: assignedTo,
        archived: false,
        kanban_order: (count || 0),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      action: "created",
      lead: newLead?.nome,
      phone,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
