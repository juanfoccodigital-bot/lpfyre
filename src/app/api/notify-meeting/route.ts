import { NextRequest, NextResponse } from "next/server";

const EVOLUTION_URL = "https://evolution.fyreoficial.com.br";
const EVOLUTION_KEY = "KS2rnpBe7QXyj0pnGOOPAqBDBjC0r0UM";
const INSTANCE = "fyre"; // Ayla | FYRE
const GROUP_ID = "120363403463588067@g.us"; // DIRETORIA | FYRE AUTOMAÇÃO & I.A 𓆤

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, date, time, endTime, duration, contact, link, createdBy } = body as {
      title: string;
      date: string;
      time: string;
      endTime?: string;
      duration?: number;
      contact?: string;
      link?: string;
      createdBy?: string;
    };

    // Build message
    const lines: string[] = [];
    lines.push("📅 *Nova Reunião Agendada*");
    lines.push("");
    lines.push(`🏷️ *${title}*`);
    lines.push(`📆 Data: ${date}`);
    lines.push(`⏰ Horário: ${time}${endTime ? ` — ${endTime}` : ""}${duration ? ` (${duration}min)` : ""}`);
    if (contact) lines.push(`👤 Contato: ${contact}`);
    if (createdBy) lines.push(`✍️ Criado por: ${createdBy}`);
    if (link) {
      lines.push(`🔗 Link: ${link}`);
    }
    lines.push("");
    lines.push("_Ayla | FYRE Automação & I.A_ 🤖");

    const message = lines.join("\n");

    // Send to group via Evolution API
    const res = await fetch(`${EVOLUTION_URL}/message/sendText/${INSTANCE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: EVOLUTION_KEY,
      },
      body: JSON.stringify({
        number: GROUP_ID,
        text: message,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to send", details: data }, { status: res.status });
    }

    return NextResponse.json({ success: true, messageId: data.key?.id });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
