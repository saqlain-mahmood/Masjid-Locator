import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name too short").max(60),
  email: z.string().trim().toLowerCase().email("Invalid email").max(120),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password too long"),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(120),
  password: z.string().min(1).max(100),
});

export const masjidSchema = z.object({
  name: z.string().trim().min(2).max(120),
  address: z.string().trim().min(2).max(200),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  about: z.string().trim().min(10).max(2000),
  contact: z.string().trim().max(50).optional().or(z.literal("")),
  imageUrl: z.string().trim().url("Image URL must be a valid URL").max(500),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(3).max(1000),
});

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
