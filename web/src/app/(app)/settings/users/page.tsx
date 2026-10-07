import type { Metadata } from "next";
import { ComingSoon } from "@/components/layout/ComingSoon";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = { title: "Felhasználók" };

export default function UsersSettingsPage() {
  return (
    <>
      <PageHeader title="Felhasználók és jogosultságok" />
      <ComingSoon ticket="TCRM-125" sprint={5} />
    </>
  );
}
