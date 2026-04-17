import express from 'express';
import { registerOrLoginCandidate, loginCandidate, getCurrentUser, updateUserPassword, updateProfile, requestPasswordReset, resetPassword, updateBackupPin, resetPasswordWithPin } from '../controllers/authController';
import { getPlatformConfig, updatePlatformConfig } from '../controllers/configController';
import { submitNeed, getMyNeeds, getPublicMapData, reuploadMedia } from '../controllers/needsController';
import { adminLogin, getAllNeedsAdmin, updateNeedStatus, getPartners, createPartner, getUsers, getAnalytics, exportNeedsCSV, updateAdminPassword } from '../controllers/adminController';
import { partnerLogin, getPartnerNeeds, updatePartnerNeedStatus, updatePartnerPassword } from '../controllers/partnerController';
import { authenticateUser, optionalAuthenticateUser, authenticateAdmin, authenticatePartner } from '../middleware/auth';
import { uploadMedia } from '../middleware/upload';

const router = express.Router();

// Public Routes
router.post('/auth/register', registerOrLoginCandidate);
router.post('/auth/login', loginCandidate);
router.get('/config', getPlatformConfig);
router.get('/needs/map', getPublicMapData);
router.post('/admin/auth/login', adminLogin);
router.post('/partner/auth/login', partnerLogin);
router.post('/auth/forgot-password', requestPasswordReset);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/reset-password-pin', resetPasswordWithPin);

// Candidate Authenticated Routes
router.get('/auth/me', authenticateUser, getCurrentUser);
router.patch('/profile', authenticateUser, updateProfile);
router.patch('/profile/password', authenticateUser, updateUserPassword);
router.patch('/profile/pin', authenticateUser, updateBackupPin);
router.post('/needs', optionalAuthenticateUser, uploadMedia.single('media'), submitNeed);
router.post('/needs/:id/media', authenticateUser, uploadMedia.single('media'), reuploadMedia);
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
router.patch('/admin/profile/password', authenticateAdmin, updateAdminPassword);

// Partner Routes
router.get('/partner/needs', authenticatePartner, getPartnerNeeds);
router.patch('/partner/needs/:id', authenticatePartner, updatePartnerNeedStatus);
router.patch('/partner/profile/password', authenticatePartner, updatePartnerPassword);

export default router;
