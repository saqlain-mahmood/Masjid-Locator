import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { slug } = await params;
  const masjid = await prisma.masjid.findUnique({
    where: { slug },
    include: {
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
      },
      _count: { select: { favorites: true } },
    },
  });
  if (!masjid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const avg =
    masjid.reviews.length === 0
      ? 0
      : masjid.reviews.reduce((a, r) => a + r.rating, 0) / masjid.reviews.length;

  return NextResponse.json({
    masjid: { ...masjid, avgRating: Number(avg.toFixed(2)), favoriteCount: masjid._count.favorites },
  });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { slug } = await params;
  const masjid = await prisma.masjid.findUnique({ where: { slug } });
  if (!masjid) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (user.role !== "ADMIN" && masjid.createdById !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.masjid.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
