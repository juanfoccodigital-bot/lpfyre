const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://fyre-back.vercel.app";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("fyre_jwt");
}

async function request(path: string, opts?: RequestInit & { noAuth?: boolean }) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts?.headers as Record<string, string>),
  };

  if (!opts?.noAuth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
  return data;
}

// ─── AUTH ───

export async function loginAdmin(username: string, password: string) {
  const data = await request("/api/auth/login/admin", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    noAuth: true,
  });
  if (data.token) localStorage.setItem("fyre_jwt", data.token);
  return data;
}

export async function loginPortal(username: string, password: string) {
  const data = await request("/api/auth/login/portal", {
    method: "POST",
    body: JSON.stringify({ username, password }),
    noAuth: true,
  });
  if (data.token) localStorage.setItem("fyre_jwt", data.token);
  return data;
}

// ─── AI ───

export async function aiChat(body: {
  agentSystemPrompt?: string;
  messages: { role: string; content: string }[];
  mode?: string;
  clientContext?: Record<string, unknown>;
  userName?: string;
}) {
  return request("/api/ai/chat", { method: "POST", body: JSON.stringify(body) });
}

export async function aiContent(body: {
  action: string;
  prompt?: string;
  topic?: string;
  mode?: string;
  weeks?: number;
  theme?: string;
  tone?: string;
  frequency?: string;
}) {
  return request("/api/ai/content", { method: "POST", body: JSON.stringify(body) });
}

export async function aiTeam(body: {
  department: string;
  functionName: string;
  inputs: Record<string, string>;
  mode?: string;
  clientContext?: Record<string, unknown>;
}) {
  return request("/api/ai/team", { method: "POST", body: JSON.stringify(body) });
}

// ─── CALENDAR ───

export async function getCalendarEvents(timeMin?: string, timeMax?: string) {
  const params = new URLSearchParams();
  if (timeMin) params.set("timeMin", timeMin);
  if (timeMax) params.set("timeMax", timeMax);
  return request(`/api/calendar/events?${params.toString()}`);
}

export async function createCalendarEvent(body: {
  title: string;
  description?: string;
  start: string;
  end: string;
  meeting_link?: string;
  attendees?: string[];
}) {
  return request("/api/calendar/events", { method: "POST", body: JSON.stringify(body) });
}

export async function syncCalendar() {
  return request("/api/calendar/sync");
}

// ─── LEADS ───

export async function createLeadPublic(body: {
  empresa?: string;
  segmento?: string;
  faturamento?: string;
  desafio?: string;
  servico?: string;
  whatsapp?: string;
  email?: string;
}) {
  return request("/api/leads/public", { method: "POST", body: JSON.stringify(body), noAuth: true });
}

export async function notifyMeeting(body: {
  title: string;
  date: string;
  time: string;
  endTime?: string;
  duration?: number;
  contact?: string;
  link?: string;
  createdBy?: string;
}) {
  return request("/api/leads/notify-meeting", { method: "POST", body: JSON.stringify(body) });
}

// ─── META (TRAFFIC) ───

export async function getMetaInsights(body: {
  accountId: string;
  accessToken: string;
  dateRange?: { since: string; until: string };
}) {
  return request("/api/webhooks/meta", { method: "POST", body: JSON.stringify(body) });
}
