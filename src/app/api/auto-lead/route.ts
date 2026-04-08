import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const EVOLUTION_URL = "https://evolution.fyreoficial.com.br";
const EVOLUTION_KEY = "KS2rnpBe7QXyj0pnGOOPAqBDBjC0r0UM";
const INSTANCE = "fyre";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Round-robin between Juan and Rodrigo
const USERS = [
  "1bab39ad-f161-4da0-b65f-5b56a9e32dd5", // Juan
  "50872c28-4457-4642-833b-b512c68b2941", // Rodrigo
];

async function searchPhoneInEvolution(name: string): Promise<string | null> {
  try {
    const res = await fetch(`${EVOLUTION_URL}/chat/findContacts/${INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_KEY,
      },
      body: JSON.stringify({}),
    });

    const contacts = await res.json();
    if (!Array.isArray(contacts)) return null;

    // Clean search name: remove titles, "x FYRE", etc
    const cleanName = name
      .replace(/\s*[xX]\s*FYRE.*/i, "")
      .replace(/^(Dr\.?|Dra\.?|Sr\.?|Sra\.?)\s*/i, "")
      .trim()
      .toLowerCase();

    // Search WhatsApp contacts by pushName
    const whatsappContacts = contacts.filter(
      (c: { remoteJid?: string }) => (c.remoteJid || "").includes("@s.whatsapp.net")
    );

    // Try exact match first
    let match = whatsappContacts.find((c: { pushName?: string }) => {
      const pushName = (c.pushName || "").toLowerCase();
      return pushName.includes(cleanName) || cleanName.includes(pushName.split(" ")[0]);
    });

    // Try first name match
    if (!match) {
      const firstName = cleanName.split(" ")[0];
      if (firstName.length >= 3) {
        match = whatsappContacts.find((c: { pushName?: string }) => {
          const pushName = (c.pushName || "").toLowerCase();
          return pushName.includes(firstName);
        });
      }
    }

    if (match) {
      const phone = (match as { remoteJid: string }).remoteJid.split("@")[0];
      return phone; // Already in format 55DDXXXXXXXXX
    }

    return null;
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone: providedPhone, source } = body as {
      name: string;
      phone?: string;
      source?: string;
    };

    if (!name || name.trim().length < 2) {
      return NextResponse.json({ error: "Nome obrigatório" }, { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

    // Clean the name from Google Calendar title format
    // "Reunião com Juan e FYRE Automação & I.A - 29/03" → "Juan"
    // "Dr. Alfredo X FYRE" → "Dr. Alfredo"
    // "Dra. Gillian" → "Dra. Gillian"
    let cleanName = name
      .replace(/^Reuni[ãa]o\s+com\s+/i, "")       // Remove "Reunião com "
      .replace(/\s+e\s+Fyre\s+Solu[çc][õo]es.*/i, "") // Remove " e FYRE Automação & I.A - 29/03"
      .replace(/\s*[xX]\s*FYRE.*/i, "")             // Remove " X FYRE"
      .replace(/\s*\|\s*FYRE.*/i, "")               // Remove " | FYRE"
      .replace(/\s*-\s*\d{2}\/\d{2}.*/i, "")        // Remove " - 29/03"
      .replace(/\s*-\s*\d{2}\/\d{2}\/\d{2,4}.*/i, "") // Remove " - 29/03/2026"
      .trim();
    if (!cleanName || cleanName.length < 2) cleanName = name.trim();

    // Check if lead already exists by name
    const { data: existing } = await supabase
      .from("leads")
      .select("id, nome, telefone")
      .ilike("nome", `%${cleanName}%`)
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: true,
        action: "exists",
        lead: existing[0],
        message: `Lead "${existing[0].nome}" já existe`,
      });
    }

    // Try to find phone from Evolution API
    let phone = providedPhone || null;
    if (!phone) {
      phone = await searchPhoneInEvolution(cleanName);
    }

    // Extract DDD from phone if available
    let ddd: string | null = null;
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.startsWith("55") && digits.length >= 12) {
        ddd = digits.substring(2, 4);
      } else if (digits.length >= 10) {
        ddd = digits.substring(0, 2);
      }
    }

    // Round-robin: count existing leads to determine assignment
    const { count } = await supabase
      .from("leads")
      .select("*", { count: "exact", head: true });
    const assignedTo = USERS[(count || 0) % USERS.length];

    // Create the lead
    const { data: newLead, error } = await supabase
      .from("leads")
      .insert({
        nome: cleanName,
        telefone: phone,
        ddd,
        status: "agendado",
        fonte: source || "google_calendar",
        assigned_to: assignedTo,
        archived: false,
        kanban_order: (count || 0),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      action: "created",
      lead: newLead,
      phoneSource: phone ? (providedPhone ? "provided" : "evolution") : "not_found",
      message: `Lead "${cleanName}" criado${phone ? ` com telefone ${phone}` : " sem telefone"}`,
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
