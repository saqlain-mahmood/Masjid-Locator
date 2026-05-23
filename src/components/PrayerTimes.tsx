import { unstable_cache } from "next/cache";

type AladhanResponse = {
  data: {
    timings: Record<string, string>;
    date: { readable: string; hijri: { date: string; month: { en: string }; year: string } };
  };
};

const fetchTimings = unstable_cache(
  async (lat: number, lng: number): Promise<AladhanResponse["data"] | null> => {
    try {
      const res = await fetch(
        `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`,
        {
          headers: { Accept: "application/json", "User-Agent": "MasjidLocator/1.0" },
          next: { revalidate: 3600 },
        },
      );
      if (!res.ok) return null;
      const json = (await res.json()) as AladhanResponse;
      return json.data;
    } catch {
      return null;
    }
  },
  ["prayer-times"],
  { revalidate: 3600 },
);

const ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

export default async function PrayerTimes({ lat, lng }: { lat: number; lng: number }) {
  const data = await fetchTimings(lat, lng);

  if (!data) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-2 text-lg font-semibold">Prayer Times</h3>
        <p className="text-sm text-slate-500">Could not load prayer times right now.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-3 flex items-baseline justify-between">
        <h3 className="text-lg font-semibold">Today&apos;s Prayer Times</h3>
        <span className="text-xs text-slate-500">
          {data.date.hijri.date} {data.date.hijri.month.en} {data.date.hijri.year} AH
        </span>
      </div>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {ORDER.map((name) => (
          <li
            key={name}
            className="flex items-center justify-between rounded-lg bg-brand-50 px-3 py-2"
          >
            <span className="text-sm font-medium text-brand-800">{name}</span>
            <span className="font-mono text-sm text-slate-700">{data.timings[name]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">
        Source: Aladhan API · Method: Islamic Society of North America
      </p>
    </div>
  );
}
