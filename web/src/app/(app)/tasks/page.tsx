import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Feladatok" };

export default function TasksPage() {
  return (
    <>
      <PageHeader title="Saját feladatok" />
      <ComingSoon ticket="TCRM-120" sprint={4} />
    </>
  );
}
