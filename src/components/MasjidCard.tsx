import Link from "next/link";
import type { Masjid } from "@prisma/client";

type Props = {
  masjid: Masjid & { avgRating?: number; reviewCount?: number; favoriteCount?: number };
  distanceKm?: number | null;
};

function Stars({ value }: { value: number }) {
  const full = Math.round(value);
  return (
    <span className="text-amber-500" aria-label={`${value} out of 5 stars`}>
      {"★".repeat(full)}
      <span className="text-slate-300">{"★".repeat(5 - full)}</span>
    </span>
  );
}

export default function MasjidCard({ masjid, distanceKm }: Props) {
  return (
    <Link
      href={`/masjids/${masjid.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative h-44 w-full overflow-hidden bg-slate-200">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={masjid.imageUrl}
          alt={masjid.name}
          loading="lazy"
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        {distanceKm != null && (
          <span className="absolute right-3 top-3 rounded-full bg-black/70 px-2.5 py-1 text-xs font-medium text-white">
            {distanceKm.toFixed(1)} km away
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-lg font-semibold text-slate-900 line-clamp-1">{masjid.name}</h3>
        <p className="text-sm text-slate-500 line-clamp-1">{masjid.address}</p>
        <p className="text-sm text-slate-600 line-clamp-2">{masjid.about}</p>

        <div className="mt-auto flex items-center justify-between pt-2 text-sm">
          <div className="flex items-center gap-1">
            <Stars value={masjid.avgRating ?? 0} />
            <span className="text-slate-500">
              ({masjid.reviewCount ?? 0})
            </span>
          </div>
          <span className="text-brand-700 font-medium group-hover:underline">View →</span>
        </div>
      </div>
    </Link>
  );
}
