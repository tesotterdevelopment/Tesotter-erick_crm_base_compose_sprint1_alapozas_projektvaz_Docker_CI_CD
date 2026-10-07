import { Sidebar } from "@/components/layout/Sidebar";

// Shell for every signed-in page. Route protection arrives with R2 (TCRM-110).
export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
