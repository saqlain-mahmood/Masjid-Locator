import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import MasjidCard from "@/components/MasjidCard";

export const metadata = { title: "Your favorites · Masjid Locator" };

export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: {
      masjid: {
        include: {
          reviews: { select: { rating: true } },
          _count: { select: { reviews: true, favorites: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Your favorites</h1>
      {favs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
          You haven&apos;t favorited any masjids yet.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {favs.map((f) => {
            const m = f.masjid;
            const ratings = m.reviews.map((r) => r.rating);
            const avg =
              ratings.length === 0
                ? 0
                : ratings.reduce((a, b) => a + b, 0) / ratings.length;
            const { reviews: _r, _count, ...rest } = m;
            return (
              <MasjidCard
                key={m.id}
                masjid={{
                  ...rest,
                  avgRating: Number(avg.toFixed(2)),
                  reviewCount: _count.reviews,
                  favoriteCount: _count.favorites,
                }}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
