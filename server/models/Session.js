/**
 * Session Model - Stores chat and video session history
 * Enables session summaries, progress tracking, and context retrieval
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    text: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },

    // AI analysis of this message
    analysis: {
        emotion: { type: String },
        intensity: { type: Number, min: 0, max: 1 },
        risk_level: { type: String, enum: ['low', 'medium', 'high', 'crisis'] },
        therapy_style_used: { type: String }
    }
});

const sessionSchema = new mongoose.Schema({
    // User reference
    userId: {
        type: String,
        required: true,
        index: true
    },

    // Session type
    type: {
        type: String,
        enum: ['chat', 'video', 'booking'],
        default: 'chat'
    },

    // Session status
    status: {
        type: String,
        enum: ['active', 'completed', 'abandoned', 'interrupted'],
        default: 'active'
    },

    // Messages in this session
    messages: [messageSchema],

    // Session timing
    startTime: { type: Date, default: Date.now },
    endTime: { type: Date },
    duration: { type: Number }, // in seconds

    // AI-generated session summary
    summary: {
        overview: { type: String },
        emotional_journey: { type: String },
        key_themes: [{ type: String }],
        breakthroughs: [{ type: String }],
        concerns: [{ type: String }],
        progress_vs_previous: { type: String },
        recommended_focus_next: { type: String },
        mood_at_start: { type: String },
        mood_at_end: { type: String },
        quality_score: { type: Number, min: 1, max: 10 }
    },

    // Aggregate emotion data for the session
    emotionMetrics: {
        dominant_emotion: { type: String },
        average_intensity: { type: Number },
        highest_risk_level: { type: String },
        emotion_distribution: { type: Map, of: Number }, // e.g., { anxious: 0.3, calm: 0.7 }
        trajectory: { type: String, enum: ['improving', 'stable', 'declining', 'fluctuating'] }
    },

    // Interventions used during session
    interventions_used: [{
        intervention: { type: String },
        timestamp: { type: Date },
        user_response: { type: String, enum: ['positive', 'neutral', 'negative', 'no_response'] }
    }],

    // Crisis events during session
    crisis_events: [{
        timestamp: { type: Date },
        risk_level: { type: String },
        intervention_type: { type: String },
        resolved: { type: Boolean }
    }],

    // Therapy styles used
    therapy_styles_used: [{
        style: { type: String },
        duration_seconds: { type: Number },
        effectiveness: { type: Number, min: 0, max: 1 }
    }],

    // Video session specific (Tavus)
    videoSession: {
        conversationId: { type: String },
        replicaId: { type: String },
        personaId: { type: String },
        transcript: { type: String },
        video_url: { type: String }
    },

    // Feedback
    userFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        helpful: { type: Boolean },
        comments: { type: String },
        submitted_at: { type: Date }
    },

    // Metadata
    metadata: {
        platform: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
        language: { type: String, default: 'en' },
        user_agent: { type: String }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
sessionSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate duration on session end
sessionSchema.methods.endSession = async function () {
    this.status = 'completed';
    this.endTime = new Date();
    this.duration = Math.round((this.endTime - this.startTime) / 1000);
    return this.save();
};

// Add message to session
sessionSchema.methods.addMessage = async function (role, text, analysis = {}) {
    this.messages.push({ role, text, analysis });
    return this.save();
};

// Update session summary
sessionSchema.methods.updateSummary = async function (summaryData) {
    this.summary = { ...this.summary, ...summaryData };
    return this.save();
};

// Calculate emotion metrics from messages
sessionSchema.methods.calculateEmotionMetrics = function () {
    const messages = this.messages.filter(m => m.analysis && m.analysis.emotion);
    if (messages.length === 0) return;

    const emotionCounts = {};
    let totalIntensity = 0;
    let highestRisk = 'low';
    const riskOrder = ['low', 'medium', 'high', 'crisis'];

    messages.forEach(m => {
        const emotion = m.analysis.emotion;
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        totalIntensity += m.analysis.intensity || 0;

        if (riskOrder.indexOf(m.analysis.risk_level) > riskOrder.indexOf(highestRisk)) {
            highestRisk = m.analysis.risk_level;
        }
    });

    // Find dominant emotion
    const dominant = Object.entries(emotionCounts)
        .sort((a, b) => b[1] - a[1])[0];

    // Calculate distribution
    const total = messages.length;
    const distribution = {};
    Object.entries(emotionCounts).forEach(([emotion, count]) => {
        distribution[emotion] = count / total;
    });

    // Determine trajectory
    const firstHalf = messages.slice(0, Math.floor(messages.length / 2));
    const secondHalf = messages.slice(Math.floor(messages.length / 2));

    const firstAvgIntensity = firstHalf.reduce((sum, m) => sum + (m.analysis.intensity || 0), 0) / firstHalf.length;
    const secondAvgIntensity = secondHalf.reduce((sum, m) => sum + (m.analysis.intensity || 0), 0) / secondHalf.length;

    let trajectory = 'stable';
    if (secondAvgIntensity < firstAvgIntensity - 0.1) trajectory = 'improving';
    else if (secondAvgIntensity > firstAvgIntensity + 0.1) trajectory = 'declining';

    this.emotionMetrics = {
        dominant_emotion: dominant ? dominant[0] : 'neutral',
        average_intensity: totalIntensity / messages.length,
        highest_risk_level: highestRisk,
        emotion_distribution: distribution,
        trajectory
    };

    return this.save();
};

// Get session transcript as string
sessionSchema.methods.getTranscript = function () {
    return this.messages
        .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`)
        .join('\n');
};

// Static method to get user's recent sessions
sessionSchema.statics.getRecentSessions = function (userId, limit = 10) {
    return this.find({ userId, status: 'completed' })
        .sort({ endTime: -1 })
        .limit(limit)
        .select('summary emotionMetrics startTime endTime duration type');
};

// Static method to get user's session stats
sessionSchema.statics.getSessionStats = async function (userId) {
    const sessions = await this.find({ userId, status: 'completed' });

    if (sessions.length === 0) {
        return {
            total_sessions: 0,
            total_duration: 0,
            average_duration: 0,
            average_quality: 0
        };
    }

    const totalDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const qualityScores = sessions.filter(s => s.summary?.quality_score);
    const averageQuality = qualityScores.length > 0
        ? qualityScores.reduce((sum, s) => sum + s.summary.quality_score, 0) / qualityScores.length
        : 0;

    return {
        total_sessions: sessions.length,
        total_duration: totalDuration,
        average_duration: totalDuration / sessions.length,
        average_quality: averageQuality
    };
};

// Indexes
sessionSchema.index({ userId: 1, startTime: -1 });
sessionSchema.index({ userId: 1, status: 1 });
sessionSchema.index({ 'messages.timestamp': -1 });

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
