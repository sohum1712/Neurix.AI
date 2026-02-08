/**
 * CognitiveProfile Model - Persistent User Mental Model (Cognitive Digital Twin)
 * Tracks emotional patterns, triggers, effective interventions, and wellness trajectory
 */

const mongoose = require('mongoose');

const emotionalPatternSchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    mood: {
        type: String,
        enum: ['anxious', 'sad', 'calm', 'stressed', 'overwhelmed', 'hopeful', 'angry', 'neutral', 'confused', 'relieved', 'happy'],
        required: true
    },
    intensity: { type: Number, min: 0, max: 1, default: 0.5 },
    context: { type: String }, // What triggered this mood
    source: { type: String, enum: ['chat', 'video_session', 'self_report', 'ai_detected'], default: 'ai_detected' }
});

const interventionHistorySchema = new mongoose.Schema({
    date: { type: Date, default: Date.now },
    intervention: { type: String, required: true }, // e.g., "breathing exercise", "grounding technique"
    effectiveness: { type: Number, min: 1, max: 5 }, // User rating or AI assessment
    mood_before: { type: String },
    mood_after: { type: String },
    notes: { type: String }
});

const sessionSnapshotSchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    date: { type: Date, default: Date.now },
    mood_start: { type: String },
    mood_end: { type: String },
    key_themes: [{ type: String }],
    breakthroughs: [{ type: String }],
    concerns: [{ type: String }]
});

const cognitiveProfileSchema = new mongoose.Schema({
    // User reference (can be Supabase UUID or MongoDB ObjectId)
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Baseline emotional state
    baseline_mood: {
        type: String,
        enum: ['very_positive', 'positive', 'neutral', 'negative', 'very_negative'],
        default: 'neutral'
    },

    // Known triggers that affect mental state
    triggers: [{
        trigger: { type: String },
        severity: { type: Number, min: 1, max: 10 },
        frequency: { type: String, enum: ['rare', 'occasional', 'frequent', 'constant'] },
        identified_date: { type: Date, default: Date.now }
    }],

    // Interventions that work well for this user
    effective_interventions: [{
        intervention: { type: String },
        success_rate: { type: Number, min: 0, max: 1 },
        times_used: { type: Number, default: 1 },
        last_used: { type: Date }
    }],

    // Coping strategies the user has tried or mentioned
    coping_strategies: [{
        strategy: { type: String },
        effectiveness: { type: Number, min: 1, max: 5 },
        source: { type: String, enum: ['user_mentioned', 'ai_suggested', 'professional_recommended'] }
    }],

    // Emotional patterns over time
    emotional_patterns: [emotionalPatternSchema],

    // Intervention history
    intervention_history: [interventionHistorySchema],

    // Session snapshots for progress tracking
    session_snapshots: [sessionSnapshotSchema],

    // User's wellness goals
    goals: [{
        goal: { type: String },
        priority: { type: Number, min: 1, max: 5 },
        status: { type: String, enum: ['active', 'achieved', 'paused', 'abandoned'], default: 'active' },
        created_date: { type: Date, default: Date.now },
        achieved_date: { type: Date }
    }],

    // Primary concerns (from user input or AI detection)
    primary_concerns: [{
        concern: { type: String },
        severity: { type: Number, min: 1, max: 10 },
        first_mentioned: { type: Date, default: Date.now },
        times_discussed: { type: Number, default: 1 },
        status: { type: String, enum: ['active', 'improving', 'resolved', 'recurring'], default: 'active' }
    }],

    // Preferred therapy styles based on effectiveness
    preferred_therapy_styles: [{
        style: { type: String, enum: ['CBT', 'supportive', 'mindfulness', 'motivational'] },
        effectiveness_score: { type: Number, min: 0, max: 1 },
        times_applied: { type: Number, default: 0 }
    }],

    // Life narrative - key events and growth milestones
    life_narrative: {
        key_events: [{
            event: { type: String },
            date: { type: Date },
            emotional_impact: { type: String, enum: ['very_negative', 'negative', 'neutral', 'positive', 'very_positive'] },
            growth_noted: { type: String }
        }],
        recurring_themes: [{ type: String }],
        growth_milestones: [{
            milestone: { type: String },
            date: { type: Date, default: Date.now },
            description: { type: String }
        }]
    },

    // Memory anchors - key moments to reference in future conversations
    memory_anchors: [{
        moment: { type: String, required: true },
        date: { type: Date, default: Date.now },
        emotional_significance: { type: Number, min: 0, max: 1, default: 0.8 },
        context: { type: String },
        referenced_count: { type: Number, default: 0 }
    }],

    // Wellness trajectory predictions
    wellness_trajectory: {
        current_trend: { type: String, enum: ['improving', 'stable', 'declining', 'fluctuating'], default: 'stable' },
        burnout_risk: { type: Number, min: 0, max: 1, default: 0.3 },
        last_prediction_date: { type: Date },
        predicted_mood_next_week: { type: String },
        warning_signs_active: [{ type: String }]
    },

    // Statistics
    stats: {
        total_sessions: { type: Number, default: 0 },
        total_messages: { type: Number, default: 0 },
        average_session_length: { type: Number, default: 0 }, // in minutes
        crisis_interventions: { type: Number, default: 0 },
        positive_sessions_percentage: { type: Number, default: 0 }
    },

    // Preferences for AI interaction
    ai_preferences: {
        response_length: { type: String, enum: ['brief', 'moderate', 'detailed'], default: 'moderate' },
        preferred_language: { type: String, default: 'en' },
        include_statistics: { type: Boolean, default: true },
        include_exercises: { type: Boolean, default: true }
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    lastInteraction: { type: Date, default: Date.now }
});

// Update timestamp on save
cognitiveProfileSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Method to add emotional pattern
cognitiveProfileSchema.methods.addEmotionalPattern = function (mood, intensity, context, source = 'ai_detected') {
    this.emotional_patterns.push({ mood, intensity, context, source });
    // Keep only last 100 patterns
    if (this.emotional_patterns.length > 100) {
        this.emotional_patterns = this.emotional_patterns.slice(-100);
    }
    return this.save();
};

// Method to add trigger
cognitiveProfileSchema.methods.addTrigger = function (trigger, severity = 5, frequency = 'occasional') {
    const existing = this.triggers.find(t => t.trigger.toLowerCase() === trigger.toLowerCase());
    if (existing) {
        existing.severity = Math.max(existing.severity, severity);
        existing.frequency = frequency;
    } else {
        this.triggers.push({ trigger, severity, frequency });
    }
    return this.save();
};

// Method to update intervention effectiveness
cognitiveProfileSchema.methods.updateIntervention = function (intervention, wasEffective) {
    const existing = this.effective_interventions.find(
        i => i.intervention.toLowerCase() === intervention.toLowerCase()
    );
    if (existing) {
        existing.times_used++;
        existing.last_used = new Date();
        // Update success rate with weighted average
        existing.success_rate = (existing.success_rate * (existing.times_used - 1) + (wasEffective ? 1 : 0)) / existing.times_used;
    } else {
        this.effective_interventions.push({
            intervention,
            success_rate: wasEffective ? 1 : 0,
            times_used: 1,
            last_used: new Date()
        });
    }
    return this.save();
};

// Method to get recent emotional trajectory
cognitiveProfileSchema.methods.getEmotionalTrajectory = function (days = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.emotional_patterns.filter(p => p.date >= cutoff);
};

// Method to get top effective interventions
cognitiveProfileSchema.methods.getTopInterventions = function (limit = 5) {
    return this.effective_interventions
        .filter(i => i.times_used >= 2) // Only those used at least twice
        .sort((a, b) => b.success_rate - a.success_rate)
        .slice(0, limit);
};

// Static method to find or create profile
cognitiveProfileSchema.statics.findOrCreateProfile = async function (userId) {
    let profile = await this.findOne({ userId });
    if (!profile) {
        profile = new this({ userId });
        await profile.save();
    }
    return profile;
};

// Index for efficient querying
cognitiveProfileSchema.index({ 'emotional_patterns.date': -1 });
cognitiveProfileSchema.index({ lastInteraction: -1 });

const CognitiveProfile = mongoose.model('CognitiveProfile', cognitiveProfileSchema);

module.exports = CognitiveProfile;
