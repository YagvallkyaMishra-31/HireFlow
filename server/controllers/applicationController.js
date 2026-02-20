const asyncHandler = require('express-async-handler');
const Application = require('../models/Application');
const Job = require('../models/Job');

// Status Transition Rules
const STATUS_TRANSITIONS = {
    'Applied': ['Screening', 'Rejected'],
    'Screening': ['Interview', 'Rejected'],
    'Interview': ['Technical', 'Rejected'],
    'Technical': ['HR', 'Rejected'],
    'HR': ['Offer', 'Rejected'],
    'Offer': ['Hired', 'Rejected'],
    'Hired': [],
    'Rejected': [],
    'Withdrawn': []
};

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/Candidate
const applyToJob = asyncHandler(async (req, res) => {
    const { job: jobId, notes } = req.body;

    if (!jobId) {
        res.status(400);
        throw new Error('Please provide a job ID');
    }

    const job = await Job.findById(jobId);
    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const alreadyApplied = await Application.findOne({
        job: jobId,
        candidate: req.user._id
    });

    if (alreadyApplied) {
        res.status(400);
        throw new Error('You have already applied for this job');
    }

    const application = await Application.create({
        job: jobId,
        candidate: req.user._id,
        notes,
        history: [
            {
                status: 'Applied',
                changedBy: req.user._id,
                changedAt: new Date()
            }
        ]
    });

    res.status(201).json({
        success: true,
        data: application
    });
});

// @desc    Withdraw application
// @route   PATCH /api/applications/:id/withdraw
// @access  Private/Candidate
const withdrawApplication = asyncHandler(async (req, res) => {
    const application = await Application.findById(req.params.id);

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    // Ownership check
    if (application.candidate.toString() !== req.user._id.toString()) {
        res.status(403);
        throw new Error('Not authorized to withdraw this application');
    }

    // Prevent withdrawing terminal states
    if (['Hired', 'Rejected', 'Withdrawn'].includes(application.status)) {
        res.status(400);
        throw new Error(`Cannot withdraw application in ${application.status} state`);
    }

    application.status = 'Withdrawn';

    if (!application.history) {
        application.history = [];
    }

    application.history.push({
        status: 'Withdrawn',
        changedBy: req.user._id,
        changedAt: new Date()
    });

    await application.save();

    res.json({
        success: true,
        message: 'Application withdrawn successfully'
    });
});

// @desc    Update application status
// @route   PATCH /api/applications/:id
// @access  Private/Recruiter
const updateApplicationStatus = asyncHandler(async (req, res) => {
    const { status, notes, note } = req.body;

    const application = await Application.findById(req.params.id).populate('job');

    if (!application) {
        res.status(404);
        throw new Error('Application not found');
    }

    if (application.job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to update this application');
    }

    if (status) {
        const allowedTransitions = STATUS_TRANSITIONS[application.status];
        if (!allowedTransitions || !allowedTransitions.includes(status)) {
            res.status(400);
            throw new Error(`Invalid status transition from ${application.status} to ${status}`);
        }

        application.status = status;

        if (!application.history) {
            application.history = [];
        }

        application.history.push({
            status,
            changedBy: req.user._id,
            changedAt: new Date(),
            note: note || undefined
        });
    }

    if (notes) application.notes = notes;

    const updatedApplication = await application.save();

    res.json({
        success: true,
        data: updatedApplication
    });
});

// @desc    Get applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private/Recruiter
const getApplicationsByJob = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Not authorized to view applications');
    }

    const applications = await Application.find({ job: req.params.jobId })
        .populate('candidate', 'name email')
        .populate('history.changedBy', 'name')
        .lean();

    const safeApplications = applications.map(app => ({
        ...app,
        history: app.history || []
    }));

    res.json({
        success: true,
        data: safeApplications
    });
});

// @desc    Get candidate's own applications
// @route   GET /api/applications/my
// @access  Private/Candidate
const getMyApplications = asyncHandler(async (req, res) => {
    const applications = await Application.find({ candidate: req.user._id })
        .populate('job', 'title company description')
        .populate('history.changedBy', 'name')
        .sort('-createdAt')
        .lean();

    const safeApplications = applications.map(app => ({
        ...app,
        history: app.history || []
    }));

    res.json({
        success: true,
        data: safeApplications
    });
});

module.exports = {
    applyToJob,
    withdrawApplication,
    updateApplicationStatus,
    getApplicationsByJob,
    getMyApplications
};