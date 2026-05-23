import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(_req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const masjid = await prisma.masjid.findUnique({ where: { slug }, select: { id: true } });
  if (!masjid) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const existing = await prisma.favorite.findUnique({
    where: { userId_masjidId: { userId: user.id, masjidId: masjid.id } },
  });
  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({ data: { userId: user.id, masjidId: masjid.id } });
  return NextResponse.json({ favorited: true });
}
