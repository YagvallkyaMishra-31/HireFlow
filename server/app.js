const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const jobRoutes = require('./routes/jobRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Security Middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
    process.env.CLIENT_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175'
].filter(Boolean);

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin is localhost (any port) or in allowedOrigins
        const isLocalhost = /^http:\/\/localhost:\d+$/.test(origin);

        if (isLocalhost || allowedOrigins.includes(origin)) {
            return callback(null, true);
        } else {
            console.error(`CORS Blocked for origin: ${origin}`);
            return callback(new Error('Not allowed by CORS'), false);
        }
    },
    credentials: true
}));

// Body parser with size limit
app.use(express.json({ limit: '10kb' }));

// Sanitize data against XSS
// Removed xss-clean due to compatibility issues with newer Node.js versions

// Logging in development
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Rate Limiting
const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100,
    message: { success: false, message: 'Too many requests, please try again after 1 minute' }
});

const authLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 5,
    message: { success: false, message: 'Too many login attempts, please try again after 1 minute' }
});

app.use('/api', globalLimiter);
app.use('/api/auth/login', authLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/match', require('./routes/matchRoutes'));

// Base route
app.get('/', (req, res) => {
    res.send('HireFlow API is running...');
});

// 404 handler for non-existent routes
app.use((req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
});

// Centralized error middleware
app.use(errorHandler);

module.exports = app;
