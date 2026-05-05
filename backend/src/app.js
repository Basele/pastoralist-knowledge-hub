const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const knowledgeRoutes = require('./routes/knowledge.routes');
const locationRoutes = require('./routes/location.routes');
const mediaRoutes = require('./routes/media.routes');
const communityRoutes = require('./routes/community.routes');
const searchRoutes = require('./routes/search.routes');
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet({ crossOriginEmbedderPolicy: false, contentSecurityPolicy: false }));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
}));

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: msg => logger.http(msg.trim()) } }));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'pikh-api', timestamp: new Date().toISOString() });
});

const API = '/api/v1';
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/users`, userRoutes);
app.use(`${API}/knowledge`, knowledgeRoutes);
app.use(`${API}/locations`, locationRoutes);
app.use(`${API}/media`, mediaRoutes);
app.use(`${API}/communities`, communityRoutes);
app.use(`${API}/search`, searchRoutes);
app.use(`${API}/notifications`, notificationRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use(errorHandler);

module.exports = app;