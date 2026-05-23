"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewMasjidPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    country: "",
    about: "",
    contact: "",
    imageUrl: "",
    latitude: "",
    longitude: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function useMyLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      update("latitude", String(pos.coords.latitude));
      update("longitude", String(pos.coords.longitude));
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/masjids", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
      }),
    });
    setLoading(false);
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j.error ?? "Failed to add masjid");
      return;
    }
    const j = (await res.json()) as { masjid: { slug: string } };
    router.push(`/masjids/${j.masjid.slug}`);
  }

  const input =
    "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Add a Masjid</h1>
      <form onSubmit={onSubmit} className="space-y-4 rounded-2xl bg-white p-6 shadow-soft">
        <div>
          <label className="text-sm font-medium text-slate-700">Name</label>
          <input required value={form.name} onChange={(e) => update("name", e.target.value)} className={input} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Address</label>
          <input required value={form.address} onChange={(e) => update("address", e.target.value)} className={input} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">City</label>
            <input value={form.city} onChange={(e) => update("city", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Country</label>
            <input value={form.country} onChange={(e) => update("country", e.target.value)} className={input} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">About</label>
          <textarea required minLength={10} value={form.about} rows={4} onChange={(e) => update("about", e.target.value)} className={input} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Contact (optional)</label>
          <input value={form.contact} onChange={(e) => update("contact", e.target.value)} className={input} />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Image URL</label>
          <input required type="url" value={form.imageUrl} onChange={(e) => update("imageUrl", e.target.value)} className={input} placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700">Latitude</label>
            <input required type="number" step="any" value={form.latitude} onChange={(e) => update("latitude", e.target.value)} className={input} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Longitude</label>
            <input required type="number" step="any" value={form.longitude} onChange={(e) => update("longitude", e.target.value)} className={input} />
          </div>
        </div>
        <button type="button" onClick={useMyLocation} className="text-sm font-medium text-brand-700 hover:underline">
          Use my current location
        </button>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add masjid"}
        </button>
      </form>
    </div>
  );
}
