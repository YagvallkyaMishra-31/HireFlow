const express = require('express');
const router = express.Router();
const { createJob, getJobs, getJobById, seedJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.route('/')
    .get(getJobs)
    .post(protect, authorize('recruiter', 'admin'), createJob);

router.route('/:id')
    .get(getJobById);

router.post('/dev/seed', protect, authorize('recruiter', 'admin'), seedJobs);

module.exports = router;
