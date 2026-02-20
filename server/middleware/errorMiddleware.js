const errorHandler = (err, req, res, next) => {
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
        console.error('--- CENTRAL ERROR HANDLER ---');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
    }

    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        success: false,
        message: err.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = errorHandler;
