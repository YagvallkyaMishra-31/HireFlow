const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');

// @desc    Create a new job
// @route   POST /api/jobs
// @access  Private/Recruiter
const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

const createJob = asyncHandler(async (req, res) => {
    const { title, description, company } = req.body;

    if (!title || !description || !company) {
        res.status(400);
        throw new Error('Please add title, description and company');
    }

    // Extract skills from description (simple keyword matching)
    const commonSkills = [
        'React', 'Node.js', 'Node', 'JavaScript', 'TypeScript', 'Python', 'Java', 'C++',
        'SQL', 'MongoDB', 'AWS', 'Azure', 'Docker', 'Kubernetes', 'HTML', 'CSS',
        'Tailwind', 'Next.js', 'Express', 'Angular', 'Vue', 'PHP', 'Ruby', 'Go',
        'Swift', 'Kotlin', 'Flutter', 'Redux', 'GraphQL', 'REST', 'DevOps', 'CI/CD'
    ];

    const extractedSkills = commonSkills.filter(skill =>
        new RegExp(`\\b${escapeRegExp(skill)}\\b`, 'i').test(description)
    );

    const job = await Job.create({
        title,
        description,
        company,
        requiredSkills: extractedSkills.length > 0 ? extractedSkills : [],
        postedBy: req.user._id
    });

    res.status(201).json({
        success: true,
        data: job
    });
});

// @desc    Get all jobs (with pagination, search and filtering)
// @route   GET /api/jobs
// @access  Public
const getJobs = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = Math.max((page - 1) * limit, 0);

    const { search, company, postedBy } = req.query;

    let query = {};

    if (search && search.trim() !== "") {
        query.title = { $regex: search.trim(), $options: "i" };
    }

    if (company && company.trim() !== "") {
        query.company = { $regex: company.trim(), $options: "i" };
    }

    if (postedBy && postedBy.trim() !== "") {
        query.postedBy = postedBy;
    }

    const total = await Job.countDocuments(query);

    const jobs = await Job.find(query)
        .populate('postedBy', 'name email')
        .skip(skip)
        .limit(limit)
        .sort('-createdAt')
        .lean();

    res.status(200).json({
        success: true,
        data: {
            total,
            page,
            pages: Math.ceil(total / limit) || 1,
            jobs
        }
    });
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
const getJobById = asyncHandler(async (req, res) => {
    const job = await Job.findById(req.params.id)
        .populate('postedBy', 'name email')
        .lean();

    if (!job) {
        res.status(404);
        throw new Error('Job not found');
    }

    res.json({
        success: true,
        data: job
    });
});

// @desc    Seed sample jobs (Dev Only)
// @route   POST /api/jobs/dev/seed
// @access  Private/Recruiter/Admin
const seedJobs = asyncHandler(async (req, res) => {
    const sampleJobs = [
        {
            title: 'Frontend Developer',
            description: 'Looking for a React expert to build modern UIs.',
            company: 'TechFlow'
        },
        {
            title: 'Backend Engineer',
            description: 'Node.js and MongoDB expert needed for scalable APIs.',
            company: 'HireWave'
        },
        {
            title: 'Full Stack Ninja',
            description: 'Experience with MERN stack and cloud deployment.',
            company: 'CodeStream'
        }
    ];

    const jobsWithUser = sampleJobs.map(job => ({
        ...job,
        postedBy: req.user._id
    }));

    await Job.insertMany(jobsWithUser);

    res.status(201).json({
        success: true,
        message: '3 sample jobs seeded successfully'
    });
});

module.exports = {
    createJob,
    getJobs,
    getJobById,
    seedJobs
};
