"use client";

import Link from "next/link";
import Image from "next/image";
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
    <header className="w-full sticky top-0 z-50 bg-surface-container-low border-b border-[rgba(255,255,255,0.07)] flex justify-between items-center px-6 h-14">
      {/* Logo */}
      <div className="flex items-center gap-5">
        <Link
          href={isDemo ? "/" : "/playground"}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-6 h-6 rounded overflow-hidden shrink-0">
            <Image src="/prism-logo.png" alt="Prism" width={24} height={24} className="object-cover w-full h-full" />
          </div>
          <span className="font-mono text-xs font-medium tracking-widest text-primary uppercase">Prism</span>
        </Link>

        {/* Demo nav */}
        {isDemo && (
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/playground?demo=true" className="console-label hover:text-on-surface transition-colors">
              Demo
            </Link>
          </nav>
        )}

        {/* Authenticated mobile nav */}
        {!isDemo && userEmail && (
          <nav className="flex lg:hidden items-center gap-4">
            <Link
              href="/playground"
              className={`console-label transition-colors ${pathname === "/playground" ? "text-primary" : "hover:text-on-surface"}`}
            >
              Playground
            </Link>
            <Link
              href="/history"
              className={`console-label transition-colors ${pathname === "/history" ? "text-primary" : "hover:text-on-surface"}`}
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
            <Link href="/login" className="console-label hover:text-on-surface transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="console-label px-4 py-1.5 rounded-lg bg-primary text-on-primary font-bold glow-primary transition-all"
            >
              Sign up free
            </Link>
          </>
        ) : userEmail ? (
          <>
            <span className="hidden sm:block font-mono text-xs text-on-surface-variant truncate max-w-[180px]">
              {userEmail}
            </span>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 console-label hover:text-on-surface transition-colors"
            >
              <span className="material-symbols-outlined text-[14px]">logout</span>
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="console-label hover:text-on-surface transition-colors">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="console-label px-4 py-1.5 rounded-lg bg-primary text-on-primary font-bold glow-primary transition-all"
            >
              Sign up free
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
