const { PrismaClient } = require('@prisma/client');

let prisma;

function getPrismaClient() {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prisma;
}

// Test database connection
async function verifyDatabaseConnection() {
  try {
    const prismaClient = getPrismaClient();
    await prismaClient.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    return false;
  }
}

async function disconnectPrisma() {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

module.exports = {
  getPrismaClient,
  verifyDatabaseConnection,
  disconnectPrisma,
};
