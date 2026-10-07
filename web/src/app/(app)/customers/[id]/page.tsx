import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Ügyfél adatlap" };

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Ügyfél adatlap" description={`Azonosító: ${id}`} />
      <ComingSoon ticket="TCRM-116" sprint={3} />
    </>
  );
}
