import createHttpError from 'http-errors';
import { register, login, refresh, logout } from '../services/auth.js';

export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      throw createHttpError(400, 'Name, email, and password are required');
    }

    const newUser = await register({ name, email, password });

    res.status(201).json({
      status: 201,
      data: newUser,
    });
  } catch (err) {
    next(err);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, 'Email and password are required');
    }

    const { accessToken, refreshToken, refreshTokenValidUntil } = await login({
      email,
      password,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(refreshTokenValidUntil),
    });

    res.status(200).json({
      status: 200,
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const refreshSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createHttpError(401, 'Refresh token not found');
    }

    const { accessToken, newRefreshToken, refreshTokenValidUntil } =
      await refresh(refreshToken);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: new Date(refreshTokenValidUntil),
    });

    res.status(200).json({
      status: 200,
      data: { accessToken },
    });
  } catch (err) {
    next(err);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw createHttpError(401, 'Refresh token not found');
    }

    await logout(refreshToken);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(204).json();
  } catch (err) {
    next(err);
  }
};
