const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/owner/dashboard
 * Store owner dashboard with average rating and table of users who rated their store
 */
const getOwnerDashboard = asyncHandler(async (req, res) => {
  const ownerId = req.user.id;

  // Find the store owned by this user
  const store = await prisma.store.findUnique({
    where: { ownerId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      createdAt: true
    }
  });

  if (!store) {
    return sendSuccess(res, 'No store is assigned to this owner account yet.', {
      hasStore: false,
      store: null,
      averageRating: 0,
      totalRatings: 0,
      ratings: []
    });
  }

  // Get ratings with user information
  const [ratings, aggregate] = await Promise.all([
    prisma.rating.findMany({
      where: { storeId: store.id },
      select: {
        id: true,
        value: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    }),
    prisma.rating.aggregate({
      where: { storeId: store.id },
      _avg: { value: true },
      _count: { value: true }
    })
  ]);

  const averageRating = aggregate._avg.value ? Number(aggregate._avg.value.toFixed(1)) : 0;

  const formattedRatings = ratings.map(r => ({
    id: r.id,
    userId: r.user.id,
    userName: r.user.name,
    userEmail: r.user.email,
    value: r.value,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt
  }));

  return sendSuccess(res, 'Owner dashboard data retrieved.', {
    hasStore: true,
    store,
    averageRating,
    totalRatings: aggregate._count.value,
    ratings: formattedRatings
  });
});

module.exports = {
  getOwnerDashboard
};
