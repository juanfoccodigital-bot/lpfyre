"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalClienteRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal-cliente/dashboard");
  }, [router]);

  return null;
}
