const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { PrismaClient } = require('@prisma/client');
const { generateTokens, verifyRefreshToken } = require('../utils/jwt');
const { AppError } = require('../utils/AppError');
const { logger } = require('../utils/logger');
const { sendWelcome } = require('../services/email.service');

const prisma = new PrismaClient();

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/',
};

// POST /api/v1/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, name, nameSwahili, communityId } = req.body;

    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError('Email already registered', 409);

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        id: uuidv4(),
        email,
        passwordHash,
        name,
        nameSwahili,
        communityId: communityId || null,
        role: 'COMMUNITY_MEMBER',
        accessTier: 'PUBLIC',
      },
      select: { id: true, email: true, name: true, role: true, accessTier: true, createdAt: true },
    });

    const { accessToken, refreshToken } = await generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    // Send welcome email (non-fatal)
    sendWelcome(email, name).catch(() => {});

    logger.info(`New user registered: ${email}`);

    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
    res.status(201).json({ user, accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) throw new AppError('Invalid credentials', 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('Invalid credentials', 401);

    const { accessToken, refreshToken } = await generateTokens(user);

    await prisma.refreshToken.create({
      data: {
        id: uuidv4(),
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const { passwordHash: _, ...safeUser } = user;

    // Set refresh token as HTTP-only cookie
    res.cookie('refresh_token', refreshToken, COOKIE_OPTS);
    res.json({ user: safeUser, accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/refresh
exports.refresh = async (req, res, next) => {
  try {
    // Accept from cookie or body (for backwards compat)
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
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
        id: uuidv4(),
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });

    res.cookie('refresh_token', tokens.refreshToken, COOKIE_OPTS);
    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/auth/logout
exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refresh_token || req.body?.refreshToken;
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.clearCookie('refresh_token', { path: '/' });
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
