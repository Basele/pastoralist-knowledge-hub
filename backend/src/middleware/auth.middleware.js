const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');
const { redis } = require('../config/redis');

exports.authenticate = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new AppError('No token provided', 401);

    const token = header.split(' ')[1];

    // Check blacklist
    const blacklisted = await redis.get(`blacklist:${token}`);
    if (blacklisted) throw new AppError('Token revoked', 401);

    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

exports.optionalAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      const token = header.split(' ')[1];
      const blacklisted = await redis.get(`blacklist:${token}`);
      if (!blacklisted) {
        req.user = verifyAccessToken(token);
      }
    }
    next();
  } catch {
    next(); // silently continue without user
  }
};

exports.requireRole = (...roles) => (req, res, next) => {
  if (!req.user) return next(new AppError('Unauthenticated', 401));
  if (!roles.includes(req.user.role)) return next(new AppError('Insufficient permissions', 403));
  next();
};

exports.requireTier = (...tiers) => (req, res, next) => {
  const ORDER = { PUBLIC: 0, COMMUNITY: 1, ELDER: 2, SACRED: 3 };
  if (!req.user) return next(new AppError('Unauthenticated', 401));
  const minRequired = Math.min(...tiers.map(t => ORDER[t]));
  if (ORDER[req.user.accessTier] < minRequired) {
    return next(new AppError('Access tier insufficient', 403));
  }
  next();
};
