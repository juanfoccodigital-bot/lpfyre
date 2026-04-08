import { supabase } from "./supabase";

export interface PortalSession {
  id: string;
  client_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

export async function authenticateClient(
  username: string,
  password: string
): Promise<PortalSession | null> {
  const { data, error } = await supabase
    .from("client_portal_users")
    .select("*")
    .eq("username", username)
    .eq("password_hash", password)
    .single();

  if (error || !data) return null;

  return {
    id: data.id,
    client_id: data.client_id,
    username: data.username,
    display_name: data.display_name,
    avatar_url: data.avatar_url,
  };
}

export function getPortalSession(): PortalSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("fyre_portal_session");
    if (!data) return null;
    return JSON.parse(data) as PortalSession;
  } catch {
    return null;
  }
}

export function setPortalSession(session: PortalSession): void {
  localStorage.setItem("fyre_portal_session", JSON.stringify(session));
}

export function clearPortalSession(): void {
  localStorage.removeItem("fyre_portal_session");
}
