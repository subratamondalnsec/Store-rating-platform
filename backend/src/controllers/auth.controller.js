const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');
const { sendSuccess, sendError } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Generate a JWT for a user
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

/**
 * POST /api/auth/signup
 * Normal user signup (role is always USER, never trust client role)
 */
const signup = asyncHandler(async (req, res) => {
  const { name, email, password, address } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    return sendError(res, 'A user with this email address already exists.', [
      { field: 'email', message: 'Email address is already registered.' }
    ], 409);
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user - enforce role as USER
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      address,
      role: 'USER'
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

  const token = generateToken(user);

  return sendSuccess(res, 'Account created successfully.', { user, token }, 201);
});

/**
 * POST /api/auth/login
 * Single login system for all roles
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    return sendError(res, 'Invalid email or password.', [], 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return sendError(res, 'Invalid email or password.', [], 401);
  }

  const token = generateToken(user);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    address: user.address,
    role: user.role,
    createdAt: user.createdAt
  };

  return sendSuccess(res, 'Login successful.', { user: safeUser, token });
});

/**
 * GET /api/auth/me
 * Get current authenticated user profile
 */
const getMe = asyncHandler(async (req, res) => {
  return sendSuccess(res, 'User profile retrieved.', { user: req.user });
});

/**
 * PUT /api/auth/password
 * Change password for authenticated user
 */
const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.id;

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    return sendError(res, 'User not found.', [], 404);
  }

  const isCurrentPasswordCorrect = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordCorrect) {
    return sendError(res, 'Current password is incorrect.', [
      { field: 'currentPassword', message: 'Current password is incorrect.' }
    ], 400);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedNewPassword = await bcrypt.hash(newPassword, salt);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  return sendSuccess(res, 'Password updated successfully.');
});

module.exports = {
  signup,
  login,
  getMe,
  updatePassword
};
