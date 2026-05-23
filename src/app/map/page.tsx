import { prisma } from "@/lib/db";
import MasjidMapClient from "@/components/MasjidMapClient";

export const metadata = { title: "Map · Masjid Locator" };

export default async function MapPage() {
  const masjids = await prisma.masjid.findMany({
    select: { id: true, slug: true, name: true, latitude: true, longitude: true, address: true },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-4 text-2xl font-bold text-slate-900">Masjid Map</h1>
      <p className="mb-6 text-slate-600">
        Explore masjids around the world. Click a marker to see details.
      </p>
      <div className="h-[70vh] min-h-[500px]">
        <MasjidMapClient
          points={masjids}
          zoom={2}
          center={[25, 30]}
          className="h-full w-full rounded-2xl overflow-hidden border border-slate-200"
        />
      </div>
    </div>
  );
}
