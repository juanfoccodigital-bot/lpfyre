const USERS = [
  {
    username: "rodrigolopes",
    password: "Rodrigo@2026",
    id: "50872c28-4457-4642-833b-b512c68b2941",
    display_name: "Rodrigo Lopes",
  },
  {
    username: "juanmansilha",
    password: "Juan@2026",
    id: "1bab39ad-f161-4da0-b65f-5b56a9e32dd5",
    display_name: "Juan Mansilha",
  },
];

export interface AuthSession {
  id: string;
  username: string;
  display_name: string;
}

export function authenticate(username: string, password: string): AuthSession | null {
  const user = USERS.find((u) => u.username === username && u.password === password);
  if (!user) return null;
  return { id: user.id, username: user.username, display_name: user.display_name };
}

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") return null;
  try {
    const data = localStorage.getItem("fyre_admin_session");
    if (!data) return null;
    return JSON.parse(data) as AuthSession;
  } catch {
    return null;
  }
}

export function setSession(session: AuthSession): void {
  localStorage.setItem("fyre_admin_session", JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem("fyre_admin_session");
}
