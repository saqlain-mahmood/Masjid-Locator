import { NextResponse } from "next/server";
import { z } from "zod";

const query = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
});

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = query.safeParse({
    lat: url.searchParams.get("lat"),
    lng: url.searchParams.get("lng"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  const { lat, lng } = parsed.data;

  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`,
      {
        headers: { Accept: "application/json", "User-Agent": "MasjidLocator/1.0" },
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    const json = (await res.json()) as { data: unknown };
    return NextResponse.json({ data: json.data }, {
      headers: { "Cache-Control": "public, max-age=600, s-maxage=3600" },
    });
  } catch {
    return NextResponse.json({ error: "Prayer-times unavailable" }, { status: 502 });
  }
}
