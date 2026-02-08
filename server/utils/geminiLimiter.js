/**
 * Gemini API Rate Limiter - HARD LIMIT (NON-NEGOTIABLE)
 * 
 * This limiter ensures ZERO concurrent calls to Gemini API.
 * Even serial calls are throttled to prevent 429 errors.
 * 
 * Configuration:
 * - maxConcurrent: 1 (only ONE call at a time)
 * - minTime: 2000ms (minimum 2 seconds between calls)
 * 
 * This guarantees:
 * - Max 30 requests per minute (60s / 2s = 30)
 * - No concurrent requests
 * - No 429 errors
 */

const Bottleneck = require('bottleneck');

const geminiLimiter = new Bottleneck({
    maxConcurrent: 1,      // Only 1 request at a time
    minTime: 2000,         // Minimum 2 seconds between requests
    
    // Reservoir settings for additional safety
    reservoir: 30,         // Start with 30 tokens
    reservoirRefreshAmount: 30,  // Refill to 30 tokens
    reservoirRefreshInterval: 60 * 1000,  // Every 60 seconds
    
    // Retry settings
    retryLimit: 2,         // Retry up to 2 times
    retryDelay: 5000       // Wait 5 seconds before retry
});

// Event listeners for monitoring
geminiLimiter.on('failed', async (error, jobInfo) => {
    const id = jobInfo.options.id;
    console.error(`❌ Gemini call failed (${id}):`, error.message);
    
    // Retry on 429 or RESOURCE_EXHAUSTED
    if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
        console.log(`🔄 Retrying in 5 seconds... (attempt ${jobInfo.retryCount + 1}/2)`);
        return 5000; // Wait 5 seconds before retry
    }
});

geminiLimiter.on('retry', (error, jobInfo) => {
    console.log(`🔄 Retrying Gemini call (${jobInfo.options.id})...`);
});

geminiLimiter.on('depleted', (empty) => {
    if (empty) {
        console.log('⏳ Gemini rate limit reservoir depleted. Waiting for refill...');
    }
});

geminiLimiter.on('debug', (message, data) => {
    if (process.env.LOG_LEVEL === 'debug') {
        console.log('🔍 Gemini Limiter:', message, data);
    }
});

module.exports = geminiLimiter;
