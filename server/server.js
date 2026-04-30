const app = require('./app');
const connectDB = require('./config/db');
const startKeepAlive = require('./keep-alive');

// Connect to Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);

    // Start keep-alive self-ping to prevent Render free tier spin-down
    const renderUrl = process.env.RENDER_EXTERNAL_URL;
    if (renderUrl) {
        startKeepAlive(renderUrl);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});
