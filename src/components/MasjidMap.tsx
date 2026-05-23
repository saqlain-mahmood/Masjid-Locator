"use client";

import { useEffect, useId, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Link from "next/link";

// Fix default marker icons (Leaflet has a known issue in bundlers).
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

type Point = {
  id: string;
  slug?: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
};

type Props = {
  points: Point[];
  center?: [number, number];
  zoom?: number;
  className?: string;
};

export default function MasjidMap({
  points,
  center,
  zoom = 3,
  className = "h-[480px] w-full rounded-2xl overflow-hidden border border-slate-200",
}: Props) {
  // Only render after mount — guarantees the container DOM node didn't exist
  // before, so Leaflet never sees an already-initialised one.
  const [ready, setReady] = useState(false);
  const uid = useId();
  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    // ensure default icon prototype is set
    // @ts-expect-error leaflet's internal symbol
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconUrl: icon.options.iconUrl,
      iconRetinaUrl: icon.options.iconRetinaUrl,
      shadowUrl: icon.options.shadowUrl,
    });
  }, []);

  const initialCenter: [number, number] =
    center ??
    (points[0]
      ? [points[0].latitude, points[0].longitude]
      : [21.4225, 39.8262]);

  if (!ready) {
    return <div className={`${className} animate-pulse bg-slate-100`} />;
  }

  return (
    <div className={className}>
      <MapContainer key={uid} center={initialCenter} zoom={zoom} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {points.map((p) => (
          <Marker key={p.id} position={[p.latitude, p.longitude]} icon={icon}>
            <Popup>
              <div className="space-y-1">
                <div className="font-semibold">{p.name}</div>
                {p.address && <div className="text-xs text-slate-500">{p.address}</div>}
                {p.slug && (
                  <Link
                    href={`/masjids/${p.slug}`}
                    className="text-brand-700 text-sm font-medium hover:underline"
                  >
                    View details →
                  </Link>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
