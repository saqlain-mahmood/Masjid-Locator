import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { reviewSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ slug: string }> };

export async function POST(req: Request, { params }: Ctx) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { slug } = await params;
  const masjid = await prisma.masjid.findUnique({ where: { slug }, select: { id: true } });
  if (!masjid) return NextResponse.json({ error: "Masjid not found" }, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 },
    );
  }

  const review = await prisma.review.upsert({
    where: { userId_masjidId: { userId: user.id, masjidId: masjid.id } },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      rating: parsed.data.rating,
      comment: parsed.data.comment,
      userId: user.id,
      masjidId: masjid.id,
    },
    include: { user: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ review }, { status: 201 });
}
