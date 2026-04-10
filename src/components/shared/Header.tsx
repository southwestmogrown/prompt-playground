"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  userEmail?: string | null;
  isDemo?: boolean;
}

export default function Header({ userEmail, isDemo }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="w-full sticky top-0 z-50 bg-stone-50/60 backdrop-blur-xl ghost-border shadow-[0_8px_32px_0_rgba(255,127,80,0.08)] flex justify-between items-center px-6 h-16">
      {/* Logo */}
      <div className="flex items-center gap-6">
        <Link
          href={isDemo ? "/" : "/playground"}
          className="text-xl font-black tracking-tighter bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent font-headline hover:opacity-85 transition-opacity"
        >
          Prism
        </Link>

        {/* Desktop nav links — only for demo (authenticated gets sidebar) */}
        {isDemo && (
          <nav className="hidden md:flex items-center gap-5">
            <Link
              href="/playground?demo=true"
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors duration-200"
            >
              Demo
            </Link>
          </nav>
        )}

        {/* Authenticated top nav links on mobile (sidebar hidden) */}
        {!isDemo && userEmail && (
          <nav className="flex lg:hidden items-center gap-5">
            <Link
              href="/playground"
              className={`text-sm font-semibold transition-colors duration-200 ${
                pathname === "/playground"
                  ? "text-orange-600 border-b-2 border-orange-500 pb-0.5"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Playground
            </Link>
            <Link
              href="/history"
              className={`text-sm font-semibold transition-colors duration-200 ${
                pathname === "/history"
                  ? "text-orange-600 border-b-2 border-orange-500 pb-0.5"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              History
            </Link>
          </nav>
        )}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {isDemo ? (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all duration-200"
            >
              Sign up free
            </Link>
          </>
        ) : userEmail ? (
          <>
            <span className="hidden sm:block text-xs text-on-surface-variant font-medium truncate max-w-[180px]">
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-base">logout</span>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors duration-200"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-xl text-sm font-bold shadow-sm active:scale-95 transition-all duration-200"
            >
              Sign up free
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
