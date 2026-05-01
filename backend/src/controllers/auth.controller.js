const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');
const { logger } = require('../utils/logger');
const { redis } = require('../config/redis');

const prisma = new PrismaClient();

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, nameSwahili, communityId } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        nameSwahili,
        communityId,
        role: 'COMMUNITY_MEMBER',
        accessTier: 'PUBLIC',
      },
      select: { id: true, email: true, name: true, role: true, accessTier: true, createdAt: true },
    });

    const { accessToken, refreshToken } = await generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    logger.info(`New user registered: ${email}`);
    res.status(201).json({ user, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const { accessToken, refreshToken } = await generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const { passwordHash: _, ...safeUser } = user;
    res.json({ user: safeUser, accessToken, refreshToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) throw new AppError('Refresh token required', 400);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token', 401);
    }

    const payload = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) throw new AppError('User not found', 404);

    const tokens = await generateTokens(user);

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.json(tokens);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    // Blacklist access token in Redis
    if (req.user) {
      await redis.setex(`blacklist:${req.headers.authorization?.split(' ')[1]}`, 7 * 86400, '1');
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/auth/me
exports.me = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true, email: true, name: true, nameSwahili: true,
        role: true, accessTier: true, profileImage: true, bio: true,
        bioSwahili: true, isVerified: true, communityId: true,
        community: { select: { id: true, name: true, nameSwahili: true } },
        createdAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    res.json(user);
  } catch (err) {
    next(err);
  }
};
