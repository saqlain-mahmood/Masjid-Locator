// Query OpenStreetMap's Overpass API for real masjids near a coordinate.
// Free, no API key required. Docs: https://wiki.openstreetmap.org/wiki/Overpass_API

import { haversineKm } from "./distance";

export type NearbyMasjid = {
  id: string;            // osm id, e.g. "node/123" — used as stable key
  osmId: number;
  osmType: "node" | "way" | "relation";
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

type OverpassElement = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = { elements: OverpassElement[] };

const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
];

function buildQuery(lat: number, lng: number, radiusMeters: number) {
  return `
[out:json][timeout:25];
(
  node["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
  way["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
  relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radiusMeters},${lat},${lng});
);
out center tags;
`.trim();
}

export async function fetchNearbyMasjids(
  lat: number,
  lng: number,
  radiusMeters = 5000,
  limit = 60,
): Promise<NearbyMasjid[]> {
  const query = buildQuery(lat, lng, radiusMeters);

  let data: OverpassResponse | null = null;
  let lastErr: unknown = null;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          // Overpass enforces a meaningful UA; default Node fetch UA gets 406.
          "User-Agent": "MasjidLocator/1.0 (https://github.com/Saqlain-Mahmood/Masjid-Locator)",
          Accept: "application/json",
        },
        body: `data=${encodeURIComponent(query)}`,
        // small server-side cache so two refreshes from same coords don't hammer Overpass
        next: { revalidate: 300 },
      });
      if (!res.ok) {
        lastErr = new Error(`Overpass ${res.status}`);
        continue;
      }
      data = (await res.json()) as OverpassResponse;
      break;
    } catch (e) {
      lastErr = e;
    }
  }
  if (!data) throw lastErr ?? new Error("Overpass unreachable");

  const results: NearbyMasjid[] = [];
  for (const el of data.elements) {
    const point =
      el.type === "node"
        ? el.lat != null && el.lon != null
          ? { lat: el.lat, lng: el.lon }
          : null
        : el.center
          ? { lat: el.center.lat, lng: el.center.lon }
          : null;
    if (!point) continue;

    const t = el.tags ?? {};
    const name =
      t.name ||
      t["name:en"] ||
      t.alt_name ||
      t.short_name ||
      "Unnamed Masjid";

    const addressParts = [
      t["addr:housenumber"],
      t["addr:street"],
      t["addr:suburb"] || t["addr:neighbourhood"],
      t["addr:city"],
      t["addr:state"],
      t["addr:country"],
    ].filter(Boolean);

    results.push({
      id: `${el.type}/${el.id}`,
      osmId: el.id,
      osmType: el.type,
      name,
      latitude: point.lat,
      longitude: point.lng,
      address: addressParts.length ? addressParts.join(", ") : undefined,
      city: t["addr:city"],
      country: t["addr:country"],
      website: t.website || t["contact:website"],
      phone: t.phone || t["contact:phone"],
      distanceKm: haversineKm({ lat, lng }, { lat: point.lat, lng: point.lng }),
    });
  }

  results.sort((a, b) => a.distanceKm - b.distanceKm);
  return results.slice(0, limit);
}
