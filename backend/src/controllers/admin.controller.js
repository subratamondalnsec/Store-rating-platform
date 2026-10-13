const bcrypt = require('bcryptjs');
const prisma = require('../config/db');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/admin/dashboard
 * Dashboard stats: total users, total stores, total submitted ratings
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const [totalUsers, totalStores, totalRatings] = await Promise.all([
    prisma.user.count(),
    prisma.store.count(),
    prisma.rating.count()
  ]);

  return sendSuccess(res, 'Dashboard statistics retrieved.', {
    totalUsers,
    totalStores,
    totalRatings
  });
});

/**
 * GET /api/admin/users
 * List users with search, role filters, and sorting
 */
const getUsers = asyncHandler(async (req, res) => {
  const { search, name, email, address, role, sortBy = 'createdAt', order = 'desc' } = req.query;

  // Whitelist sorting fields
  const allowedSortFields = ['name', 'email', 'address', 'role', 'createdAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

  // Build where condition
  const where = {};

  if (role && ['ADMIN', 'USER', 'STORE_OWNER'].includes(role.toUpperCase())) {
    where.role = role.toUpperCase();
  }

  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  if (email) {
    where.email = { contains: email, mode: 'insensitive' };
  }

  if (address) {
    where.address = { contains: address, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      [sortField]: sortOrder
    }
  });

  return sendSuccess(res, 'Users retrieved successfully.', { users });
});

/**
 * POST /api/admin/users
 * Add new user (ADMIN, USER, or STORE_OWNER)
 */
const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, address, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return sendError(res, 'A user with this email address already exists.', [
      { field: 'email', message: 'Email address is already registered.' }
    ], 409);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      address,
      role
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true
    }
  });

  return sendSuccess(res, 'User created successfully.', { user: newUser }, 201);
});

/**
 * GET /api/admin/users/:id
 * Get user details. If STORE_OWNER, also show store details and average rating.
 */
const getUserById = asyncHandler(async (req, res) => {
  const userId = parseInt(req.params.id, 10);
  if (isNaN(userId)) {
    return sendError(res, 'Invalid user ID.', [], 400);
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      address: true,
      role: true,
      createdAt: true,
      store: {
        select: {
          id: true,
          name: true,
          email: true,
          address: true,
          createdAt: true
        }
      }
    }
  });

  if (!user) {
    return sendError(res, 'User not found.', [], 404);
  }

  let storeDetails = null;

  if (user.role === 'STORE_OWNER' && user.store) {
    const ratingAggregate = await prisma.rating.aggregate({
      where: { storeId: user.store.id },
      _avg: { value: true },
      _count: { value: true }
    });

    const averageRating = ratingAggregate._avg.value
      ? Number(ratingAggregate._avg.value.toFixed(1))
      : 0;

    storeDetails = {
      ...user.store,
      averageRating,
      totalRatings: ratingAggregate._count.value
    };
  }

  return sendSuccess(res, 'User details retrieved successfully.', {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      address: user.address,
      role: user.role,
      createdAt: user.createdAt,
      store: storeDetails
    }
  });
});

/**
 * GET /api/admin/available-owners
 * List store owners who do not have a store assigned yet
 */
const getAvailableOwners = asyncHandler(async (req, res) => {
  const owners = await prisma.user.findMany({
    where: {
      role: 'STORE_OWNER',
      store: null
    },
    select: {
      id: true,
      name: true,
      email: true,
      address: true
    },
    orderBy: {
      name: 'asc'
    }
  });

  return sendSuccess(res, 'Available store owners retrieved.', { owners });
});

/**
 * GET /api/admin/stores
 * List stores with average rating, filtering, and sorting
 */
const getStores = asyncHandler(async (req, res) => {
  const { search, name, email, address, sortBy = 'createdAt', order = 'desc' } = req.query;

  const allowedSortFields = ['name', 'email', 'address', 'rating', 'createdAt'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

  const where = {};

  if (name) {
    where.name = { contains: name, mode: 'insensitive' };
  }

  if (email) {
    where.email = { contains: email, mode: 'insensitive' };
  }

  if (address) {
    where.address = { contains: address, mode: 'insensitive' };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { address: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Fetch stores and their aggregated ratings efficiently
  const [stores, ratingAggregates] = await Promise.all([
    prisma.store.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: sortField !== 'rating' ? { [sortField]: sortOrder } : undefined
    }),
    prisma.rating.groupBy({
      by: ['storeId'],
      _avg: { value: true },
      _count: { value: true }
    })
  ]);

  const ratingMap = new Map();
  ratingAggregates.forEach(agg => {
    ratingMap.set(agg.storeId, {
      averageRating: agg._avg.value ? Number(agg._avg.value.toFixed(1)) : 0,
      totalRatings: agg._count.value
    });
  });

  let formattedStores = stores.map(store => {
    const stats = ratingMap.get(store.id) || { averageRating: 0, totalRatings: 0 };
    return {
      id: store.id,
      name: store.name,
      email: store.email,
      address: store.address,
      ownerId: store.ownerId,
      owner: store.owner,
      averageRating: stats.averageRating,
      totalRatings: stats.totalRatings,
      createdAt: store.createdAt
    };
  });

  // If sorting by rating
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
 * POST /api/admin/stores
 * Add new store and assign to an existing STORE_OWNER without a store
 */
const createStore = asyncHandler(async (req, res) => {
  const { name, email, address, ownerId } = req.body;
  const parsedOwnerId = parseInt(ownerId, 10);

  // Validate owner existence and role
  const owner = await prisma.user.findUnique({
    where: { id: parsedOwnerId },
    include: { store: true }
  });

  if (!owner) {
    return sendError(res, 'Specified owner not found.', [
      { field: 'ownerId', message: 'Owner user not found.' }
    ], 404);
  }

  if (owner.role !== 'STORE_OWNER') {
    return sendError(res, 'Assigned user must have the STORE_OWNER role.', [
      { field: 'ownerId', message: 'Selected user is not a STORE_OWNER.' }
    ], 400);
  }

  if (owner.store) {
    return sendError(res, 'This store owner already owns an existing store.', [
      { field: 'ownerId', message: 'Store owner is already assigned to a store.' }
    ], 400);
  }

  // Check unique email for store
  const existingStore = await prisma.store.findUnique({
    where: { email }
  });

  if (existingStore) {
    return sendError(res, 'A store with this email address already exists.', [
      { field: 'email', message: 'Store email address is already registered.' }
    ], 409);
  }

  const newStore = await prisma.store.create({
    data: {
      name,
      email,
      address,
      ownerId: parsedOwnerId
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });

  return sendSuccess(res, 'Store created successfully.', { store: newStore }, 201);
});

module.exports = {
  getDashboardStats,
  getUsers,
  createUser,
  getUserById,
  getAvailableOwners,
  getStores,
  createStore
};
