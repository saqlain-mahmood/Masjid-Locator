import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const favs = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { masjid: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ favorites: favs.map((f) => f.masjid) });
}
