import express from 'express';
import {
  getNotificaties,
  markeerGelezen,
  markeerAlleGelezen,
  verwijderen
} from '../controllers/notificatiesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/notificaties
 * @desc    Get user's notifications
 * @access  Private
 */
router.get('/', getNotificaties);

/**
 * @route   PUT /api/notificaties/alle-gelezen
 * @desc    Mark all notifications as read
 * @access  Private
 */
router.put('/alle-gelezen', markeerAlleGelezen);

/**
 * @route   PUT /api/notificaties/:id/gelezen
 * @desc    Mark notification as read
 * @access  Private
 */
router.put('/:id/gelezen', markeerGelezen);

/**
 * @route   DELETE /api/notificaties/:id
 * @desc    Delete notification
 * @access  Private
 */
router.delete('/:id', verwijderen);

export default router;
