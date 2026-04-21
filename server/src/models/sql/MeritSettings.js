import { DataTypes } from 'sequelize';

let MeritSettings = null;

export const initMeritSettingsModel = (sequelize) => {
  if (MeritSettings) {
    return MeritSettings;
  }

  MeritSettings = sequelize.define('MeritSettings', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    meritYear: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'The year for which these merit settings apply (e.g., 2026)',
      validate: {
        min: 2025,
        max: 2030,
      },
    },
    budgetPercentage: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      comment: 'Target budget percentage for merit increases (e.g., 3.00 for 3%)',
      validate: {
        min: 0,
        max: 100,
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: 'Whether this configuration is currently active',
    },
    createdBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      comment: 'Employee ID of HR user who created this configuration',
      references: {
        model: 'Employees',
        key: 'id',
      },
    },
    createdByName: {
      type: DataTypes.STRING(200),
      allowNull: false,
      comment: 'Name of HR user who created this configuration',
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Optional notes about this configuration change',
    },
  }, {
    tableName: 'MeritSettings',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
      { fields: ['meritYear'] },
      { fields: ['createdBy'] },
      { fields: ['createdAt'] },
    ],
  });

  return MeritSettings;
};

export const getMeritSettings = () => {
  if (!MeritSettings) {
    throw new Error('MeritSettings model not initialized. Call initMeritSettingsModel() first.');
  }
  return MeritSettings;
};

export default { initMeritSettingsModel, getMeritSettings };
