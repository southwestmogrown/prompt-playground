"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  userEmail?: string | null;
  isDemo?: boolean;
}

function PrismIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <polygon
        points="20,4 36,34 4,34"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <line x1="20" y1="4" x2="36" y2="34" stroke="#818cf8" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="20" y1="4" x2="28" y2="34" stroke="#a78bfa" strokeWidth="1.5" strokeOpacity="0.55" />
      <line x1="20" y1="4" x2="4"  y2="34" stroke="#60a5fa" strokeWidth="1.5" strokeOpacity="0.7" />
      <line x1="20" y1="4" x2="12" y2="34" stroke="#34d399" strokeWidth="1.5" strokeOpacity="0.55" />
    </svg>
  );
}

export default function Header({ userEmail, isDemo }: HeaderProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-[#30363D] bg-[#0D1117]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <nav className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <PrismIcon className="w-6 h-6 text-[#E6EDF3]" />
            <span className="text-sm font-semibold text-[#E6EDF3] tracking-tight">Prism</span>
          </Link>
          {!isDemo && (
            <>
              <Link
                href="/playground"
                className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
              >
                Playground
              </Link>
              <Link
                href="/history"
                className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
              >
                History
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {isDemo ? (
            <>
              <Link
                href="/signup"
                className="text-sm bg-indigo-500 hover:bg-indigo-600 text-white px-3 py-1.5 rounded-md font-medium transition-colors"
              >
                Sign up free
              </Link>
              <Link
                href="/login"
                className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              {userEmail && (
                <span className="text-sm text-[#484F58] hidden sm:block font-mono">
                  {userEmail}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-[#8B949E] hover:text-[#E6EDF3] transition-colors"
              >
                Sign out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
