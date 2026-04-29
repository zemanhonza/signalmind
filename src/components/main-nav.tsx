"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  Database,
  FileText,
  LayoutDashboard,
  Newspaper,
  Search,
  Wrench,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/", label: "Prehled", icon: LayoutDashboard },
  { href: "/news", label: "Clanky", icon: Newspaper },
  { href: "/souhrny", label: "Souhrny", icon: FileText },
  { href: "/ai", label: "AI shrnuti", icon: Bot },
  { href: "/tools", label: "Nastroje", icon: Wrench },
  { href: "/sources", label: "Zdroje", icon: Database },
  { href: "/search", label: "Vyhledavani", icon: Search },
];

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="mt-8 grid gap-1">
      {navItems.map((item) => {
        const isActive =
          item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={clsx(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              isActive
                ? "bg-white text-[#10231f]"
                : "text-[#d7ebe5] hover:bg-white/10 hover:text-white",
            )}
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
