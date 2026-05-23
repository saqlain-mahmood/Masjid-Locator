import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchNearbyMasjids } from "@/lib/overpass";
import { rateLimit, clientKey } from "@/lib/rateLimit";

const query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().int().min(500).max(50_000).default(5000),
});

export async function GET(req: Request) {
  const rl = rateLimit(clientKey(req, "nearby"), 30, 60_000);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "Too many requests. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfter) } },
    );
  }

  const url = new URL(req.url);
  const parsed = query.safeParse({
    lat: url.searchParams.get("lat"),
    lng: url.searchParams.get("lng"),
    radius: url.searchParams.get("radius") ?? undefined,
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const masjids = await fetchNearbyMasjids(parsed.data.lat, parsed.data.lng, parsed.data.radius);
    return NextResponse.json({ masjids, origin: { lat: parsed.data.lat, lng: parsed.data.lng } });
  } catch (e) {
    console.error("Overpass error:", e);
    return NextResponse.json(
      { error: "Could not reach masjid data source. Try again." },
      { status: 502 },
    );
  }
}
