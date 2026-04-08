"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getPortalSession, PortalSession } from "@/lib/portal-auth";
import PortalNav from "@/components/portal/PortalNav";

export default function PortalClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<PortalSession | null>(null);
  const [checked, setChecked] = useState(false);

  const isLoginPage = pathname === "/portal-cliente/login";

  useEffect(() => {
    const s = getPortalSession();
    setSession(s);
    setChecked(true);

    if (!s && !isLoginPage) {
      router.push("/portal-cliente/login");
    }
  }, [pathname, isLoginPage, router]);

  // Still checking auth
  if (!checked) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 border border-white/20 border-t-white/60 rounded-full animate-spin" />
      </div>
    );
  }

  // Login page: no nav
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  // Authenticated: render nav + content
  return (
    <div className="min-h-screen bg-black text-white">
      <PortalNav
        user={{
          display_name: session.display_name,
          client_id: session.client_id,
          username: session.username,
        }}
      />
      <main className="pt-16">{children}</main>
    </div>
  );
}
