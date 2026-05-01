const { logger } = require('../utils/logger');
let redis;
exports.connectRedis = async () => {
  const store = new Map();
  redis = { get: async k => store.get(k)||null, set: async (k,v) => { store.set(k,v); return "OK"; }, setex: async (k,t,v) => { store.set(k,v); return "OK"; }, del: async k => { store.delete(k); return 1; }, on: ()=>{} };
  if (!process.env.REDIS_URL) return;
  try { const Redis = require("ioredis"); redis = new Redis(process.env.REDIS_URL, { retryStrategy: t => t > 3 ? null : t*200, lazyConnect: true }); await redis.connect(); } catch(e) { }
};
Object.defineProperty(exports, "redis", { get: () => redis, set: v => { redis = v; } });
