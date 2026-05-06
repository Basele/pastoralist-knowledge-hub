let PrismaClient;
let prisma;

function getPrismaClient() {
  if (!prisma) {
    if (!PrismaClient) {
      try {
        PrismaClient = require('@prisma/client').PrismaClient;
      } catch (error) {
        throw new Error('Prisma client not generated. Run `npx prisma generate` in backend and install dependencies, then restart. Original error: ' + error.message);
      }
    }

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
