import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Masjid Locator — Find mosques near you",
  description:
    "Discover masjids around the world. Live prayer times, reviews, directions, and an interactive map.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar user={user} />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-500">
          Built with Next.js, Prisma, and OpenStreetMap · © {new Date().getFullYear()} Masjid Locator
        </footer>
      </body>
    </html>
  );
}
