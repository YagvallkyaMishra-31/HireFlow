const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        index: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: 6,
        select: false
    },
    role: {
        type: String,
        enum: ['candidate', 'recruiter', 'admin'],
        default: 'candidate'
    },

    // 🔥 NEW FIELDS FOR MATCHING ENGINE
    skills: {
        type: [String],
        default: [],
        index: true
    },

    experienceYears: {
        type: Number,
        default: 0
    },

    location: {
        type: String,
        default: 'Remote'
    }

}, {
    timestamps: true
});

// 🔐 Encrypt password
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// 🔐 Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Index for skill search
// userSchema.index({ skills: 1 });

module.exports = mongoose.model('User', userSchema);