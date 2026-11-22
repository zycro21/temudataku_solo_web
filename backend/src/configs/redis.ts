// src/config/redis.ts
//
// Koneksi Redis + helper cache. Kalau REDIS_URL tidak diset, cache otomatis
// nonaktif (semua helper jadi no-op) dan aplikasi tetap jalan seperti biasa.
// Kalau Redis mati/error, helper juga tidak melempar error: request jatuh ke
// database.
import "dotenv/config";
import { Redis } from "ioredis";

const url = process.env.REDIS_URL;

export const redis: Redis | null = url
  ? new Redis(url, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false, // gagal cepat saat Redis putus, jangan menggantung
    })
  : null;

redis?.on("error", (e) => console.error("[redis]", e.message));

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  try {
    const raw = await redis.get(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number,
): Promise<void> {
  if (!redis) return;
  try {
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch {
    // abaikan: cache hanya optimasi
  }
}

export async function cacheDel(keys: string[]): Promise<void> {
  if (!redis || keys.length === 0) return;
  try {
    await redis.del(...keys);
  } catch {
    // abaikan
  }
}
