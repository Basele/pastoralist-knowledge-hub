require("dotenv").config();
const app = require("./app");
const { logger } = require("./utils/logger");
const PORT = process.env.PORT || 4000;

async function startServer() {
  try {
    const { connectRedis } = require("./config/redis");
    await connectRedis();
  } catch(e) {
    logger.warn("Redis skipped: " + e.message);
  }
  app.listen(PORT, "0.0.0.0", () => {
    logger.info("PIKH API running on port " + PORT);
  });
}

startServer();
