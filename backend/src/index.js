require("dotenv").config();
const app = require("./app");
const { logger } = require("./utils/logger");
const { verifyDatabaseConnection } = require("./config/prisma");

const PORT = process.env.PORT || 4000;

// Validate required environment variables
function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
  ];

  const optional = [
    'REDIS_URL',
    'ELASTICSEARCH_URL',
    'DO_SPACES_ENDPOINT',
    'DO_SPACES_KEY',
    'DO_SPACES_SECRET',
    'DO_SPACES_BUCKET',
  ];

  const missing = required.filter(env => !process.env[env]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  optional.forEach(env => {
    if (!process.env[env]) {
      logger.warn(`Optional environment variable missing: ${env}`);
    }
  });

  logger.info('Environment validation passed');
}

async function startServer() {
  try {
    // Validate environment variables
    validateEnvironment();

    // Verify database connection
    const dbConnected = await verifyDatabaseConnection();
    if (!dbConnected) {
      throw new Error('Failed to connect to database. Check DATABASE_URL.');
    }
    logger.info('Database connection verified');

    // Connect Redis if available
    try {
      const { connectRedis } = require("./config/redis");
      await connectRedis();
      logger.info('Redis connected');
    } catch(e) {
      logger.warn("Redis connection failed, cache disabled: " + e.message);
    }

    app.listen(PORT, "0.0.0.0", () => {
      logger.info(`PIKH API running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    });
  } catch (err) {
    logger.error("Failed to start server: " + err.message);
    process.exit(1);
  }
}

startServer();
