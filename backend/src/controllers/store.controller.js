const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/stores
 * List all registered stores with average rating and current user's rating (if authenticated)
 * Supports search by name, address, or general search, and sorting.
 */
const getStores = asyncHandler(async (req, res) => {
  const { search, name, address, sortBy = 'name', order = 'asc' } = req.query;

  const allowedSortFields = ['name', 'address', 'rating', 'createdAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'name';
  const sortOrder = order.toLowerCase() === 'desc' ? 'desc' : 'asc';

  const where = {};

  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  if (address) {
    where.address = { contains: address, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  const currentUserId = req.user ? req.user.id : null;

  // Run store fetch, rating aggregation, and user rating fetch concurrently
  const [stores, ratingAggregates, userRatings] = await Promise.all([
    prisma.store.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        address: true,
        createdAt: true
      },
      orderBy: sortField !== 'rating' ? { [sortField]: sortOrder } : undefined
    }),
    prisma.rating.groupBy({
      by: ['storeId'],
      _avg: { value: true },
      _count: { value: true }
    }),
    currentUserId
      ? prisma.rating.findMany({
          where: { userId: currentUserId },
          select: { storeId: true, value: true }
        })
      : []
  ]);

  const ratingMap = new Map();
  ratingAggregates.forEach(agg => {
    ratingMap.set(agg.storeId, {
      averageRating: agg._avg.value ? Number(agg._avg.value.toFixed(1)) : 0,
      totalRatings: agg._count.value
    });
  });

  const userRatingMap = new Map();
  userRatings.forEach(r => {
    userRatingMap.set(r.storeId, r.value);
  });

  let formattedStores = stores.map(store => {
    const stats = ratingMap.get(store.id) || { averageRating: 0, totalRatings: 0 };
    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      userRating: userRatingMap.has(store.id) ? userRatingMap.get(store.id) : null,
      createdAt: store.createdAt
    };
  });

  if (sortField === 'rating') {
    formattedStores.sort((a, b) => {
      return sortOrder === 'asc'
        ? a.averageRating - b.averageRating
        : b.averageRating - a.averageRating;
    });
  }

  return sendSuccess(res, 'Stores retrieved successfully.', { stores: formattedStores });
});

/**
 * POST /api/stores/:id/rating
 * Submit or modify a rating (1-5) for a store by the authenticated USER (upsert)
 */
const rateStore = asyncHandler(async (req, res) => {
  const storeId = parseInt(req.params.id, 10);
  const { value } = req.body;
  const userId = req.user.id;

  if (isNaN(storeId)) {
    return sendError(res, 'Invalid store ID.', [], 400);
  }

  const ratingValue = parseInt(value, 10);
  if (isNaN(ratingValue) || ratingValue < 1 || ratingValue > 5) {
    return sendError(res, 'Rating value must be an integer between 1 and 5.', [
      { field: 'value', message: 'Rating must be an integer from 1 to 5.' }
    ], 400);
  }

  // Verify store exists
  const store = await prisma.store.findUnique({
    where: { id: storeId }
  });

  if (!store) {
    return sendError(res, 'Store not found.', [], 404);
  }

  // Upsert rating to avoid duplicates
  const rating = await prisma.rating.upsert({
    where: {
      userId_storeId: {
        userId,
        storeId
      }
    },
    update: {
      value: ratingValue
    },
    create: {
      userId,
      storeId,
      value: ratingValue
    }
  });

  // Calculate updated store stats
  const aggregate = await prisma.rating.aggregate({
    where: { storeId },
    _avg: { value: true },
    _count: { value: true }
  });

  const averageRating = aggregate._avg.value ? Number(aggregate._avg.value.toFixed(1)) : 0;

  return sendSuccess(res, 'Rating submitted successfully.', {
    rating: {
      id: rating.id,
      storeId: rating.storeId,
      value: rating.value,
      updatedAt: rating.updatedAt
    },
    storeStats: {
      averageRating,
      totalRatings: aggregate._count.value
    }
  });
});

module.exports = {
  getStores,
  rateStore
};
