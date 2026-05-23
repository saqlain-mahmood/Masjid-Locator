"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  user: { id: string; name: string; email: string; role: string } | null;
};

export default function Navbar({ user }: Props) {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-brand-700">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            ✦
          </span>
          Masjid Locator
        </Link>

        <div className="flex items-center gap-1 sm:gap-3 text-sm">
          <Link href="/" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
            Browse
          </Link>
          <Link href="/map" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
            Map
          </Link>
          {user ? (
            <>
              <Link href="/favorites" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
                Favorites
              </Link>
              <Link
                href="/masjids/new"
                className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100"
              >
                Add
              </Link>
              <span className="hidden sm:inline text-slate-500 px-2">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="rounded-md bg-slate-900 px-3 py-2 text-white hover:bg-slate-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-brand-600 px-3 py-2 text-white hover:bg-brand-700"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
