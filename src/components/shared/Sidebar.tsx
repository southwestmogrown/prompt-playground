"use client";

import Link from "next/link";
import Image from "next/image";
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
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 bg-surface-container-low border-r border-[rgba(255,255,255,0.07)] flex-col pt-14 pb-4 z-30">
      {/* Brand block */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[rgba(255,255,255,0.07)]">
        <div className="w-8 h-8 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)]">
          <Image src="/prism-logo.png" alt="Prism" width={32} height={32} className="object-cover w-full h-full" />
        </div>
        <div>
          <p className="font-mono text-xs font-medium tracking-widest text-primary uppercase leading-tight">
            Prism AI
          </p>
          <p className="console-label leading-tight mt-0.5">Console</p>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-3 space-y-0.5 mt-1">
        {navItems.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-mono font-medium transition-all duration-200 ${
                active
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface border border-transparent"
              }`}
            >
              <span
                className="material-symbols-outlined text-[16px]"
                style={active ? { fontVariationSettings: "'FILL' 1" } : undefined}
              >
                {icon}
              </span>
              {label}
              {active && <span className="ml-auto led led-active" />}
            </Link>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 space-y-1 border-t border-[rgba(255,255,255,0.07)] pt-3">
        {userEmail && (
          <div className="px-3 py-2">
            <p className="font-mono text-[10px] text-on-surface-variant truncate">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-mono text-xs font-medium text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-all duration-200"
        >
          <span className="material-symbols-outlined text-[16px]">logout</span>
          Sign out
        </button>
      </div>
    </aside>
  );
}
