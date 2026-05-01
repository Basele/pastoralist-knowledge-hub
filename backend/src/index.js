require('dotenv').config();
const app = require('./app');
const { logger } = require('./utils/logger');
const { connectRedis } = require('./config/redis');
const { connectElasticsearch } = require('./config/elasticsearch');

const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    await connectRedis();
    await connectElasticsearch();

    app.listen(PORT, () => {
      logger.info(`🌍 PIKH API running on port ${PORT} [${process.env.NODE_ENV}]`);
      logger.info(`📚 API Docs: http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
