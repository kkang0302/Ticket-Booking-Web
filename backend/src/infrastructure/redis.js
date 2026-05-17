const Redis = require("ioredis");

let client = null;
let available = false;
let initPromise = null;

async function initRedis() {
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (process.env.REDIS_ENABLED === "false") {
      console.warn("Redis disabled (REDIS_ENABLED=false) — using in-memory fallbacks");
      return false;
    }

    const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";

    const redis = new Redis(url, {
      maxRetriesPerRequest: 1,
      connectTimeout: 5000,
      retryStrategy: () => null,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    try {
      await redis.connect();
      await redis.ping();
      client = redis;
      available = true;

      redis.on("error", (err) => {
        if (available) {
          console.error("Redis error:", err.message);
          available = false;
        }
      });

      console.log("Redis connected");
      return true;
    } catch (err) {
      try {
        redis.disconnect();
      } catch {
        // ignore
      }
      client = null;
      available = false;
      console.warn(
        `Redis unavailable (${err.message}) — rate limit/idempotency cache use in-memory or DB only`
      );
      return false;
    }
  })();

  return initPromise;
}

function isRedisAvailable() {
  return available && client !== null && client.status === "ready";
}

function getRedis() {
  if (!isRedisAvailable()) {
    throw new Error("Redis not available");
  }
  return client;
}

/** @deprecated use initRedis */
async function connectRedis() {
  await initRedis();
  return isRedisAvailable() ? client : null;
}

module.exports = {
  initRedis,
  connectRedis,
  isRedisAvailable,
  getRedis,
};
