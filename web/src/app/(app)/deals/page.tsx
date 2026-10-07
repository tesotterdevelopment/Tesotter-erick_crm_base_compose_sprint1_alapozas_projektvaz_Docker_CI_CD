import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Üzletek" };

export default function DealsPage() {
  return (
    <>
      <PageHeader title="Üzletek" description="Kanban nézet stage szerint." />
      <ComingSoon ticket="TCRM-115" sprint={3} />
    </>
  );
}
