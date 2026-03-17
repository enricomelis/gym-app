"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await authClient.signOut();
      router.push("/login");
    } catch {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" onClick={handleLogout} disabled={loading}>
      {loading ? "Uscita..." : "Esci"}
    </Button>
  );
}
