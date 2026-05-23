import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const masjids = [
  {
    slug: "masjid-al-haram",
    name: "Masjid Al Haram",
    address: "Mecca, Saudi Arabia",
    city: "Mecca",
    country: "Saudi Arabia",
    about:
      "The largest and holiest mosque in Islam, surrounding the Kaaba — the focal point for the Hajj pilgrimage.",
    contact: "+966-123-456-789",
    imageUrl: "/images/6.jpg",
    latitude: 21.4225,
    longitude: 39.8262,
  },
  {
    slug: "masjid-al-nabawi",
    name: "Masjid Al Nabawi",
    address: "Medina, Saudi Arabia",
    city: "Medina",
    country: "Saudi Arabia",
    about:
      "The second holiest mosque in Islam, the burial site of the Prophet Muhammad (PBUH).",
    contact: "+966-987-654-321",
    imageUrl: "/images/3.jpg",
    latitude: 24.4697,
    longitude: 39.6117,
  },
  {
    slug: "masjid-al-aqsa",
    name: "Masjid Al Aqsa",
    address: "Jerusalem, Palestine",
    city: "Jerusalem",
    country: "Palestine",
    about:
      "One of the holiest sites in Islam and the first qibla of the Muslims.",
    contact: "+972-2-658-0000",
    imageUrl: "/images/1.jpg",
    latitude: 31.7767,
    longitude: 35.2345,
  },
  {
    slug: "masjid-sultan-ahmed",
    name: "Sultan Ahmed Mosque (Blue Mosque)",
    address: "Istanbul, Turkey",
    city: "Istanbul",
    country: "Turkey",
    about:
      "One of Istanbul's most famous landmarks, known for its grand blue-tiled interior.",
    contact: "+90-212-518-1311",
    imageUrl: "/images/3.jpg",
    latitude: 41.0056,
    longitude: 28.976,
  },
  {
    slug: "masjid-al-hassan-ii",
    name: "Hassan II Mosque",
    address: "Casablanca, Morocco",
    city: "Casablanca",
    country: "Morocco",
    about:
      "Among the largest mosques in the world, dramatically set on the Atlantic coast.",
    contact: "+212-522-490-100",
    imageUrl: "/images/1.jpg",
    latitude: 33.5898,
    longitude: -7.6037,
  },
  {
    slug: "masjid-al-fateh",
    name: "Al Fateh Grand Mosque",
    address: "Manama, Bahrain",
    city: "Manama",
    country: "Bahrain",
    about:
      "One of the largest mosques in the world and a major cultural landmark in Bahrain.",
    contact: "+973-177-14411",
    imageUrl: "/images/6.jpg",
    latitude: 26.2247,
    longitude: 50.6027,
  },
  {
    slug: "masjid-al-azhar",
    name: "Al-Azhar Mosque",
    address: "Cairo, Egypt",
    city: "Cairo",
    country: "Egypt",
    about:
      "Part of Al-Azhar University, a leading center of Islamic scholarship for over a millennium.",
    contact: "+20-2-259-2090",
    imageUrl: "/images/3.jpg",
    latitude: 30.0335,
    longitude: 31.2357,
  },
  {
    slug: "faisal-mosque",
    name: "Faisal Mosque",
    address: "Islamabad, Pakistan",
    city: "Islamabad",
    country: "Pakistan",
    about:
      "The largest mosque in Pakistan, famous for its modernist tent-like design.",
    contact: "+92-51-9261122",
    imageUrl: "/images/4.webp",
    latitude: 33.7295,
    longitude: 73.0372,
  },
  {
    slug: "sheikh-zayed-grand-mosque",
    name: "Sheikh Zayed Grand Mosque",
    address: "Abu Dhabi, UAE",
    city: "Abu Dhabi",
    country: "United Arab Emirates",
    about:
      "An architectural masterpiece featuring the world's largest hand-knotted carpet and one of the largest chandeliers.",
    contact: "+971-2-419-1919",
    imageUrl: "/images/5.jpg",
    latitude: 24.4128,
    longitude: 54.4747,
  },
  {
    slug: "badshahi-mosque",
    name: "Badshahi Mosque",
    address: "Lahore, Pakistan",
    city: "Lahore",
    country: "Pakistan",
    about:
      "A Mughal-era mosque commissioned by Emperor Aurangzeb, an icon of Lahore.",
    contact: "+92-42-37374904",
    imageUrl: "/images/4.webp",
    latitude: 31.5881,
    longitude: 74.3099,
  },
];

async function main() {
  // demo admin user
  const adminHash = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@masjidlocator.dev" },
    update: {},
    create: {
      email: "admin@masjidlocator.dev",
      name: "Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });

  for (const m of masjids) {
    await prisma.masjid.upsert({
      where: { slug: m.slug },
      update: m,
      create: { ...m, createdById: admin.id },
    });
  }

  console.log(`Seeded ${masjids.length} masjids and admin user (admin@masjidlocator.dev / admin1234)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
