const mongoose = require('mongoose');

// 🔹 History Entry Schema (Audit Trail)
const historyEntrySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: [
        'Applied',
        'Screening',
        'Interview',
        'Technical',
        'HR',
        'Offer',
        'Hired',
        'Rejected'
      ]
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String
    }
  },
  { _id: false } // Prevent separate _id for each history entry
);

// 🔹 Main Application Schema
const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.ObjectId,
      ref: 'Job',
      required: true
    },
    candidate: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: [
        'Applied',
        'Screening',
        'Interview',
        'Technical',
        'HR',
        'Offer',
        'Hired',
        'Rejected'
      ],
      default: 'Applied'
    },
    notes: {
      type: String
    },

    // 🔹 Resume & Cover Letter
    resumeFilename: {
      type: String
    },
    coverLetter: {
      type: String
    },

    // 🔹 Audit Timeline History
    history: {
      type: [historyEntrySchema],
      default: []
    },

    // 🔹 AI Match Scores
    matchScore: { type: Number, default: 0 },
    skillScore: { type: Number, default: 0 },
    experienceScore: { type: Number, default: 0 },
    locationScore: { type: Number, default: 0 }
  },
  {
    timestamps: true
  }
);

// 🔹 Compound index to prevent duplicate applications
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);