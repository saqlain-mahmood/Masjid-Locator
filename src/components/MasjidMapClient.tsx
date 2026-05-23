"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";

const Map = dynamic(() => import("./MasjidMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[480px] w-full animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
  ),
});

export default function MasjidMapClient(props: ComponentProps<typeof Map>) {
  return <Map {...props} />;
}
