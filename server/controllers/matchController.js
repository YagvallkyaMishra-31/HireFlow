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

    const sanitizeArray = (val) => {
        if (Array.isArray(val)) return val.map(s => s.trim().toLowerCase());
        if (typeof val === 'string') return val.split(',').map(s => s.trim().toLowerCase());
        return [];
    };

    const results = candidates.map(candidate => {
        const requiredSkills = sanitizeArray(job.requiredSkills);
        const candidateSkills = sanitizeArray(candidate.skills);
        const requiredExp = Number(job.experienceRequired) || 0;
        const candidateExp = Number(candidate.experienceYears) || 0;
        const jobLocation = (job.location || 'Remote').trim().toLowerCase();
        const candidateLocation = (candidate.location || 'Remote').trim().toLowerCase();

        // 1. Skill Match (60%)
        let skillScore = 0;
        if (requiredSkills.length > 0 && candidateSkills.length > 0) {
            const overlap = requiredSkills.filter(skill => candidateSkills.includes(skill)).length;
            skillScore = (overlap / requiredSkills.length) * 100;
        }

        // 2. Experience Match (30%)
        let experienceScore = 0;
        if (requiredExp > 0) {
            experienceScore = candidateExp >= requiredExp ? 100 : (candidateExp / requiredExp) * 100;
        }

        // 3. Location Match (10%)
        let locationScore = (jobLocation !== 'remote' && jobLocation === candidateLocation) ? 100 : 0;

        const totalScore = Math.round(
            (skillScore * 0.6) +
            (experienceScore * 0.3) +
            (locationScore * 0.1)
        );

        return {
            candidateId: candidate._id,
            name: candidate.name,
            email: candidate.email,
            score: totalScore,
            skillScore: Math.round(skillScore),
            experienceScore: Math.round(experienceScore),
            locationScore: Math.round(locationScore)
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