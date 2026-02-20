const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');
const User = require('../models/User');

// @desc    Get top matching candidates for a job
// @route   GET /api/match/job/:jobId
// @access  Private/Recruiter
const getMatchingCandidates = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.jobId);

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    const candidates = await User.find({ role: 'candidate' }).lean();

    const results = candidates.map(candidate => {

        // 🧠 Skill Matching
        const requiredSkills = job.requiredSkills || [];
        const candidateSkills = candidate.skills || [];

        const overlap = requiredSkills.filter(skill =>
            candidateSkills.includes(skill)
        ).length;

        const skillScore = requiredSkills.length > 0
            ? (overlap / requiredSkills.length) * 60
            : 0;

        // 🧠 Experience Matching
        const requiredExp = job.experienceRequired || 0;
        const candidateExp = candidate.experienceYears || 0;

        let experienceScore = 0;
        if (requiredExp === 0) {
            experienceScore = 30;
        } else if (candidateExp >= requiredExp) {
            experienceScore = 30;
        } else {
            experienceScore = (candidateExp / requiredExp) * 30;
        }

        // 🧠 Location Matching
        let locationScore = 0;
        if (job.location === 'Remote' || job.location === candidate.location) {
            locationScore = 10;
        }

        const totalScore = Math.round(skillScore + experienceScore + locationScore);

        return {
            candidateId: candidate._id,
            name: candidate.name,
            email: candidate.email,
            score: totalScore,
            skillScore: Math.round(skillScore),
            experienceScore: Math.round(experienceScore),
            locationScore
        };
    });

    // Sort by score descending
    const sorted = results.sort((a, b) => b.score - a.score);

    res.json({
        success: true,
        data: sorted.slice(0, 10) // top 10 candidates
    });
});

module.exports = {
    getMatchingCandidates
};