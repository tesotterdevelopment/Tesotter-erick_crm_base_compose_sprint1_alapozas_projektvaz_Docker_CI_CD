"use client";

import { useEffect, useState } from "react";
import { api, ApiClientError } from "@/lib/api-client";
import type { User } from "@/lib/types";

// Smoke test for the typed API client: greets the signed-in user.
export function WelcomeUser() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.users
      .me()
      .then(setUser)
      .catch((e: unknown) => setError(e instanceof ApiClientError ? e.message : "Ismeretlen hiba."));
  }, []);

  if (error) return <>{error}</>;
  if (!user) return <>Betöltés…</>;
  return <>Szia, {user.name}!</>;
}
