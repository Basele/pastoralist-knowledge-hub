const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/AppError');
const { indexRecord, deleteRecord } = require('../services/search.service');
const { logger } = require('../utils/logger');

const prisma = new PrismaClient();

const TIER_ORDER = { PUBLIC: 0, COMMUNITY: 1, ELDER: 2, SACRED: 3 };

function canAccess(userTier, recordTier) {
  return TIER_ORDER[userTier] >= TIER_ORDER[recordTier];
}

// GET /api/v1/knowledge
exports.list = async (req, res, next) => {
  try {
    const {
      page = 1, limit = 20, category, communityId,
      status = 'APPROVED', language
    } = req.query;

    const userTier = req.user?.accessTier || 'PUBLIC';
    const allowedTiers = Object.entries(TIER_ORDER)
      .filter(([, v]) => v <= TIER_ORDER[userTier])
      .map(([k]) => k);

    const where = {
      accessTier: { in: allowedTiers },
      status,
      ...(category && { category }),
      ...(communityId && { communityId }),
    };

    const [records, total] = await Promise.all([
      prisma.knowledgeRecord.findMany({
        where,
        skip: (page - 1) * limit,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, title: true, titleSwahili: true,
          description: true, descriptionSwahili: true,
          category: true, accessTier: true, status: true,
          tags: true, tagsSwahili: true, seasonality: true,
          viewCount: true, createdAt: true,
          contributor: { select: { id: true, name: true } },
          community: { select: { id: true, name: true, nameSwahili: true } },
          location: { select: { id: true, name: true, latitude: true, longitude: true } },
          mediaFiles: { select: { id: true, cdnUrl: true, mediaType: true }, take: 1 },
        },
      }),
      prisma.knowledgeRecord.count({ where }),
    ]);

    res.json({
      data: records,
      meta: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/knowledge/:id
exports.get = async (req, res, next) => {
  try {
    const record = await prisma.knowledgeRecord.findUnique({
      where: { id: req.params.id },
      include: {
        contributor: { select: { id: true, name: true, role: true } },
        community: true,
        location: true,
        mediaFiles: true,
        comments: {
          where: { parentId: null },
          include: {
            author: { select: { id: true, name: true, profileImage: true } },
            replies: { include: { author: { select: { id: true, name: true } } } },
          },
          orderBy: { createdAt: 'desc' },
        },
        reviews: {
          include: { reviewer: { select: { id: true, name: true, role: true } } },
        },
      },
    });

    if (!record) throw new AppError('Knowledge record not found', 404);

    const userTier = req.user?.accessTier || 'PUBLIC';
    if (!canAccess(userTier, record.accessTier)) {
      throw new AppError('You do not have permission to view this record', 403);
    }

    // Increment view count
    await prisma.knowledgeRecord.update({
      where: { id: record.id },
      data: { viewCount: { increment: 1 } },
    });

    res.json(record);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/knowledge
exports.create = async (req, res, next) => {
  try {
    const {
      title, titleSwahili, description, descriptionSwahili,
      content, contentSwahili, category, accessTier = 'PUBLIC',
      tags = [], tagsSwahili = [], communityId, locationId,
      seasonality, source, culturalContext, practiceType,
    } = req.body;

    const record = await prisma.knowledgeRecord.create({
      data: {
        title, titleSwahili, description, descriptionSwahili,
        content, contentSwahili, category, accessTier,
        tags, tagsSwahili, seasonality, source, culturalContext, practiceType,
        status: 'PENDING_REVIEW',
        contributorId: req.user.userId,
        communityId: communityId || req.user.communityId,
        locationId,
      },
      include: { contributor: { select: { id: true, name: true } } },
    });

    // Index in Elasticsearch if public/community
    if (['PUBLIC', 'COMMUNITY'].includes(accessTier)) {
      await indexRecord(record).catch(e => logger.warn('ES indexing failed:', e));
    }

    res.status(201).json(record);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/knowledge/:id
exports.update = async (req, res, next) => {
  try {
    const existing = await prisma.knowledgeRecord.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Record not found', 404);

    const isOwner = existing.contributorId === req.user.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    if (!isOwner && !isAdmin) throw new AppError('Forbidden', 403);

    const updated = await prisma.knowledgeRecord.update({
      where: { id: req.params.id },
      data: { ...req.body, status: 'PENDING_REVIEW', updatedAt: new Date() },
    });

    await indexRecord(updated).catch(e => logger.warn('ES re-indexing failed:', e));
    res.json(updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/knowledge/:id
exports.remove = async (req, res, next) => {
  try {
    const existing = await prisma.knowledgeRecord.findUnique({ where: { id: req.params.id } });
    if (!existing) throw new AppError('Record not found', 404);

    const isOwner = existing.contributorId === req.user.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    if (!isOwner && !isAdmin) throw new AppError('Forbidden', 403);

    await prisma.knowledgeRecord.delete({ where: { id: req.params.id } });
    await deleteRecord(req.params.id).catch(() => {});

    res.json({ message: 'Record deleted' });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/knowledge/:id/review
exports.review = async (req, res, next) => {
  try {
    const { decision, notes } = req.body;
    const allowed = ['ELDER_CUSTODIAN', 'ADMIN', 'SUPER_ADMIN'];
    if (!allowed.includes(req.user.role)) throw new AppError('Forbidden', 403);

    const [review, record] = await Promise.all([
      prisma.review.create({
        data: { decision, notes, reviewerId: req.user.userId, recordId: req.params.id },
      }),
      prisma.knowledgeRecord.update({
        where: { id: req.params.id },
        data: {
          status: decision === 'APPROVED' ? 'APPROVED' : decision === 'REJECTED' ? 'REJECTED' : 'PENDING_REVIEW',
          verifiedByElder: decision === 'APPROVED' && req.user.role === 'ELDER_CUSTODIAN',
        },
      }),
    ]);

    res.json({ review, record });
  } catch (err) {
    next(err);
  }
};
