import express from 'express';
import {
  getDashboard,
  getMedewerkers,
  createMedewerker,
  updateMedewerker,
  getTeBeoordelen,
  goedkeuren,
  afkeuren,
  saldoAanpassen,
  getMedewerkerDetail
} from '../controllers/hrController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateUserCreation, validateSaldoAdjustment } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication and HR role
router.use(authenticateToken);
router.use(requireRole('HR'));

/**
 * @route   GET /api/hr/dashboard
 * @desc    Get HR dashboard statistics
 * @access  Private (HR)
 */
router.get('/dashboard', getDashboard);

/**
 * @route   GET /api/hr/medewerkers
 * @desc    Get all employees
 * @access  Private (HR)
 */
router.get('/medewerkers', getMedewerkers);

/**
 * @route   POST /api/hr/medewerker
 * @desc    Create new employee
 * @access  Private (HR)
 */
router.post('/medewerker', validateUserCreation, createMedewerker);

/**
 * @route   GET /api/hr/medewerker/:id
 * @desc    Get employee details
 * @access  Private (HR)
 */
router.get('/medewerker/:id', getMedewerkerDetail);

/**
 * @route   PUT /api/hr/medewerker/:id
 * @desc    Update employee
 * @access  Private (HR)
 */
router.put('/medewerker/:id', updateMedewerker);

/**
 * @route   GET /api/hr/te-beoordelen
 * @desc    Get entries to review
 * @access  Private (HR)
 */
router.get('/te-beoordelen', getTeBeoordelen);

/**
 * @route   POST /api/hr/uren/:id/goedkeuren
 * @desc    Approve overuren entry
 * @access  Private (HR)
 */
router.post('/uren/:id/goedkeuren', goedkeuren);

/**
 * @route   POST /api/hr/uren/:id/afkeuren
 * @desc    Reject overuren entry
 * @access  Private (HR)
 */
router.post('/uren/:id/afkeuren', afkeuren);

/**
 * @route   POST /api/hr/saldo/:userId/aanpassen
 * @desc    Adjust employee saldo
 * @access  Private (HR)
 */
router.post('/saldo/:userId/aanpassen', validateSaldoAdjustment, saldoAanpassen);

export default router;
