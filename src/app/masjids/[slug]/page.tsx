import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import MasjidMapClient from "@/components/MasjidMapClient";
import PrayerTimes from "@/components/PrayerTimes";
import ReviewForm from "@/components/ReviewForm";
import FavoriteButton from "@/components/FavoriteButton";
import Link from "next/link";

export default async function MasjidDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const masjid = await prisma.masjid.findUnique({
    where: { slug },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      },
    },
  });
  if (!masjid) notFound();

  const user = await getCurrentUser();
  const favorited = user
    ? !!(await prisma.favorite.findUnique({
        where: { userId_masjidId: { userId: user.id, masjidId: masjid.id } },
      }))
    : false;

  const avg =
    masjid.reviews.length === 0
      ? 0
      : masjid.reviews.reduce((a, r) => a + r.rating, 0) / masjid.reviews.length;

  const directionsUrl = `https://www.openstreetmap.org/directions?to=${masjid.latitude}%2C${masjid.longitude}`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <Link href="/" className="text-sm text-brand-700 hover:underline">
          ← Back to all masjids
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={masjid.imageUrl}
              alt={masjid.name}
              className="h-72 w-full object-cover sm:h-96"
            />
            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">{masjid.name}</h1>
                  <p className="mt-1 text-slate-500">{masjid.address}</p>
                </div>
                <div className="flex items-center gap-2">
                  <FavoriteButton
                    slug={masjid.slug}
                    initialFavorited={favorited}
                    isLoggedIn={!!user}
                  />
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
                  >
                    Get Directions
                  </a>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3 text-sm text-slate-600">
                <span className="text-amber-500">
                  {"★".repeat(Math.round(avg))}
                  <span className="text-slate-300">{"★".repeat(5 - Math.round(avg))}</span>
                </span>
                <span>
                  {avg.toFixed(1)} · {masjid.reviews.length} review
                  {masjid.reviews.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mt-4 text-slate-700">{masjid.about}</p>
              {masjid.contact && (
                <p className="mt-3 text-sm text-slate-600">
                  <strong>Contact:</strong> {masjid.contact}
                </p>
              )}
            </div>
          </div>

          <MasjidMapClient
            points={[
              {
                id: masjid.id,
                slug: masjid.slug,
                name: masjid.name,
                latitude: masjid.latitude,
                longitude: masjid.longitude,
                address: masjid.address,
              },
            ]}
            center={[masjid.latitude, masjid.longitude]}
            zoom={14}
            className="h-[360px] w-full overflow-hidden rounded-2xl border border-slate-200"
          />

          <div>
            <h2 className="mb-4 text-xl font-bold">Reviews</h2>
            {user ? (
              <ReviewForm slug={masjid.slug} />
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
                <Link href="/login" className="font-medium text-brand-700 hover:underline">
                  Log in
                </Link>{" "}
                to leave a review.
              </div>
            )}
            <ul className="mt-4 space-y-3">
              {masjid.reviews.length === 0 && (
                <li className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-500">
                  No reviews yet — be the first.
                </li>
              )}
              {masjid.reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                  <div className="flex items-center justify-between">
                    <strong className="text-slate-800">{r.user.name}</strong>
                    <span className="text-amber-500">
                      {"★".repeat(r.rating)}
                      <span className="text-slate-300">{"★".repeat(5 - r.rating)}</span>
                    </span>
                  </div>
                  <p className="mt-2 text-slate-700">{r.comment}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-6">
          <PrayerTimes lat={masjid.latitude} lng={masjid.longitude} />
          <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
            <h3 className="mb-2 text-lg font-semibold text-slate-900">Location</h3>
            <p>{masjid.address}</p>
            <p className="mt-2 font-mono text-xs text-slate-500">
              {masjid.latitude.toFixed(4)}, {masjid.longitude.toFixed(4)}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
