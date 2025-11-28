import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        error: 'Geen toegang - geen token verstrekt'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from database
    const user = await User.findByPk(decoded.id);

    if (!user || !user.is_active) {
      return res.status(403).json({
        error: 'Ongeldige token of account gedeactiveerd'
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      voornaam: user.voornaam,
      achternaam: user.achternaam
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Ongeldige token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token verlopen' });
    }
    return res.status(500).json({ error: 'Server fout bij authenticatie' });
  }
};

/**
 * Check if user has required role
 * @param {...string} roles - Allowed roles
 */
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Niet geauthenticeerd' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Geen toegang - onvoldoende rechten'
      });
    }

    next();
  };
};

/**
 * Check if user can access own resource or is HR
 */
export const canAccessResource = (req, res, next) => {
  const resourceUserId = parseInt(req.params.userId || req.body.user_id);

  if (req.user.role === 'HR' || req.user.id === resourceUserId) {
    next();
  } else {
    res.status(403).json({
      error: 'Geen toegang tot deze bron'
    });
  }
};
