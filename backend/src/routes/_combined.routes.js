const express = require('express');

// ── Media routes ──────────────────────────────────────────────────────────────
const mediaRouter = express.Router();
const { PrismaClient } = require('@prisma/client');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const { authenticate } = require('../middleware/auth.middleware');
const prisma = new PrismaClient();

const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACES_ENDPOINT,
  accessKeyId: process.env.DO_SPACES_KEY,
  secretAccessKey: process.env.DO_SPACES_SECRET,
});

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.DO_SPACES_BUCKET || 'pikh-media',
    acl: 'public-read',
    key: (req, file, cb) => {
      const ext = file.originalname.split('.').pop();
      cb(null, `uploads/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg','image/png','image/webp','audio/mpeg','audio/wav','video/mp4','application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

mediaRouter.post('/upload', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const { recordId, caption, captionSwahili, accessTier = 'PUBLIC' } = req.body;
    const f = req.file;
    const mediaType = f.mimetype.startsWith('image') ? 'IMAGE'
      : f.mimetype.startsWith('audio') ? 'AUDIO'
      : f.mimetype.startsWith('video') ? 'VIDEO' : 'DOCUMENT';

    const media = await prisma.mediaFile.create({
      data: {
        filename: f.key,
        originalName: f.originalname,
        mimeType: f.mimetype,
        size: f.size,
        url: f.location,
        cdnUrl: `${process.env.DO_SPACES_CDN_ENDPOINT}/${f.key}`,
        mediaType,
        caption, captionSwahili, accessTier,
        uploadedById: req.user.userId,
        recordId,
      },
    });
    res.status(201).json(media);
  } catch (err) { next(err); }
});

mediaRouter.delete('/:id', authenticate, async (req, res, next) => {
  try {
    const media = await prisma.mediaFile.findUnique({ where: { id: req.params.id } });
    if (!media) return res.status(404).json({ error: 'Not found' });
    await s3.deleteObject({ Bucket: process.env.DO_SPACES_BUCKET, Key: media.filename }).promise();
    await prisma.mediaFile.delete({ where: { id: req.params.id } });
    res.json({ message: 'Deleted' });
  } catch (err) { next(err); }
});

// ── Community routes ──────────────────────────────────────────────────────────
const communityRouter = express.Router();
const { requireRole } = require('../middleware/auth.middleware');

communityRouter.get('/', async (req, res, next) => {
  try {
    const communities = await prisma.community.findMany({
      where: { isActive: true },
      include: { _count: { select: { members: true, knowledgeRecords: true } } },
    });
    res.json(communities);
  } catch (err) { next(err); }
});

communityRouter.get('/:id', async (req, res, next) => {
  try {
    const c = await prisma.community.findUnique({
      where: { id: req.params.id },
      include: {
        members: { select: { id: true, name: true, role: true, profileImage: true }, take: 10 },
        _count: { select: { members: true, knowledgeRecords: true, locations: true } },
      },
    });
    if (!c) return res.status(404).json({ error: 'Not found' });
    res.json(c);
  } catch (err) { next(err); }
});

communityRouter.post('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const community = await prisma.community.create({ data: req.body });
    res.status(201).json(community);
  } catch (err) { next(err); }
});

// ── Search routes ─────────────────────────────────────────────────────────────
const searchRouter = express.Router();
const { search } = require('../services/search.service');

searchRouter.get('/', async (req, res, next) => {
  try {
    const { q, category, communityId, page, limit } = req.query;
    const TIER_ORDER = { PUBLIC: 0, COMMUNITY: 1, ELDER: 2, SACRED: 3 };
    const userTier = req.user?.accessTier || 'PUBLIC';
    const accessTiers = Object.entries(TIER_ORDER)
      .filter(([, v]) => v <= TIER_ORDER[userTier])
      .map(([k]) => k);

    const results = await search({ q, category, communityId, accessTiers, page, limit });
    res.json(results);
  } catch (err) { next(err); }
});

// ── Notification routes ───────────────────────────────────────────────────────
const notifRouter = express.Router();

notifRouter.get('/', authenticate, async (req, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json(notifications);
  } catch (err) { next(err); }
});

notifRouter.patch('/:id/read', authenticate, async (req, res, next) => {
  try {
    await prisma.notification.update({ where: { id: req.params.id }, data: { isRead: true } });
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// ── User routes ───────────────────────────────────────────────────────────────
const userRouter = express.Router();

userRouter.get('/', authenticate, requireRole('ADMIN', 'SUPER_ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, accessTier: true, isVerified: true, createdAt: true },
    });
    res.json(users);
  } catch (err) { next(err); }
});

userRouter.patch('/:id', authenticate, async (req, res, next) => {
  try {
    const isOwner = req.params.id === req.user.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    if (!isOwner && !isAdmin) return res.status(403).json({ error: 'Forbidden' });
    const { passwordHash, role, ...safe } = req.body; // prevent privilege escalation
    const user = await prisma.user.update({ where: { id: req.params.id }, data: safe });
    res.json(user);
  } catch (err) { next(err); }
});

module.exports = { mediaRouter, communityRouter, searchRouter, notifRouter, userRouter };
