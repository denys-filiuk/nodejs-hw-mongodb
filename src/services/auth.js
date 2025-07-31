import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { Session } from '../models/Session.js';
import { User } from '../models/User.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '30d';

export const register = async ({ name, email, password }) => {
  if (!name || !email || !password) {
    throw createHttpError(400, 'Missing required fields');
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const userToReturn = newUser.toObject();
  delete userToReturn.password;

  return userToReturn;
};

export const login = async ({ email, password }) => {
  if (!email || !password) {
    throw createHttpError(400, 'Missing required fields');
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw createHttpError(401, 'Invalid email or password');
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    throw createHttpError(401, 'Invalid email or password');
  }

  await Session.deleteMany({ userId: user._id });

  const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });

  const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken,
    refreshToken,
    refreshTokenValidUntil,
  };
};

export const refresh = async (refreshToken) => {
  let payload;

  try {
    payload = jwt.verify(refreshToken, process.env.JWT_SECRET);
  } catch (error) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found or expired');
  }

  const user = await User.findById(payload.userId);

  if (!user) {
    throw createHttpError(401, 'User not found');
  }

  await Session.deleteMany({ userId: user._id });

  const newAccessToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    },
  );

  const newRefreshToken = jwt.sign(
    { userId: user._id },
    process.env.JWT_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    },
  );

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(
    Date.now() + 30 * 24 * 60 * 60 * 1000,
  );

  await Session.create({
    userId: user._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return {
    accessToken: newAccessToken,
    newRefreshToken,
    refreshTokenValidUntil,
  };
};

export const logout = async (refreshToken) => {
  const session = await Session.findOne({ refreshToken });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  await Session.deleteOne({ _id: session._id });
};

export const generateResetToken = (email) => {
  if (!email) {
    throw createHttpError(400, 'Email is required for reset token generation');
  }
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });
};
