import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Üzlet részletei" };

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <>
      <PageHeader title="Üzlet részletei" description={`Azonosító: ${id}`} />
      <ComingSoon ticket="TCRM-115" sprint={3} />
    </>
  );
}
