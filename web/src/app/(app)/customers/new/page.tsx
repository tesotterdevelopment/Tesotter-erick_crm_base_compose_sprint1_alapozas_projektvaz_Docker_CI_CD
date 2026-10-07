import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Új ügyfél" };

export default function NewCustomerPage() {
  return (
    <>
      <PageHeader title="Új ügyfél" />
      <ComingSoon ticket="TCRM-113" sprint={2} />
    </>
  );
}
