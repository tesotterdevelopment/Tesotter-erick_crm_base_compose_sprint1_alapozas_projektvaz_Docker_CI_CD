"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Irányítópult" },
  { href: "/customers", label: "Ügyfelek" },
  { href: "/deals", label: "Üzletek" },
  { href: "/tasks", label: "Feladatok" },
  // Admin-only visibility arrives with R9 (TCRM-125).
  { href: "/settings/users", label: "Felhasználók" },
];

function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-border bg-surface md:min-h-screen md:w-60 md:border-r md:border-b-0">
      <div className="flex items-center justify-between py-4 pr-3 pl-5">
        <Link href="/dashboard" className="block text-lg font-bold tracking-tight">
          Tesotter <span className="font-normal">Mini CRM</span>
        </Link>
        <ThemeToggle />
      </div>

      <nav aria-label="Fő navigáció" className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`whitespace-nowrap rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground ${
                active ? "bg-foreground font-medium text-background" : "text-foreground hover:bg-border"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
