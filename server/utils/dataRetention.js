/**
 * Data Retention Policy Implementation
 * Automatically deletes data older than 30 days (HIPAA compliance)
 */

const Session = require('../models/Session');
const CognitiveProfile = require('../models/CognitiveProfile');

const RETENTION_DAYS = 30;

/**
 * Clean up old session data
 */
async function cleanupOldSessions() {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

        const result = await Session.deleteMany({
            endTime: { $lt: cutoffDate },
            status: 'completed'
        });

        console.log(`✅ Data Retention: Deleted ${result.deletedCount} sessions older than ${RETENTION_DAYS} days`);
        return result.deletedCount;
    } catch (error) {
        console.error('Session cleanup error:', error);
        return 0;
    }
}

/**
 * Clean up old emotional patterns from profiles
 */
async function cleanupOldEmotionalPatterns() {
    try {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);

        const profiles = await CognitiveProfile.find({});
        let totalCleaned = 0;

        for (const profile of profiles) {
            const originalLength = profile.emotional_patterns.length;
            
            // Keep only patterns within retention period
            profile.emotional_patterns = profile.emotional_patterns.filter(
                pattern => pattern.date >= cutoffDate
            );

            if (profile.emotional_patterns.length < originalLength) {
                await profile.save();
                totalCleaned += (originalLength - profile.emotional_patterns.length);
            }
        }

        console.log(`✅ Data Retention: Cleaned ${totalCleaned} old emotional patterns`);
        return totalCleaned;
    } catch (error) {
        console.error('Emotional pattern cleanup error:', error);
        return 0;
    }
}

/**
 * Run all cleanup tasks
 */
async function runDataRetentionCleanup() {
    console.log('🧹 Starting data retention cleanup...');
    
    const [sessionsDeleted, patternsDeleted] = await Promise.all([
        cleanupOldSessions(),
        cleanupOldEmotionalPatterns()
    ]);

    console.log(`✅ Data retention cleanup complete: ${sessionsDeleted} sessions, ${patternsDeleted} patterns`);
    
    return {
        sessionsDeleted,
        patternsDeleted,
        timestamp: new Date()
    };
}

/**
 * Schedule daily cleanup (call this on server start)
 */
function scheduleDataRetentionCleanup() {
    // Run immediately on start
    runDataRetentionCleanup();

    // Run daily at 2 AM
    const CLEANUP_HOUR = 2;
    const now = new Date();
    const nextRun = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        CLEANUP_HOUR,
        0,
        0
    );

    const msUntilNextRun = nextRun.getTime() - now.getTime();

    setTimeout(() => {
        runDataRetentionCleanup();
        // Then run every 24 hours
        setInterval(runDataRetentionCleanup, 24 * 60 * 60 * 1000);
    }, msUntilNextRun);

    console.log(`📅 Data retention cleanup scheduled for ${nextRun.toLocaleString()}`);
}

module.exports = {
    cleanupOldSessions,
    cleanupOldEmotionalPatterns,
    runDataRetentionCleanup,
    scheduleDataRetentionCleanup,
    RETENTION_DAYS
};
