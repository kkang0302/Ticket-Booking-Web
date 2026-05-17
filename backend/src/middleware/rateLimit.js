const rateLimit = require("express-rate-limit");
const { RedisStore } = require("rate-limit-redis");
const { isRedisAvailable, getRedis } = require("../infrastructure/redis");

function createBookingRateLimiter() {
  const baseOptions = {
    windowMs: 15 * 60 * 1000,
    max: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: "Too many booking requests. Please try again later.",
      },
    },
  };

  if (isRedisAvailable()) {
    try {
      const redis = getRedis();
      return rateLimit({
        ...baseOptions,
        store: new RedisStore({
          sendCommand: (...args) => redis.call(...args),
        }),
      });
    } catch {
      // fall through to memory store
    }
  }

  return rateLimit(baseOptions);
}

module.exports = {
  createBookingRateLimiter,
};
