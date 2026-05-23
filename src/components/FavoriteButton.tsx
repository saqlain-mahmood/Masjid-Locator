"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FavoriteButton({
  slug,
  initialFavorited,
  isLoggedIn,
}: {
  slug: string;
  initialFavorited: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch(`/api/masjids/${slug}/favorite`, { method: "POST" });
    setLoading(false);
    if (res.ok) {
      const j = (await res.json()) as { favorited: boolean };
      setFavorited(j.favorited);
      router.refresh();
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
        favorited
          ? "border-rose-200 bg-rose-50 text-rose-700"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span aria-hidden>{favorited ? "♥" : "♡"}</span>
      {favorited ? "Favorited" : "Favorite"}
    </button>
  );
}
