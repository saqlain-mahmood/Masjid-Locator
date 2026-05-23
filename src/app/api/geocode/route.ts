import { NextResponse } from "next/server";
import { rateLimit, clientKey } from "@/lib/rateLimit";

export async function GET(req: Request) {
  const rl = rateLimit(clientKey(req, "geocode"), 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 2 || q.length > 120) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
      {
        headers: {
          "User-Agent":
            "MasjidLocator/1.0 (https://github.com/Saqlain-Mahmood/Masjid-Locator)",
          Accept: "application/json",
        },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return NextResponse.json({ error: "Geocoder error" }, { status: 502 });
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data[0]) return NextResponse.json({ error: "City not found" }, { status: 404 });
    return NextResponse.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    });
  } catch {
    return NextResponse.json({ error: "Geocoder unreachable" }, { status: 502 });
  }
}
