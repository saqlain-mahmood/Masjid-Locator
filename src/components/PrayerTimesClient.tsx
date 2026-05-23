"use client";

import { useEffect, useState } from "react";

type Timings = Record<string, string>;
type Data = {
  timings: Timings;
  date: { readable: string; hijri: { date: string; month: { en: string }; year: string } };
};

const ORDER = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"] as const;

function todayKey(lat: number, lng: number) {
  const d = new Date();
  const day = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  return `ml-prayer:${lat.toFixed(3)},${lng.toFixed(3)}:${day}`;
}

function nextPrayer(timings: Timings): string | null {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const name of ORDER) {
    const t = timings[name];
    if (!t) continue;
    const [hStr, mStr] = t.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isFinite(h) && Number.isFinite(m) && h * 60 + m > nowMin) return name;
  }
  return null;
}

export default function PrayerTimesClient({
  lat,
  lng,
  compact = false,
}: {
  lat: number;
  lng: number;
  compact?: boolean;
}) {
  const [data, setData] = useState<Data | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const key = todayKey(lat, lng);

    try {
      const cached = typeof window !== "undefined" ? localStorage.getItem(key) : null;
      if (cached) {
        setData(JSON.parse(cached));
        setLoading(false);
        return;
      }
    } catch {
      /* ignore */
    }

    (async () => {
      try {
        const res = await fetch(`/api/prayer-times?lat=${lat}&lng=${lng}`);
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as { data: Data };
        if (cancelled) return;
        setData(j.data);
        try {
          localStorage.setItem(key, JSON.stringify(j.data));
        } catch {
          /* ignore */
        }
      } catch {
        if (!cancelled) setError("Could not load prayer times");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  if (loading) {
    return (
      <div className={compact ? "h-6 w-32 animate-pulse rounded bg-slate-200" : "h-40 animate-pulse rounded-2xl bg-slate-100"} />
    );
  }
  if (error || !data) {
    return <p className="text-sm text-slate-500">Prayer times unavailable.</p>;
  }

  const upcoming = nextPrayer(data.timings);

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
        {ORDER.filter((n) => n !== "Sunrise").map((n) => (
          <span key={n} className={upcoming === n ? "font-semibold text-brand-700" : ""}>
            <span className="text-slate-500">{n}</span>{" "}
            <span className="font-mono">{data.timings[n]}</span>
          </span>
        ))}
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
            className={`flex items-center justify-between rounded-lg px-3 py-2 ${
              upcoming === name ? "bg-brand-600 text-white" : "bg-brand-50 text-brand-900"
            }`}
          >
            <span className="text-sm font-medium">{name}</span>
            <span className="font-mono text-sm">{data.timings[name]}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-slate-400">
        Source: Aladhan API · Method: Islamic Society of North America · Times shown in the masjid&apos;s local timezone.
      </p>
    </div>
  );
}
