const { AppError } = require('./AppError');

// Validation schemas
const schemas = {
  register: (data) => {
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      throw new AppError('Valid email is required', 400);
    }
    if (!data.password || data.password.length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }
    if (!data.name || data.name.trim().length < 2) {
      throw new AppError('Name must be at least 2 characters', 400);
    }
  },

  login: (data) => {
    if (!data.email || !data.password) {
      throw new AppError('Email and password are required', 400);
    }
  },

  knowledge: (data) => {
    if (!data.title || data.title.trim().length < 3) {
      throw new AppError('Title must be at least 3 characters', 400);
    }
    if (!data.description || data.description.trim().length < 10) {
      throw new AppError('Description must be at least 10 characters', 400);
    }
    if (!data.content || data.content.trim().length < 20) {
      throw new AppError('Content must be at least 20 characters', 400);
    }
    if (!data.category || !['LIVESTOCK_MANAGEMENT', 'WATER_SOURCES', 'GRAZING_ROUTES', 'MEDICINAL_PLANTS', 'WEATHER_PREDICTION', 'CONFLICT_RESOLUTION', 'CULTURAL_CEREMONIES', 'FOOD_PRESERVATION', 'ECOLOGICAL_KNOWLEDGE', 'ORAL_HISTORY', 'GOVERNANCE', 'OTHER'].includes(data.category)) {
      throw new AppError('Invalid category', 400);
    }
    if (!data.communityId) {
      throw new AppError('Community ID is required', 400);
    }
  },

  community: (data) => {
    if (!data.name || data.name.trim().length < 2) {
      throw new AppError('Community name must be at least 2 characters', 400);
    }
  },

  location: (data) => {
    if (!data.name || data.name.trim().length < 2) {
      throw new AppError('Location name must be at least 2 characters', 400);
    }
    if (!data.locationType || !['GRAZING_LAND', 'WATER_POINT', 'MIGRATION_ROUTE', 'SACRED_SITE', 'SETTLEMENT', 'MARKET', 'CONFLICT_ZONE', 'CONSERVATION_AREA', 'OTHER'].includes(data.locationType)) {
      throw new AppError('Invalid location type', 400);
    }
    if (data.latitude !== undefined && (data.latitude < -90 || data.latitude > 90)) {
      throw new AppError('Latitude must be between -90 and 90', 400);
    }
    if (data.longitude !== undefined && (data.longitude < -180 || data.longitude > 180)) {
      throw new AppError('Longitude must be between -180 and 180', 400);
    }
  },

  comment: (data) => {
    if (!data.content || data.content.trim().length < 1) {
      throw new AppError('Comment content is required', 400);
    }
    if (data.content.length > 2000) {
      throw new AppError('Comment cannot exceed 2000 characters', 400);
    }
  },

  pagination: (page, limit) => {
    const p = parseInt(page) || 1;
    const l = parseInt(limit) || 20;
    
    if (p < 1) {
      throw new AppError('Page must be at least 1', 400);
    }
    if (l < 1 || l > 100) {
      throw new AppError('Limit must be between 1 and 100', 400);
    }
    
    return { page: p, limit: l };
  },
};

module.exports = schemas;
