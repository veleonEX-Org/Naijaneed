import express from 'express';
import { registerOrLoginCandidate, getCurrentUser } from '../controllers/authController';
import { submitNeed, getMyNeeds } from '../controllers/needsController';
import { getPlatformConfig, updatePlatformConfig } from '../controllers/configController';
import { adminLogin, getAllNeedsAdmin, updateNeedStatus, getPartners, createPartner, getUsers, getAnalytics, exportNeedsCSV } from '../controllers/adminController';
import { partnerLogin, getPartnerNeeds, updatePartnerNeedStatus } from '../controllers/partnerController';
import { authenticateUser, authenticateAdmin, authenticatePartner } from '../middleware/auth';

const router = express.Router();

// Public Routes
router.post('/auth/register', registerOrLoginCandidate);
router.get('/config', getPlatformConfig);
router.post('/admin/auth/login', adminLogin);
router.post('/partner/auth/login', partnerLogin);

// Candidate Authenticated Routes
router.get('/auth/me', authenticateUser, getCurrentUser);
router.post('/needs', authenticateUser, submitNeed);
router.get('/needs/mine', authenticateUser, getMyNeeds);

// Admin Routes
router.get('/admin/needs', authenticateAdmin, getAllNeedsAdmin);
router.patch('/admin/needs/:id', authenticateAdmin, updateNeedStatus);
router.patch('/admin/config', authenticateAdmin, updatePlatformConfig);
router.get('/admin/partners', authenticateAdmin, getPartners);
router.post('/admin/partners', authenticateAdmin, createPartner);
router.get('/admin/users', authenticateAdmin, getUsers);
router.get('/admin/analytics', authenticateAdmin, getAnalytics);
router.get('/admin/reports/needs/csv', authenticateAdmin, exportNeedsCSV);

// Partner Routes
router.get('/partner/needs', authenticatePartner, getPartnerNeeds);
router.patch('/partner/needs/:id', authenticatePartner, updatePartnerNeedStatus);

export default router;
