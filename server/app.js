const express = require('express');
const path = require('path');
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
const fs = require('fs');

// Load environment variables from server/.env (uses __dirname so it works regardless of CWD)
dotenv.config({ path: path.join(__dirname, '.env') });

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

// ---------- Production: serve React build ----------
const distPath = path.join(__dirname, '../client/dist');
const isProduction = process.env.NODE_ENV?.trim() === 'production' || fs.existsSync(path.join(distPath, 'index.html'));

if (isProduction && fs.existsSync(path.join(distPath, 'index.html'))) {
    // Serve static assets from client/dist
    app.use(express.static(distPath));

    // Any route that is NOT /api/* → send index.html (SPA fallback)
    app.use((req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
    });
} else {
    // Dev-only base route
    app.get('/', (req, res) => {
        res.send('HireFlow API is running...');
    });

    // 404 handler (dev only — in production the SPA fallback handles it)
    app.use((req, res, next) => {
        const error = new Error(`Not Found - ${req.originalUrl}`);
        res.status(404);
        next(error);
    });
}

// Centralized error middleware
app.use(errorHandler);

module.exports = app;
