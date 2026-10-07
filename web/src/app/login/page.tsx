import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";

export const metadata: Metadata = { title: "Bejelentkezés" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-surface px-4">
      <div className="w-full max-w-sm rounded-md border border-border bg-background p-8">
        <h1 className="mb-1 text-xl font-bold tracking-tight">Tesotter Mini CRM</h1>
        <p className="mb-6 text-sm text-muted">Bejelentkezés</p>
        <ComingSoon ticket="TCRM-110" sprint={2} />
      </div>
    </main>
  );
}
