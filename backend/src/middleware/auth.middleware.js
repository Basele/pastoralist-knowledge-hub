const { verifyAccessToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');

function extractToken(req) {
  try {
    if (!req || !req.headers) return null;
    const auth = req.headers['authorization'];
    if (auth && typeof auth === 'string' && auth.startsWith('Bearer ')) {
      return auth.substring(7);
    }
    return null;
  } catch {
    return null;
  }
}

exports.authenticate = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) return next(new AppError('No token provided', 401));
    req.user = verifyAccessToken(token);
    next();
  } catch (err) {
    next(err);
  }
};

exports.optionalAuth = (req, res, next) => {
  try {
    const token = extractToken(req);
    if (token) req.user = verifyAccessToken(token);
  } catch {}
  next();
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
