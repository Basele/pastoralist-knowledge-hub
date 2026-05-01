const Redis = require('ioredis');
const { logger } = require('../utils/logger');

let redis;

exports.connectRedis = async () => {
  redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    retryStrategy: times => Math.min(times * 100, 3000),
    maxRetriesPerRequest: 3,
  });
  redis.on('connect', () => logger.info('✅ Redis connected'));
  redis.on('error', err => logger.error('Redis error:', err));
  exports.redis = redis;
};

exports.redis = null;

// Allow importing redis directly after connect
Object.defineProperty(exports, 'redis', {
  get: () => redis,
  set: (v) => { redis = v; },
});
