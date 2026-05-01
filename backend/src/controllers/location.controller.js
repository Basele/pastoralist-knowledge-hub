const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/AppError');

const prisma = new PrismaClient();

// GET /api/v1/locations
exports.list = async (req, res, next) => {
  try {
    const { communityId, locationType, bbox } = req.query;

    const where = {
      ...(communityId && { communityId }),
      ...(locationType && { locationType }),
    };

    // Bounding box filter: bbox=minLon,minLat,maxLon,maxLat
    if (bbox) {
      const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
      where.latitude = { gte: minLat, lte: maxLat };
      where.longitude = { gte: minLon, lte: maxLon };
    }

    const locations = await prisma.location.findMany({
      where,
      include: {
        community: { select: { id: true, name: true, nameSwahili: true } },
        _count: { select: { knowledgeRecords: true } },
      },
    });

    res.json(locations);
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/locations/:id
exports.get = async (req, res, next) => {
  try {
    const location = await prisma.location.findUnique({
      where: { id: req.params.id },
      include: {
        community: true,
        knowledgeRecords: {
          where: { status: 'APPROVED' },
          select: { id: true, title: true, category: true, accessTier: true },
          take: 10,
        },
      },
    });
    if (!location) throw new AppError('Location not found', 404);
    res.json(location);
  } catch (err) {
    next(err);
  }
};

// POST /api/v1/locations
exports.create = async (req, res, next) => {
  try {
    const {
      name, nameSwahili, description, locationType,
      latitude, longitude, geojson, elevation,
      country, region, communityId, isSeasonalWater, seasonAvailable,
    } = req.body;

    const location = await prisma.location.create({
      data: {
        name, nameSwahili, description, locationType,
        latitude, longitude, geojson, elevation,
        country: country || 'Kenya', region,
        communityId,
        isSeasonalWater: isSeasonalWater || false,
        seasonAvailable,
      },
    });

    res.status(201).json(location);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/v1/locations/:id
exports.update = async (req, res, next) => {
  try {
    const location = await prisma.location.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(location);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/v1/locations/:id
exports.remove = async (req, res, next) => {
  try {
    await prisma.location.delete({ where: { id: req.params.id } });
    res.json({ message: 'Location deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/v1/locations/geojson — returns GeoJSON FeatureCollection for map
exports.geojson = async (req, res, next) => {
  try {
    const { communityId, locationType } = req.query;

    const locations = await prisma.location.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
        ...(communityId && { communityId }),
        ...(locationType && { locationType }),
      },
      include: { community: { select: { name: true } } },
    });

    const featureCollection = {
      type: 'FeatureCollection',
      features: locations.map(loc => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [loc.longitude, loc.latitude] },
        properties: {
          id: loc.id,
          name: loc.name,
          nameSwahili: loc.nameSwahili,
          locationType: loc.locationType,
          community: loc.community?.name,
          isSeasonalWater: loc.isSeasonalWater,
          seasonAvailable: loc.seasonAvailable,
        },
      })),
    };

    res.json(featureCollection);
  } catch (err) {
    next(err);
  }
};
