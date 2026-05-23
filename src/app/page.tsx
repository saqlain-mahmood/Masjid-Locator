import NearbyFinder from "@/components/NearbyFinder";

export default function Home() {
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-600 via-brand-700 to-emerald-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">
            Masjids near you, with live prayer times.
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-brand-50/90">
            Tap the button — we&apos;ll use your location to find real, nearby masjids from
            OpenStreetMap, show today&apos;s prayer times for each one, and give you one-tap
            directions.
          </p>
        </div>
      </section>

      <section className="mx-auto -mt-10 max-w-4xl px-4">
        <NearbyFinder />
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-center text-2xl font-bold text-slate-900">How it works</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {[
            {
              n: "1",
              t: "Share your location",
              d: "Click the button and allow location access — or type a city if you prefer.",
            },
            {
              n: "2",
              t: "Real masjid data",
              d: "We query OpenStreetMap's live community-maintained data — works in any country.",
            },
            {
              n: "3",
              t: "Pray on time",
              d: "Each masjid gets today's Fajr through Isha for its exact location, plus directions.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {s.n}
              </div>
              <h3 className="font-semibold text-slate-900">{s.t}</h3>
              <p className="mt-1 text-sm text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
