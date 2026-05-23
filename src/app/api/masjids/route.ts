import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { masjidSchema, slugify } from "@/lib/validation";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";
  const country = searchParams.get("country")?.trim() ?? "";

  const where: Parameters<typeof prisma.masjid.findMany>[0] extends infer T
    ? T extends { where?: infer W }
      ? W
      : never
    : never = {};

  if (q) {
    Object.assign(where, {
      OR: [
        { name: { contains: q } },
        { address: { contains: q } },
        { city: { contains: q } },
        { country: { contains: q } },
      ],
    });
  }
  if (country) Object.assign(where, { country: { equals: country } });

  const masjids = await prisma.masjid.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { reviews: true, favorites: true } },
      reviews: { select: { rating: true } },
    },
  });

  const shaped = masjids.map((m) => {
    const ratings = m.reviews.map((r) => r.rating);
    const avg = ratings.length ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
    const { reviews, _count, ...rest } = m;
    return { ...rest, avgRating: Number(avg.toFixed(2)), reviewCount: _count.reviews, favoriteCount: _count.favorites };
  });

  return NextResponse.json({ masjids: shaped });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = masjidSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const data = parsed.data;
  let slug = slugify(data.name);
  // ensure unique slug
  let attempt = 0;
  while (await prisma.masjid.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${slugify(data.name)}-${attempt}`;
    if (attempt > 50) {
      return NextResponse.json({ error: "Could not generate slug" }, { status: 500 });
    }
  }

  const masjid = await prisma.masjid.create({
    data: {
      slug,
      name: data.name,
      address: data.address,
      city: data.city || null,
      country: data.country || null,
      about: data.about,
      contact: data.contact || null,
      imageUrl: data.imageUrl,
      latitude: data.latitude,
      longitude: data.longitude,
      createdById: user.id,
    },
  });

  return NextResponse.json({ masjid }, { status: 201 });
}
