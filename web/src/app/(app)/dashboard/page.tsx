import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";
import { WelcomeUser } from "./WelcomeUser";

export const metadata: Metadata = { title: "Irányítópult" };

export default function DashboardPage() {
  return (
    <>
      <PageHeader title="Irányítópult" description={<WelcomeUser />} />
      <ComingSoon ticket="TCRM-122" sprint={4} />
    </>
  );
}
