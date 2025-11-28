import express from 'express';
import {
  getMijnSaldo,
  getMijnGeschiedenis,
  indienen,
  wijzigen,
  verwijderen,
  getWeekOverzicht
} from '../controllers/urenController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateOveruren } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

/**
 * @route   GET /api/uren/mijn-saldo
 * @desc    Get current user's saldo
 * @access  Private (Medewerker)
 */
router.get('/mijn-saldo', getMijnSaldo);

/**
 * @route   GET /api/uren/mijn-geschiedenis
 * @desc    Get current user's overuren history
 * @access  Private (Medewerker)
 */
router.get('/mijn-geschiedenis', getMijnGeschiedenis);

/**
 * @route   GET /api/uren/week/:jaar/:weeknummer
 * @desc    Get week overview
 * @access  Private (Medewerker)
 */
router.get('/week/:jaar/:weeknummer', getWeekOverzicht);

/**
 * @route   POST /api/uren/indienen
 * @desc    Submit new overuren entry
 * @access  Private (Medewerker)
 */
router.post('/indienen', validateOveruren, indienen);

/**
 * @route   PUT /api/uren/:id
 * @desc    Update overuren entry
 * @access  Private (Medewerker, own entries only)
 */
router.put('/:id', validateOveruren, wijzigen);

/**
 * @route   DELETE /api/uren/:id
 * @desc    Delete overuren entry
 * @access  Private (Medewerker, own CONCEPT entries only)
 */
router.delete('/:id', verwijderen);

export default router;
