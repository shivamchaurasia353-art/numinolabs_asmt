"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Users, ClipboardList, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/books", label: "Books", icon: BookOpen },
  { href: "/members", label: "Members", icon: Users },
  { href: "/loans", label: "Loans", icon: ClipboardList },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 bg-indigo-900 text-indigo-100 flex flex-col min-h-screen">
      <div className="px-5 py-6 border-b border-indigo-700">
        <span className="text-xl font-bold tracking-tight text-white">
          📚 LibraryMS
        </span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-700 text-white"
                  : "text-indigo-300 hover:bg-indigo-800 hover:text-white"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-indigo-700 text-xs text-indigo-400">
        Numinolabs © {new Date().getFullYear()}
      </div>
    </aside>
  );
}
