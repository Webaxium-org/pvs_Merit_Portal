import { Router } from 'express';
import authRoutes from './authRoutes.js';
import branchRoutes from './branchRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import emailTestRoutes from './emailTestRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import meritSettingsRoutes from './meritSettingsRoutes.js';

const router = Router();

// V2 API Routes (SQL Server)
router.use('/api/v2/auth', authRoutes);
router.use('/api/v2/branches', branchRoutes);
router.use('/api/v2/employees', employeeRoutes);
router.use('/api/v2/email', emailTestRoutes);
router.use('/api/v2/notifications', notificationRoutes);
router.use('/api/v2/merit-settings', meritSettingsRoutes);

export default router;
