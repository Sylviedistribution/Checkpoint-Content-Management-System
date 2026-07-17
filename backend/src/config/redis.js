const redis = require('redis');
require('dotenv').config();

let redisClient = null;

if (process.env.REDIS_ENABLED === 'true') {
  redisClient = redis.createClient({
    url: process.env.REDIS_URL || undefined,
    socket: process.env.REDIS_URL
      ? undefined
      : { host: process.env.REDIS_HOST || 'localhost', port: parseInt(process.env.REDIS_PORT) || 6379 },
    password: process.env.REDIS_PASSWORD || undefined
  });
  redisClient.on('error', (err) => console.error('Redis error:', err.message));
  (async () => {
    try { await redisClient.connect(); console.log('Redis connected'); }
    catch (e) { console.error('Redis connection failed:', e.message); redisClient = null; }
  })();
}

const cache = {
  get: async (key) => {
    if (!redisClient) return null;
    try { const d = await redisClient.get(key); return d ? JSON.parse(d) : null; }
    catch { return null; }
  },
  set: async (key, value, ttl = 3600) => {
    if (!redisClient) return false;
    try { await redisClient.setEx(key, ttl, JSON.stringify(value)); return true; }
    catch { return false; }
  },
  del: async (key) => {
    if (!redisClient) return false;
    try { await redisClient.del(key); return true; } catch { return false; }
  },
  delPattern: async (pattern) => {
    if (!redisClient) return false;
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length) await redisClient.del(keys);
      return true;
    } catch { return false; }
  }
};

module.exports = { redisClient, cache };
