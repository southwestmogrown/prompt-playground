"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface HeaderProps {
  userEmail?: string | null;
  isDemo?: boolean;
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
    <header className="border-b border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-semibold text-gray-900 hover:text-gray-700"
          >
            Prompt Playground
          </Link>
          {!isDemo && (
            <>
              <Link
                href="/playground"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Playground
              </Link>
              <Link
                href="/history"
                className="text-sm text-gray-600 hover:text-gray-900"
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
                className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
              >
                Sign Up Free
              </Link>
              <Link
                href="/login"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              {userEmail && (
                <span className="text-sm text-gray-500 hidden sm:block">
                  {userEmail}
                </span>
              )}
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-600 hover:text-gray-900"
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
