import { getMeritSettings } from '../../models/sql/MeritSettings.js';
import { getEmployee } from '../../models/sql/Employee.js';

/**
 * Get the current active merit settings
 * @route GET /api/v2/merit-settings/current
 * @access Public (all authenticated users need to see current settings)
 */
export const getCurrentSettings = async (req, res) => {
  try {
    const MeritSettings = getMeritSettings();

    // Get the most recent active settings
    const currentSettings = await MeritSettings.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'meritYear', 'budgetPercentage', 'createdAt', 'createdByName', 'notes'],
    });

    // If no active settings found, return defaults (should not happen after migration)
    if (!currentSettings) {
      return res.status(200).json({
        success: true,
        data: {
          id: null,
          meritYear: 2026,
          budgetPercentage: 3.0,
          createdAt: new Date(),
          createdByName: 'System',
          notes: 'Default settings - please configure in Settings page',
        },
        message: 'No active settings found. Returning defaults.',
      });
    }

    return res.status(200).json({
      success: true,
      data: currentSettings,
    });
  } catch (error) {
    console.error('Error fetching current merit settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch current merit settings',
      error: error.message,
    });
  }
};

/**
 * Get all merit settings history
 * @route GET /api/v2/merit-settings/history
 * @access HR only
 */
export const getSettingsHistory = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user is HR
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only HR can view settings history.',
      });
    }

    const MeritSettings = getMeritSettings();

    // Get all settings ordered by creation date (newest first)
    const history = await MeritSettings.findAll({
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'meritYear', 'budgetPercentage', 'isActive', 'createdAt', 'createdByName', 'notes'],
    });

    return res.status(200).json({
      success: true,
      data: history,
      count: history.length,
    });
  } catch (error) {
    console.error('Error fetching merit settings history:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch merit settings history',
      error: error.message,
    });
  }
};

/**
 * Create new merit settings (also deactivates previous settings)
 * @route POST /api/v2/merit-settings
 * @access HR only
 */
export const createSettings = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.isAuthenticated) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    // Check if user is HR
    if (req.user.role !== 'hr' && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only HR can create merit settings.',
      });
    }

    const { meritYear, budgetPercentage, notes } = req.body;

    // Validation
    if (!meritYear || budgetPercentage === undefined || budgetPercentage === null) {
      return res.status(400).json({
        success: false,
        message: 'Merit year and budget percentage are required',
      });
    }

    // Validate year range
    if (meritYear < 2025 || meritYear > 2030) {
      return res.status(400).json({
        success: false,
        message: 'Merit year must be between 2025 and 2030',
      });
    }

    // Validate percentage range
    if (budgetPercentage < 0 || budgetPercentage > 100) {
      return res.status(400).json({
        success: false,
        message: 'Budget percentage must be between 0 and 100',
      });
    }

    const MeritSettings = getMeritSettings();
    const Employee = getEmployee();

    // Get the current user's full name from database
    const currentUser = await Employee.findByPk(req.user.userId, {
      attributes: ['id', 'fullName', 'email'],
    });

    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Start a transaction to ensure data consistency
    const sequelize = MeritSettings.sequelize;
    const transaction = await sequelize.transaction();

    try {
      // Deactivate all previous settings
      await MeritSettings.update(
        { isActive: false },
        {
          where: { isActive: true },
          transaction,
        }
      );

      // Create new settings
      const newSettings = await MeritSettings.create(
        {
          meritYear: parseInt(meritYear),
          budgetPercentage: parseFloat(budgetPercentage),
          isActive: true,
          createdBy: currentUser.id,
          createdByName: currentUser.fullName,
          notes: notes || null,
        },
        { transaction }
      );

      // Commit transaction
      await transaction.commit();

      return res.status(201).json({
        success: true,
        data: {
          id: newSettings.id,
          meritYear: newSettings.meritYear,
          budgetPercentage: newSettings.budgetPercentage,
          isActive: newSettings.isActive,
          createdAt: newSettings.createdAt,
          createdByName: newSettings.createdByName,
          notes: newSettings.notes,
        },
        message: 'Merit settings created successfully',
      });
    } catch (error) {
      // Rollback transaction on error
      await transaction.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Error creating merit settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create merit settings',
      error: error.message,
    });
  }
};

export default {
  getCurrentSettings,
  getSettingsHistory,
  createSettings,
};
