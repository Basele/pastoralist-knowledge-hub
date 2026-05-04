const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const { AppError } = require('../utils/AppError');

const prisma = new PrismaClient();

// ── Comments ──────────────────────────────────────────────────────────────────

// GET /api/v1/knowledge/:id/comments
exports.listComments = async (req, res, next) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { recordId: req.params.id, parentId: null, isModerated: false },
      include: {
        author: { select: { id: true, name: true, profileImage: true, role: true } },
        replies: {
          where: { isModerated: false },
          include: { author: { select: { id: true, name: true, profileImage: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(comments);
  } catch (err) { next(err); }
};

// POST /api/v1/knowledge/:id/comments
exports.createComment = async (req, res, next) => {
  try {
    const { content, contentSw, parentId } = req.body;
    if (!content) throw new AppError('Comment content is required', 400);

    // Verify record exists
    const record = await prisma.knowledgeRecord.findUnique({ where: { id: req.params.id } });
    if (!record) throw new AppError('Knowledge record not found', 404);

    const comment = await prisma.comment.create({
      data: {
        id: uuidv4(),
        content,
        contentSw,
        authorId: req.user.userId,
        recordId: req.params.id,
        parentId: parentId || null,
      },
      include: {
        author: { select: { id: true, name: true, profileImage: true, role: true } },
      },
    });
    res.status(201).json(comment);
  } catch (err) { next(err); }
};

// DELETE /api/v1/comments/:id
exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await prisma.comment.findUnique({ where: { id: req.params.id } });
    if (!comment) throw new AppError('Comment not found', 404);

    const isOwner = comment.authorId === req.user.userId;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN'].includes(req.user.role);
    if (!isOwner && !isAdmin) throw new AppError('Forbidden', 403);

    await prisma.comment.delete({ where: { id: req.params.id } });
    res.json({ message: 'Comment deleted' });
  } catch (err) { next(err); }
};

// PATCH /api/v1/comments/:id/moderate (admin only)
exports.moderateComment = async (req, res, next) => {
  try {
    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { isModerated: true },
    });
    res.json(comment);
  } catch (err) { next(err); }
};

// ── Reviews ───────────────────────────────────────────────────────────────────

// GET /api/v1/knowledge/:id/reviews
exports.listReviews = async (req, res, next) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { recordId: req.params.id },
      include: {
        reviewer: { select: { id: true, name: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (err) { next(err); }
};

// POST /api/v1/knowledge/:id/review
exports.submitReview = async (req, res, next) => {
  try {
    const { decision, notes } = req.body;
    const allowed = ['ELDER_CUSTODIAN', 'ADMIN', 'SUPER_ADMIN'];
    if (!allowed.includes(req.user.role)) throw new AppError('Forbidden', 403);
    if (!['APPROVED', 'REJECTED', 'NEEDS_REVISION'].includes(decision)) {
      throw new AppError('Invalid decision', 400);
    }

    const [review, record] = await Promise.all([
      prisma.review.create({
        data: {
          id: uuidv4(),
          decision,
          notes,
          reviewerId: req.user.userId,
          recordId: req.params.id,
        },
        include: { reviewer: { select: { id: true, name: true, role: true } } },
      }),
      prisma.knowledgeRecord.update({
        where: { id: req.params.id },
        data: {
          status: decision === 'APPROVED' ? 'APPROVED'
            : decision === 'REJECTED' ? 'REJECTED'
            : 'PENDING_REVIEW',
          verifiedByElder: decision === 'APPROVED' && req.user.role === 'ELDER_CUSTODIAN',
        },
      }),
    ]);

    // Notify contributor
    await prisma.notification.create({
      data: {
        id: uuidv4(),
        userId: record.contributorId,
        type: 'REVIEW_DECISION',
        title: `Your record was ${decision.toLowerCase()}`,
        message: notes || `Your knowledge record has been ${decision.toLowerCase()} by a reviewer.`,
        data: { recordId: req.params.id, decision },
      },
    }).catch(() => {}); // non-fatal

    res.json({ review, record });
  } catch (err) { next(err); }
};

// ── Consent Grants ────────────────────────────────────────────────────────────

// GET /api/v1/knowledge/:id/consent
exports.listConsent = async (req, res, next) => {
  try {
    const grants = await prisma.consentGrant.findMany({
      where: { recordId: req.params.id, isActive: true },
      include: { grantedBy: { select: { id: true, name: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(grants);
  } catch (err) { next(err); }
};

// POST /api/v1/knowledge/:id/consent
exports.grantConsent = async (req, res, next) => {
  try {
    const { purpose, expiresAt } = req.body;
    if (!purpose) throw new AppError('Purpose is required', 400);

    const grant = await prisma.consentGrant.create({
      data: {
        id: uuidv4(),
        grantedById: req.user.userId,
        recordId: req.params.id,
        purpose,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: true,
      },
      include: { grantedBy: { select: { id: true, name: true } } },
    });
    res.status(201).json(grant);
  } catch (err) { next(err); }
};

// DELETE /api/v1/knowledge/:id/consent/:grantId
exports.revokeConsent = async (req, res, next) => {
  try {
    await prisma.consentGrant.update({
      where: { id: req.params.grantId },
      data: { isActive: false },
    });
    res.json({ message: 'Consent revoked' });
  } catch (err) { next(err); }
};
