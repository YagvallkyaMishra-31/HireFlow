const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const Application = require('../models/Application');
const mongoose = require('mongoose');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Recruiter/Admin
const getStats = asyncHandler(async (req, res) => {
    // Total Jobs posted by this recruiter (or total if admin)
    const jobFilter = req.user.role === 'admin' ? {} : { postedBy: req.user._id };
    const totalJobs = await Job.countDocuments(jobFilter);

    // Get job IDs for higher-level filtering of applications
    const userJobIds = await Job.find(jobFilter).distinct('_id');

    // Total Applications received for those jobs
    const totalApplications = await Application.countDocuments({
        job: { $in: userJobIds }
    });

    // Applications grouped by status
    const applicationsByStatus = await Application.aggregate([
        {
            $match: { job: { $in: userJobIds } }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 }
            }
        },
        {
            $project: {
                status: '$_id',
                count: 1,
                _id: 0
            }
        }
    ]);

    // Applications per job
    const applicationsPerJob = await Application.aggregate([
        {
            $match: { job: { $in: userJobIds } }
        },
        {
            $group: {
                _id: '$job',
                count: { $sum: 1 }
            }
        },
        {
            $lookup: {
                from: 'jobs',
                localField: '_id',
                foreignField: '_id',
                as: 'jobDetails'
            }
        },
        {
            $unwind: '$jobDetails'
        },
        {
            $project: {
                jobTitle: '$jobDetails.title',
                count: 1,
                _id: 0
            }
        }
    ]);

    res.json({
        success: true,
        data: {
            totalJobs,
            totalApplications,
            applicationsByStatus,
            applicationsPerJob
        }
    });
});

module.exports = {
    getStats
};
