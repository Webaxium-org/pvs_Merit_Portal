import { initEmployeeModel, getEmployee } from './Employee.js';
import { initBranchModel, getBranch } from './Branch.js';
import { initNotificationModel, getNotification } from './Notification.js';
import { initMeritSettingsModel, getMeritSettings } from './MeritSettings.js';

let Employee = null;
let Branch = null;
let Notification = null;
let MeritSettings = null;

// Initialize all models - call this after database connection
export const initModels = (sequelize) => {
  if (Employee && Branch && Notification && MeritSettings) {
    return { Employee, Branch, Notification, MeritSettings };
  }

  // Initialize Employee first (no dependencies)
  Employee = initEmployeeModel(sequelize);

  // Initialize Branch (depends on Employee)
  Branch = initBranchModel(sequelize, Employee);

  // Initialize Notification
  Notification = initNotificationModel(sequelize);

  // Initialize MeritSettings (depends on Employee for createdBy reference)
  MeritSettings = initMeritSettingsModel(sequelize);

  return { Employee, Branch, Notification, MeritSettings };
};

// Get initialized models (will throw if not initialized)
export const getModels = () => {
  return {
    Employee: getEmployee(),
    Branch: getBranch(),
    Notification: getNotification(),
    MeritSettings: getMeritSettings(),
  };
};

// Export individual getters
export { getEmployee as Employee, getBranch as Branch, getNotification as Notification, getMeritSettings as MeritSettings };

// Default export
export default {
  initModels,
  getModels,
};
