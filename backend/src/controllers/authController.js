import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Generate JWT access token
 * @param {Object} user - User object
 * @returns {string} JWT token
 */
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '8h' }
  );
};

/**
 * Generate JWT refresh token
 * @param {Object} user - User object
 * @returns {string} Refresh token
 */
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user.id },
    process.env.REFRESH_SECRET,
    { expiresIn: '30d' }
  );
};

/**
 * Login user
 * POST /api/auth/login
 */
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(401).json({
        error: 'Ongeldige gebruikersnaam of wachtwoord'
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        error: 'Account is gedeactiveerd'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Ongeldige gebruikersnaam of wachtwoord'
      });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    // Return user info and tokens
    res.json({
      message: 'Login succesvol',
      user: user.toSafeObject(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh
 */
export const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token is verplicht' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Get user
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return res.status(403).json({ error: 'Ongeldige token' });
    }

    // Generate new access token
    const accessToken = generateAccessToken(user);

    res.json({
      accessToken,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user info
 * GET /api/auth/me
 */
export const me = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Gebruiker niet gevonden' });
    }

    res.json(user.toSafeObject());
  } catch (error) {
    next(error);
  }
};

/**
 * Logout (client-side will remove token)
 * POST /api/auth/logout
 */
export const logout = (req, res) => {
  res.json({ message: 'Uitgelogd' });
};
