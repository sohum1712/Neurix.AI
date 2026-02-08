/**
 * WellnessPlan Model - AI-Generated Personalized Wellness Plans
 * Stores and tracks user wellness plans with daily activities
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    activity: { type: String, required: true },
    duration: { type: String }, // e.g., "5 min", "10 min"
    instructions: { type: String },
    completed: { type: Boolean, default: false },
    completed_at: { type: Date },
    user_notes: { type: String },
    effectiveness_rating: { type: Number, min: 1, max: 5 }
});

const daySchema = new mongoose.Schema({
    day: { type: Number, required: true },
    date: { type: Date },
    theme: { type: String },

    morning: activitySchema,
    afternoon: activitySchema,
    evening: activitySchema,

    journal_prompt: { type: String },
    journal_entry: { type: String },

    // Daily completion tracking
    completed: { type: Boolean, default: false },
    completion_percentage: { type: Number, min: 0, max: 100, default: 0 },
    mood_of_day: { type: String },
    reflection: { type: String }
});

const wellnessPlanSchema = new mongoose.Schema({
    // User reference
    userId: {
        type: String,
        required: true,
        index: true
    },

    // Plan details
    plan_name: { type: String, required: true },
    description: { type: String },
    duration_days: { type: Number, required: true },
    daily_time_commitment: { type: String },

    // Plan days
    days: [daySchema],

    // Goals and focus areas
    weekly_goal: { type: String },
    focus_areas: [{ type: String }],

    // Status
    status: {
        type: String,
        enum: ['active', 'completed', 'paused', 'abandoned'],
        default: 'active'
    },

    // Progress tracking
    progress: {
        current_day: { type: Number, default: 1 },
        days_completed: { type: Number, default: 0 },
        activities_completed: { type: Number, default: 0 },
        total_activities: { type: Number },
        completion_percentage: { type: Number, default: 0 },
        streak_days: { type: Number, default: 0 },
        longest_streak: { type: Number, default: 0 }
    },

    // AI-generated customization
    personalization: {
        based_on_triggers: [{ type: String }],
        based_on_goals: [{ type: String }],
        recommended_interventions: [{ type: String }],
        adjustment_notes: { type: String }
    },

    // Timing
    start_date: { type: Date },
    expected_end_date: { type: Date },
    actual_end_date: { type: Date },

    // Reward for completion
    reward_suggestion: { type: String },
    reward_claimed: { type: Boolean, default: false },

    // Tips and notes
    tips: [{ type: String }],
    user_notes: { type: String },

    // AI feedback on plan effectiveness
    ai_feedback: {
        effectiveness_score: { type: Number, min: 0, max: 1 },
        suggestions_for_next_plan: [{ type: String }],
        patterns_observed: [{ type: String }]
    },

    // User feedback
    user_feedback: {
        rating: { type: Number, min: 1, max: 5 },
        helpful: { type: Boolean },
        would_recommend: { type: Boolean },
        comments: { type: String }
    },

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
wellnessPlanSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate progress on save
wellnessPlanSchema.pre('save', function (next) {
    if (this.days && this.days.length > 0) {
        let activitiesCompleted = 0;
        let totalActivities = 0;
        let daysCompleted = 0;

        this.days.forEach(day => {
            // Count activities
            if (day.morning) { totalActivities++; if (day.morning.completed) activitiesCompleted++; }
            if (day.afternoon) { totalActivities++; if (day.afternoon.completed) activitiesCompleted++; }
            if (day.evening) { totalActivities++; if (day.evening.completed) activitiesCompleted++; }

            // Calculate day completion
            const dayActivities = [day.morning, day.afternoon, day.evening].filter(a => a);
            const dayCompletedActivities = dayActivities.filter(a => a.completed);
            day.completion_percentage = dayActivities.length > 0
                ? Math.round((dayCompletedActivities.length / dayActivities.length) * 100)
                : 0;
            day.completed = day.completion_percentage === 100;

            if (day.completed) daysCompleted++;
        });

        this.progress.activities_completed = activitiesCompleted;
        this.progress.total_activities = totalActivities;
        this.progress.days_completed = daysCompleted;
        this.progress.completion_percentage = totalActivities > 0
            ? Math.round((activitiesCompleted / totalActivities) * 100)
            : 0;

        // Update status if fully completed
        if (this.progress.completion_percentage === 100 && this.status === 'active') {
            this.status = 'completed';
            this.actual_end_date = new Date();
        }
    }
    next();
});

// Complete an activity
wellnessPlanSchema.methods.completeActivity = async function (dayNumber, period, notes = '', rating = null) {
    const day = this.days.find(d => d.day === dayNumber);
    if (!day || !day[period]) {
        throw new Error(`Activity not found for day ${dayNumber}, ${period}`);
    }

    day[period].completed = true;
    day[period].completed_at = new Date();
    if (notes) day[period].user_notes = notes;
    if (rating) day[period].effectiveness_rating = rating;

    // Update streak
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const wasActiveYesterday = this.days.some(d =>
        d.date && d.date.toDateString() === yesterday.toDateString() && d.completed
    );

    if (wasActiveYesterday) {
        this.progress.streak_days++;
        if (this.progress.streak_days > this.progress.longest_streak) {
            this.progress.longest_streak = this.progress.streak_days;
        }
    } else {
        this.progress.streak_days = 1;
    }

    return this.save();
};

// Add journal entry for a day
wellnessPlanSchema.methods.addJournalEntry = async function (dayNumber, entry, mood = null) {
    const day = this.days.find(d => d.day === dayNumber);
    if (!day) {
        throw new Error(`Day ${dayNumber} not found`);
    }

    day.journal_entry = entry;
    if (mood) day.mood_of_day = mood;

    return this.save();
};

// Start the plan
wellnessPlanSchema.methods.startPlan = async function () {
    this.start_date = new Date();
    this.expected_end_date = new Date();
    this.expected_end_date.setDate(this.expected_end_date.getDate() + this.duration_days);

    // Set dates for each day
    this.days.forEach((day, index) => {
        const dayDate = new Date(this.start_date);
        dayDate.setDate(dayDate.getDate() + index);
        day.date = dayDate;
    });

    return this.save();
};

// Pause the plan
wellnessPlanSchema.methods.pausePlan = async function () {
    this.status = 'paused';
    return this.save();
};

// Resume the plan
wellnessPlanSchema.methods.resumePlan = async function () {
    this.status = 'active';
    return this.save();
};

// Get today's activities
wellnessPlanSchema.methods.getTodayActivities = function () {
    const today = new Date().toDateString();
    return this.days.find(d => d.date && d.date.toDateString() === today) || null;
};

// Static method to get user's active plan
wellnessPlanSchema.statics.getActivePlan = function (userId) {
    return this.findOne({ userId, status: 'active' });
};

// Static method to get user's completed plans
wellnessPlanSchema.statics.getCompletedPlans = function (userId, limit = 5) {
    return this.find({ userId, status: 'completed' })
        .sort({ actual_end_date: -1 })
        .limit(limit);
};

// Indexes
wellnessPlanSchema.index({ userId: 1, status: 1 });
wellnessPlanSchema.index({ userId: 1, createdAt: -1 });

const WellnessPlan = mongoose.model('WellnessPlan', wellnessPlanSchema);

module.exports = WellnessPlan;
