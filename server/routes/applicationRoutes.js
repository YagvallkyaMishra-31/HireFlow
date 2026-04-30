const express = require('express');
const router = express.Router();

const {
    applyToJob,
    withdrawApplication,
    updateApplicationStatus,
    getApplicationsByJob,
    getMyApplications,
    checkIfApplied,
    upload
} = require('../controllers/applicationController');

const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Candidate Routes
router.post('/', protect, authorize('candidate'), upload.single('resume'), applyToJob);
router.get('/my', protect, authorize('candidate'), getMyApplications);
router.get('/check/:jobId', protect, authorize('candidate'), checkIfApplied);
router.patch('/:id/withdraw', protect, authorize('candidate'), withdrawApplication);

// Recruiter/Admin Routes
router.patch('/:id', protect, authorize('recruiter', 'admin'), updateApplicationStatus);
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getApplicationsByJob);

module.exports = router;