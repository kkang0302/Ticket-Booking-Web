const { isRedisAvailable, getRedis } = require("../../infrastructure/redis");

const IDEMPOTENCY_PREFIX = "idempotency:";
const LOCK_PREFIX = "lock:ticket:";

async function getBookingIdByIdempotencyKey(key) {
  if (!isRedisAvailable()) return null;

  try {
    const redis = getRedis();
    const cached = await redis.get(`${IDEMPOTENCY_PREFIX}${key}`);
    return cached ? Number(cached) : null;
  } catch {
    return null;
  }
}

async function cacheIdempotencyKey(key, bookingId, ttlSeconds = 3600) {
  if (!isRedisAvailable()) return;

  try {
    const redis = getRedis();
    await redis.set(`${IDEMPOTENCY_PREFIX}${key}`, String(bookingId), "EX", ttlSeconds, "NX");
  } catch {
    // Redis optional — DB remains source of truth
  }
}

async function acquireTicketLock(categoryId, ttlSeconds = 5) {
  if (!isRedisAvailable()) return true;

  try {
    const redis = getRedis();
    const result = await redis.set(`${LOCK_PREFIX}${categoryId}`, "1", "EX", ttlSeconds, "NX");
    return result === "OK";
  } catch {
    return true;
  }
}

async function releaseTicketLock(categoryId) {
  if (!isRedisAvailable()) return;

  try {
    const redis = getRedis();
    await redis.del(`${LOCK_PREFIX}${categoryId}`);
  } catch {
    // ignore
  }
}

module.exports = {
  getBookingIdByIdempotencyKey,
  cacheIdempotencyKey,
  acquireTicketLock,
  releaseTicketLock,
};
