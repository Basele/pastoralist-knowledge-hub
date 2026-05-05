const { getPrismaClient } = require('../config/prisma');
const validation = require('../utils/validation');

const prisma = getPrismaClient();

exports.indexRecord = async (record) => {};
exports.deleteRecord = async (id) => {};

exports.search = async ({ q, category, communityId, accessTiers, page = 1, limit = 20 }) => {
  // Validate pagination
  const { page: validPage, limit: validLimit } = validation.pagination(page, limit);

  const where = {
    accessTier: { in: accessTiers },
    status: "APPROVED",
    ...(category && { category }),
    ...(communityId && { communityId }),
    ...(q && {
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ]
    }),
  };
  const [records, total] = await Promise.all([
    prisma.knowledgeRecord.findMany({
      where, skip: (validPage - 1) * validLimit, take: validLimit,
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true, titleSwahili: true, description: true, category: true, accessTier: true, tags: true, communityId: true, createdAt: true },
    }),
    prisma.knowledgeRecord.count({ where }),
  ]);
  return { hits: records, total, page: validPage, limit: validLimit };
};
