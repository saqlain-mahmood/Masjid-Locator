"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import PrayerTimesClient from "./PrayerTimesClient";

const Map = dynamic(() => import("./MasjidMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
  ),
});

type NearbyMasjid = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
  city?: string;
  country?: string;
  website?: string;
  phone?: string;
  distanceKm: number;
};

type Status = "idle" | "locating" | "fetching" | "ready" | "error";

const RADII = [2, 5, 10, 25] as const;

export default function NearbyFinder() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null);
  const [masjids, setMasjids] = useState<NearbyMasjid[]>([]);
  const [radius, setRadius] = useState<number>(5);
  const [expanded, setExpanded] = useState<string | null>(null);

  async function search(lat: number, lng: number, radiusKm: number) {
    setStatus("fetching");
    setError(null);
    try {
      const res = await fetch(
        `/api/nearby?lat=${lat}&lng=${lng}&radius=${Math.round(radiusKm * 1000)}`,
      );
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? "Failed to find masjids");
      }
      const j = (await res.json()) as { masjids: NearbyMasjid[]; origin: { lat: number; lng: number } };
      setMasjids(j.masjids);
      setOrigin(j.origin);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to find masjids");
      setStatus("error");
    }
  }

  function findNearMe() {
    setError(null);
    if (!("geolocation" in navigator)) {
      setError("Your browser does not support geolocation.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        search(latitude, longitude, radius);
      },
      (err) => {
        setStatus("error");
        setError(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Try the city search below."
            : "Could not get your location. Try the city search below.",
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 60_000 },
    );
  }

  async function searchCity(name: string) {
    if (!name.trim()) return;
    setStatus("locating");
    setError(null);
    try {
      const res = await fetch(
        `/api/geocode?q=${encodeURIComponent(name)}`,
      );
      if (!res.ok) throw new Error("City not found");
      const data = (await res.json()) as { lat: number; lng: number } | { error: string };
      if ("error" in data) throw new Error(data.error);
      search(data.lat, data.lng, radius);
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Could not find that location");
    }
  }

  const points = masjids.map((m) => ({
    id: m.id,
    name: m.name,
    latitude: m.latitude,
    longitude: m.longitude,
    address: m.address,
  }));

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
        <h2 className="text-xl font-bold text-slate-900">Find masjids near you</h2>
        <p className="mt-1 text-sm text-slate-600">
          Uses live OpenStreetMap data — works anywhere in the world.
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-600">Radius:</span>
          {RADII.map((r) => (
            <button
              key={r}
              onClick={() => setRadius(r)}
              className={`rounded-full px-3 py-1 text-sm transition ${
                radius === r
                  ? "bg-brand-600 text-white"
                  : "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={findNearMe}
            disabled={status === "locating" || status === "fetching"}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-3 font-medium text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          >
            <span aria-hidden>📍</span>
            {status === "locating"
              ? "Getting your location..."
              : status === "fetching"
                ? "Finding masjids..."
                : "Find masjids near me"}
          </button>

          <CityInput onSubmit={searchCity} />
        </div>

        {error && (
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>
        )}
      </div>

      {status === "ready" && (
        <>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-semibold text-slate-900">
              {masjids.length} masjid{masjids.length === 1 ? "" : "s"} within {radius} km
            </h3>
            {origin && (
              <span className="text-xs text-slate-500 font-mono">
                {origin.lat.toFixed(3)}, {origin.lng.toFixed(3)}
              </span>
            )}
          </div>

          {origin && masjids.length > 0 && (
            <Map
              points={[
                { id: "_you", name: "Your location", latitude: origin.lat, longitude: origin.lng },
                ...points,
              ]}
              center={[origin.lat, origin.lng]}
              zoom={13}
              className="h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200"
            />
          )}

          {masjids.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">
              No masjids found within {radius} km. Try a larger radius.
            </p>
          ) : (
            <ul className="space-y-3">
              {masjids.map((m) => {
                const isOpen = expanded === m.id;
                const directions = `https://www.openstreetmap.org/directions?from=${origin?.lat},${origin?.lng}&to=${m.latitude},${m.longitude}`;
                return (
                  <li
                    key={m.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h4 className="text-base font-semibold text-slate-900">{m.name}</h4>
                        {m.address && (
                          <p className="mt-0.5 text-sm text-slate-500">{m.address}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-800 font-medium">
                            {m.distanceKm.toFixed(2)} km away
                          </span>
                          {m.phone && <span>📞 {m.phone}</span>}
                          {m.website && (
                            <a
                              href={m.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-brand-700 hover:underline"
                            >
                              website ↗
                            </a>
                          )}
                        </div>

                        <div className="mt-3">
                          <PrayerTimesClient lat={m.latitude} lng={m.longitude} compact />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <a
                          href={directions}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-brand-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-brand-700"
                        >
                          Directions
                        </a>
                        <button
                          onClick={() => setExpanded(isOpen ? null : m.id)}
                          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                        >
                          {isOpen ? "Hide times" : "Full prayer times"}
                        </button>
                      </div>
                    </div>

                    {isOpen && (
                      <div className="mt-4">
                        <PrayerTimesClient lat={m.latitude} lng={m.longitude} />
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function CityInput({ onSubmit }: { onSubmit: (s: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(v);
      }}
      className="flex flex-1 gap-2"
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder="...or type a city (e.g. London, Karachi)"
        className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      <button
        type="submit"
        className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
      >
        Search
      </button>
    </form>
  );
}
