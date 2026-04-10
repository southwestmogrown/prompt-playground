"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface SidebarProps {
  userEmail?: string | null;
}

export default function Sidebar({ userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  const navItems = [
    { href: "/playground", label: "Playground", icon: "auto_awesome" },
    { href: "/history",    label: "History",    icon: "history"       },
  ];

  return (
    <aside className="hidden lg:flex fixed left-4 top-20 bottom-4 w-64 rounded-3xl bg-stone-50/40 backdrop-blur-2xl ghost-border shadow-2xl shadow-orange-500/5 flex-col p-4 gap-2 z-40">
      {/* Brand block */}
      <div className="flex items-center gap-3 px-2 py-3 mb-2">
        <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-sm">
          <span
            className="material-symbols-outlined text-white text-base"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>
        <div>
          <p className="text-sm font-black tracking-tighter text-on-surface font-headline leading-tight">
            Prism
          </p>
          <p className="text-[10px] uppercase tracking-widest text-on-surface-variant font-bold leading-tight">
            Luminous Editor
          </p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 space-y-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-gradient-to-br from-orange-400/20 to-amber-500/20 text-orange-700 shadow-[0_0_15px_rgba(255,127,80,0.1)] translate-x-0.5"
                  : "text-on-surface-variant hover:bg-stone-200/40 hover:text-on-surface hover:translate-x-0.5"
              }`}
            >
              <span
                className="material-symbols-outlined text-xl"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="space-y-1 pt-4 border-t border-outline-variant/10">
        {userEmail && (
          <div className="px-3 py-2 mb-1">
            <p className="text-[11px] text-on-surface-variant truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-stone-200/40 hover:text-on-surface transition-all duration-200"
        >
          <span className="material-symbols-outlined text-xl">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
