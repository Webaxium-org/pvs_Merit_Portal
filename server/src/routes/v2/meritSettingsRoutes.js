import express from 'express';
import {
  getCurrentSettings,
  getSettingsHistory,
  createSettings,
} from '../../controllers/v2/meritSettingsController.js';
import { protect } from '../../middlewares/auth.js';

const router = express.Router();

/**
 * @route   GET /api/v2/merit-settings/current
 * @desc    Get current active merit settings
 * @access  Private (all authenticated users)
 */
router.get('/current', protect, getCurrentSettings);

/**
 * @route   GET /api/v2/merit-settings/history
 * @desc    Get all merit settings history
 * @access  Private (HR only)
 */
router.get('/history', protect, getSettingsHistory);

/**
 * @route   POST /api/v2/merit-settings
 * @desc    Create new merit settings
 * @access  Private (HR only)
 */
router.post('/', protect, createSettings);

export default router;
