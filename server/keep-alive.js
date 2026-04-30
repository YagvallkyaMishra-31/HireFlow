/**
 * Keep-Alive: Self-ping to prevent Render free tier from spinning down.
 * Pings the server's own /api/health endpoint every 14 minutes.
 */
const https = require('https');
const http = require('http');

function startKeepAlive(serverUrl) {
    if (!serverUrl) {
        console.log('[Keep-Alive] No RENDER_EXTERNAL_URL set, skipping keep-alive');
        return;
    }

    const healthUrl = `${serverUrl}/api/health`;
    const INTERVAL = 14 * 60 * 1000; // 14 minutes

    console.log(`[Keep-Alive] Pinging ${healthUrl} every 14 minutes`);

    setInterval(() => {
        const client = healthUrl.startsWith('https') ? https : http;
        client.get(healthUrl, (res) => {
            console.log(`[Keep-Alive] Ping OK — status ${res.statusCode}`);
        }).on('error', (err) => {
            console.error(`[Keep-Alive] Ping failed: ${err.message}`);
        });
    }, INTERVAL);
}

module.exports = startKeepAlive;
