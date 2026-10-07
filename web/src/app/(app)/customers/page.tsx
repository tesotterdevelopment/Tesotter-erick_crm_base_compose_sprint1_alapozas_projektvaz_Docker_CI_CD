import type { Metadata } from "next";
import Link from "next/link";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Ügyfelek" };

export default function CustomersPage() {
  return (
    <>
      <PageHeader
        title="Ügyfelek"
        description="Ügyféllista kereséssel, szűréssel és lapozással."
        actions={
          <Link
            href="/customers/new"
            className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90"
          >
            Új ügyfél
          </Link>
        }
      />
      <ComingSoon ticket="TCRM-112" sprint={2} />
    </>
  );
}
