"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  user: { id: string; name: string; email: string; role: string } | null;
};

export default function Navbar({ user }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setOpen(false);
    router.refresh();
    router.push("/");
  }

  const close = () => setOpen(false);
  const linkClass = "rounded-md px-3 py-2 text-slate-700 hover:bg-slate-100";

  const navLinks = (
    <>
      <Link href="/" className={linkClass} onClick={close}>
        Browse
      </Link>
      <Link href="/map" className={linkClass} onClick={close}>
        Map
      </Link>
      {user ? (
        <>
          <Link href="/favorites" className={linkClass} onClick={close}>
            Favorites
          </Link>
          <Link href="/masjids/new" className={linkClass} onClick={close}>
            Add
          </Link>
          <span className="hidden px-2 text-slate-500 sm:inline">{user.name}</span>
          <button
            onClick={logout}
            className="rounded-md bg-slate-900 px-3 py-2 text-left text-white hover:bg-slate-700"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className={linkClass} onClick={close}>
            Login
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-brand-600 px-3 py-2 text-white hover:bg-brand-700"
            onClick={close}
          >
            Sign up
          </Link>
        </>
      )}
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold text-brand-700"
          onClick={close}
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white">
            ✦
          </span>
          Masjid Locator
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 text-sm sm:flex sm:gap-3">{navLinks}</div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-slate-700 hover:bg-slate-100 sm:hidden"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-6 w-6"
          >
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-slate-200 bg-white sm:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-3 text-sm">
            {user && (
              <span className="px-3 py-1 text-slate-500">Signed in as {user.name}</span>
            )}
            {navLinks}
          </div>
        </div>
      )}
    </header>
  );
}
