const express = require('express');
const router = express.Router();

const { getMatchingCandidates } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Recruiter only
router.get('/job/:jobId', protect, authorize('recruiter', 'admin'), getMatchingCandidates);

module.exports = router;