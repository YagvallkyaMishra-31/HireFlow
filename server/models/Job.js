const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a job title'],
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    company: {
        type: String,
        required: [true, 'Please add a company name'],
        index: true
    },

    // 🔥 NEW FIELDS FOR MATCHING
    requiredSkills: {
        type: [String],
        default: [],
        index: true
    },

    experienceRequired: {
        type: Number, // in years
        default: 0
    },

    location: {
        type: String,
        default: 'Remote'
    },

    postedBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
        index: true
    }

}, {
    timestamps: true
});

// Index for skill-based search
// jobSchema.index({ requiredSkills: 1 });

module.exports = mongoose.model('Job', jobSchema);