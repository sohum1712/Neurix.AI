/**
 * Enhanced Universal Chatbot with Gemini 3
 * Features: Emotion Analysis, Crisis Detection, Therapy Adaptation, 
 * Explainable AI, Profile Updates, Session Management
 */

const express = require('express');
const router = express.Router();
const geminiService = require('./services/geminiService');
const multiAgentOrchestrator = require('./services/multiAgentOrchestrator');
const explainableAI = require('./services/explainableAI');
const profileIntelligence = require('./services/profileIntelligence');
const narrativeEngine = require('./services/narrativeEngine');
const CognitiveProfile = require('./models/CognitiveProfile');
const Session = require('./models/Session');
const { optionalAuth, validateAuth } = require('./middleware/validateAuth');

// In-memory conversation store (per session)
const conversationStore = new Map();

// Grounding exercises for crisis situations
const GROUNDING_EXERCISES = [
  {
    name: "5-4-3-2-1 Grounding",
    instructions: "Notice 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste."
  },
  {
    name: "Box Breathing",
    instructions: "Breathe in for 4 counts, hold for 4 counts, breathe out for 4 counts, hold for 4 counts. Repeat 4 times."
  },
  {
    name: "Body Scan",
    instructions: "Starting from your toes, slowly notice each part of your body. Move up to your head, releasing tension as you go."
  },
  {
    name: "Cold Water Grounding",
    instructions: "Hold ice cubes in your hands or splash cold water on your face. Focus on the sensation."
  }
];

// Indian helpline resources
const HELPLINE_RESOURCES = {
  india: {
    primary: {
      name: "Tele-MANAS",
      number: "14416",
      toll_free: "1800-891-4416",
      available: "24/7",
      website: "https://telemanas.mohfw.gov.in"
    },
    secondary: [
      { name: "iCall", number: "9152987821", hours: "Mon-Sat, 8am-10pm" },
      { name: "Vandrevala Foundation", number: "1860-2662-345", hours: "24/7" },
      { name: "NIMHANS", number: "080-46110007", hours: "24/7" }
    ]
  }
};

/**
 * Main chat endpoint with enhanced AI capabilities (Multi-Agent System)
 */
router.post('/chat', optionalAuth, async (req, res) => {
  try {
    const { message, sessionId, userId, useMultiAgent = true } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const userMessage = message.trim();
    const currentSessionId = sessionId || `session_${Date.now()}`;

    // Get or create conversation history
    if (!conversationStore.has(currentSessionId)) {
      conversationStore.set(currentSessionId, []);
    }
    const conversationHistory = conversationStore.get(currentSessionId);

    // Get user profile if userId provided
    let userProfile = null;
    if (userId) {
      try {
        userProfile = await CognitiveProfile.findOrCreateProfile(userId);
      } catch (err) {
        console.log('Could not load user profile:', err.message);
      }
    }

    // Step 1: Analyze Emotion (Enhanced)
    console.log('Step 1: Analyzing emotion...');
    let emotionAnalysis;
    try {
      emotionAnalysis = await geminiService.analyzeEmotion(userMessage, conversationHistory);
      console.log('Emotion:', emotionAnalysis.emotion, 'Intensity:', emotionAnalysis.intensity);
    } catch (err) {
      console.error('Emotion analysis failed:', err.message);
      emotionAnalysis = { emotion: 'neutral', intensity: 0.5, confidence: 0.3, reasoning: 'Analysis failed' };
    }

    // Step 2: Detect Crisis
    console.log('Step 2: Checking for crisis indicators...');
    let crisisAnalysis;
    try {
      crisisAnalysis = await geminiService.detectCrisis(userMessage, conversationHistory, emotionAnalysis);
      console.log('Risk Level:', crisisAnalysis.risk_level, 'Needs Intervention:', crisisAnalysis.needs_intervention);
    } catch (err) {
      console.error('Crisis detection failed:', err.message);
      crisisAnalysis = { needs_intervention: false, risk_level: 'low', show_helpline: false };
    }

    let finalReply, therapyStyle, multiAgentResult, explanation;

    // Step 3: Use Multi-Agent System or Traditional Flow
    if (useMultiAgent) {
      console.log('Step 3: Multi-Agent Processing...');
      
      // Run multi-agent system
      multiAgentResult = await multiAgentOrchestrator.processWithAllAgents(userMessage, {
        conversationHistory,
        emotion: emotionAnalysis,
        safety: crisisAnalysis,
        userProfile: userProfile ? {
          baseline_mood: userProfile.baseline_mood,
          triggers: userProfile.triggers.map(t => t.trigger),
          effective_interventions: userProfile.effective_interventions.map(i => i.intervention)
        } : null
      });

      finalReply = multiAgentResult.synthesis.finalResponse;
      therapyStyle = {
        recommended_style: multiAgentResult.synthesis.techniqueUsed,
        reasoning: `Multi-agent synthesis (${multiAgentResult.synthesis.primaryAgent} agent led)`
      };

      // Generate explanation
      explanation = await explainableAI.generateComprehensiveExplanation({
        userMessage,
        aiResponse: finalReply,
        emotion: emotionAnalysis,
        safety: crisisAnalysis,
        therapy: therapyStyle,
        multiAgent: multiAgentResult
      });

    } else {
      // Traditional flow
      console.log('Step 3: Selecting therapy style...');
      therapyStyle = await geminiService.selectTherapyStyle(conversationHistory, emotionAnalysis);
      console.log('Therapy Style:', therapyStyle.recommended_style);

      console.log('Step 4: Generating response...');
      const chatResponse = await geminiService.generateChatResponse(userMessage, {
        conversationHistory,
        emotionAnalysis,
        crisisAnalysis,
        userProfile,
        therapyStyle: therapyStyle.recommended_style
      });

      finalReply = chatResponse.reply;

      // Self-critique for high-risk situations
      if (crisisAnalysis.risk_level !== 'low') {
        console.log('Step 5: Self-critiquing response...');
        const critiqueResult = await geminiService.critiqueAndImprove(
          chatResponse.reply,
          userMessage,
          { emotionAnalysis, crisisAnalysis }
        );
        finalReply = critiqueResult.finalResponse;
      }
    }

    // Update conversation history
    conversationHistory.push({ role: 'user', text: userMessage, timestamp: Date.now() });
    conversationHistory.push({ role: 'assistant', text: finalReply, timestamp: Date.now() });

    // Keep only last 20 messages
    if (conversationHistory.length > 20) {
      conversationStore.set(currentSessionId, conversationHistory.slice(-20));
    }

    // Update user profile (async, don't wait)
    if (userProfile && userId) {
      updateUserProfileAsync(userId, userMessage, finalReply, emotionAnalysis, crisisAnalysis);
    }

    // Build response with all metadata
    const response = {
      reply: finalReply,
      sessionId: currentSessionId,

      // Emotion analysis (Enhanced)
      emotion: {
        detected: emotionAnalysis.emotion,
        intensity: emotionAnalysis.intensity,
        confidence: emotionAnalysis.confidence,
        secondary: emotionAnalysis.secondary_emotions || [],
        trajectory: emotionAnalysis.emotional_trajectory,
        complexity: emotionAnalysis.emotional_complexity,
        suppression_detected: emotionAnalysis.suppression_detected,
        authenticity: emotionAnalysis.authenticity_score
      },

      // Safety information
      safety: {
        risk_level: crisisAnalysis.risk_level,
        needs_intervention: crisisAnalysis.needs_intervention,
        intervention_type: crisisAnalysis.intervention_type
      },

      // Therapy context
      therapy: {
        style_used: therapyStyle.recommended_style,
        reasoning: therapyStyle.reasoning
      },

      // Follow-up suggestions
      suggestions: {
        followups: generateFollowUpPrompts(emotionAnalysis, crisisAnalysis),
        resources: crisisAnalysis.show_helpline ? HELPLINE_RESOURCES.india : null
      },

      // Multi-agent insights (if used)
      multiAgent: multiAgentResult ? {
        used: true,
        processingTime: multiAgentResult.processingTime,
        agentInsights: multiAgentOrchestrator.getAgentInsights(multiAgentResult),
        confidence: multiAgentResult.synthesis.confidence
      } : { used: false },

      // Explainability
      explanation: explanation || null
    };

    // Add crisis-specific data if needed
    if (crisisAnalysis.needs_intervention) {
      response.crisis = {
        show_helpline: crisisAnalysis.show_helpline,
        helplines: HELPLINE_RESOURCES.india,
        grounding_exercise: crisisAnalysis.grounding_exercise_needed
          ? GROUNDING_EXERCISES[Math.floor(Math.random() * GROUNDING_EXERCISES.length)]
          : null,
        message_tone: crisisAnalysis.suggested_response_tone
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Enhanced chatbot error:', error);
    res.status(500).json({
      error: 'Failed to process your message. Please try again.',
      details: error.message,
      reply: "I'm here for you. Sometimes I need a moment to think. Could you try again?"
    });
  }
});

/**
 * Chat endpoint with full explanation (Explainable AI)
 */
router.post('/chat/explained', optionalAuth, async (req, res) => {
  try {
    const { message, sessionId } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({ error: 'Message is required' });
    }

    const currentSessionId = sessionId || `session_${Date.now()}`;

    if (!conversationStore.has(currentSessionId)) {
      conversationStore.set(currentSessionId, []);
    }
    const conversationHistory = conversationStore.get(currentSessionId);

    // Get explained response
    const explainedResponse = await geminiService.generateExplainedResponse(
      message.trim(),
      conversationHistory
    );

    // Update conversation history
    conversationHistory.push({ role: 'user', text: message.trim(), timestamp: Date.now() });
    conversationHistory.push({ role: 'assistant', text: explainedResponse.reply, timestamp: Date.now() });

    res.json({
      reply: explainedResponse.reply,
      sessionId: currentSessionId,
      explanation: explainedResponse.explanation
    });

  } catch (error) {
    console.error('Explained chat error:', error);
    res.status(500).json({
      error: 'Failed to generate explained response',
      details: error.message
    });
  }
});

/**
 * End session and get summary
 */
router.post('/session/end', optionalAuth, async (req, res) => {
  try {
    const { sessionId, userId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const conversationHistory = conversationStore.get(sessionId);
    if (!conversationHistory || conversationHistory.length === 0) {
      return res.json({
        summary: null,
        message: 'No conversation history found for this session'
      });
    }

    // Generate transcript
    const transcript = conversationHistory
      .map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.text}`)
      .join('\n');

    // Generate summary
    const summary = await geminiService.generateSessionSummary(transcript);

    // Save session to database if userId provided
    if (userId) {
      try {
        const session = new Session({
          userId,
          type: 'chat',
          status: 'completed',
          messages: conversationHistory,
          summary: {
            overview: summary.summary,
            emotional_journey: summary.emotional_journey,
            key_themes: summary.key_themes,
            breakthroughs: summary.breakthroughs,
            concerns: summary.concerns,
            recommended_focus_next: summary.recommended_focus_next,
            mood_at_start: summary.mood_at_start,
            mood_at_end: summary.mood_at_end,
            quality_score: summary.session_quality_score
          },
          endTime: new Date(),
          duration: Math.round((Date.now() - conversationHistory[0]?.timestamp) / 1000)
        });
        await session.save();

        // Update cognitive profile with session snapshot
        const profile = await CognitiveProfile.findOrCreateProfile(userId);
        profile.session_snapshots.push({
          sessionId: session._id,
          mood_start: summary.mood_at_start,
          mood_end: summary.mood_at_end,
          key_themes: summary.key_themes,
          breakthroughs: summary.breakthroughs,
          concerns: summary.concerns
        });
        profile.stats.total_sessions++;
        profile.lastInteraction = new Date();
        await profile.save();
      } catch (dbError) {
        console.error('Error saving session:', dbError);
      }
    }

    // Clear conversation from memory
    conversationStore.delete(sessionId);

    res.json({
      summary,
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('Session end error:', error);
    res.status(500).json({
      error: 'Failed to end session',
      details: error.message
    });
  }
});

/**
 * Get emotion analysis for a message
 */
router.post('/analyze/emotion', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const analysis = await geminiService.analyzeEmotion(message, context || []);
    res.json(analysis);

  } catch (error) {
    console.error('Emotion analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze emotion',
      details: error.message
    });
  }
});

/**
 * Check for crisis indicators
 */
router.post('/analyze/crisis', async (req, res) => {
  try {
    const { message, context, emotion } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const analysis = await geminiService.detectCrisis(message, context || [], emotion);

    // Add helpline info if needed
    if (analysis.show_helpline) {
      analysis.helplines = HELPLINE_RESOURCES.india;
    }

    // Add grounding exercise if needed
    if (analysis.grounding_exercise_needed) {
      analysis.grounding_exercise = GROUNDING_EXERCISES[
        Math.floor(Math.random() * GROUNDING_EXERCISES.length)
      ];
    }

    res.json(analysis);

  } catch (error) {
    console.error('Crisis analysis error:', error);
    res.status(500).json({
      error: 'Failed to analyze for crisis',
      details: error.message
    });
  }
});

/**
 * Generate wellness plan
 */
router.post('/wellness-plan/generate', validateAuth, async (req, res) => {
  try {
    const { userId, duration = 7, goals, concerns } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Get user profile
    let profile = await CognitiveProfile.findOrCreateProfile(userId);

    // Enhance profile with request data
    const planProfile = {
      baseline_mood: profile.baseline_mood,
      triggers: profile.triggers.map(t => t.trigger),
      effective_interventions: profile.effective_interventions.map(i => i.intervention),
      goals: goals || profile.goals.map(g => g.goal),
      primary_concerns: concerns || profile.primary_concerns.map(c => c.concern)
    };

    // Generate plan
    const plan = await geminiService.generateWellnessPlan(planProfile, duration);

    res.json({
      plan,
      message: 'Wellness plan generated successfully'
    });

  } catch (error) {
    console.error('Wellness plan generation error:', error);
    res.status(500).json({
      error: 'Failed to generate wellness plan',
      details: error.message
    });
  }
});

/**
 * Get wellness trajectory prediction
 */
router.post('/wellness/trajectory', validateAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const profile = await CognitiveProfile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // Get emotional history
    const emotionalHistory = profile.getEmotionalTrajectory(30);

    // Predict trajectory
    const prediction = await geminiService.predictWellnessTrajectory(
      emotionalHistory,
      {
        baseline_mood: profile.baseline_mood,
        triggers: profile.triggers,
        primary_concerns: profile.primary_concerns
      }
    );

    // Update profile with prediction
    profile.wellness_trajectory = {
      current_trend: prediction.trend,
      burnout_risk: prediction.burnout_risk,
      last_prediction_date: new Date(),
      predicted_mood_next_week: prediction.predicted_mood_7_days,
      warning_signs_active: prediction.warning_signs
    };
    await profile.save();

    res.json(prediction);

  } catch (error) {
    console.error('Trajectory prediction error:', error);
    res.status(500).json({
      error: 'Failed to predict trajectory',
      details: error.message
    });
  }
});

/**
 * Translate with emotion preservation
 */
router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage, sourceLanguage } = req.body;

    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Text and target language are required' });
    }

    const translation = await geminiService.translateWithEmotion(
      text,
      targetLanguage,
      sourceLanguage || 'auto'
    );

    res.json(translation);

  } catch (error) {
    console.error('Translation error:', error);
    res.status(500).json({
      error: 'Failed to translate',
      details: error.message
    });
  }
});

// ============ HELPER FUNCTIONS ============

/**
 * Generate follow-up prompts based on analysis
 */
function generateFollowUpPrompts(emotionAnalysis, crisisAnalysis) {
  const prompts = [];

  if (crisisAnalysis.risk_level === 'high' || crisisAnalysis.risk_level === 'crisis') {
    prompts.push("Would you like me to share some grounding techniques?");
    prompts.push("Can I share some resources that might help?");
  } else if (emotionAnalysis.emotion === 'anxious') {
    prompts.push("Would a breathing exercise help right now?");
    prompts.push("Would you like to talk about what's making you anxious?");
  } else if (emotionAnalysis.emotion === 'sad') {
    prompts.push("Would you like to share more about how you're feeling?");
    prompts.push("What usually helps you feel a bit better?");
  } else if (emotionAnalysis.emotion === 'stressed') {
    prompts.push("What's the biggest source of stress right now?");
    prompts.push("Would you like some stress management tips?");
  } else {
    prompts.push("What else would you like to talk about?");
    prompts.push("How can I best support you today?");
  }

  return prompts.slice(0, 2);
}

/**
 * Update user profile asynchronously
 */
async function updateUserProfileAsync(userId, userMessage, aiResponse, emotionAnalysis, crisisAnalysis) {
  try {
    const profile = await CognitiveProfile.findOrCreateProfile(userId);

    // Add emotional pattern
    await profile.addEmotionalPattern(
      emotionAnalysis.emotion,
      emotionAnalysis.intensity,
      userMessage.substring(0, 100),
      'ai_detected'
    );

    // Update stats
    profile.stats.total_messages++;
    if (crisisAnalysis.risk_level === 'crisis') {
      profile.stats.crisis_interventions++;
    }
    profile.lastInteraction = new Date();

    // Request profile update suggestions from Gemini
    const conversationSnippet = `User: ${userMessage}\nAI: ${aiResponse}`;
    const suggestions = await geminiService.suggestProfileUpdates(conversationSnippet, {
      baseline_mood: profile.baseline_mood,
      triggers: profile.triggers,
      effective_interventions: profile.effective_interventions
    });

    if (suggestions) {
      // Add new triggers
      if (suggestions.new_triggers_identified) {
        for (const trigger of suggestions.new_triggers_identified) {
          if (trigger && trigger.length > 0) {
            await profile.addTrigger(trigger, 5, 'occasional');
          }
        }
      }

      // Add new effective interventions
      if (suggestions.new_effective_interventions) {
        for (const intervention of suggestions.new_effective_interventions) {
          if (intervention && intervention.length > 0) {
            await profile.updateIntervention(intervention, true);
          }
        }
      }
    }

    await profile.save();

  } catch (error) {
    console.error('Profile update error:', error);
  }
}

/**
 * Get profile insights (NEW)
 */
router.post('/profile/insights', validateAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const insights = await profileIntelligence.getProfileInsights(userId);
    res.json(insights);

  } catch (error) {
    console.error('Profile insights error:', error);
    res.status(500).json({
      error: 'Failed to get profile insights',
      details: error.message
    });
  }
});

/**
 * Compare to history (NEW)
 */
router.post('/profile/compare-history', validateAuth, async (req, res) => {
  try {
    const { userId, timeframe = 30 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const comparison = await profileIntelligence.compareToHistory(userId, timeframe);
    res.json(comparison);

  } catch (error) {
    console.error('History comparison error:', error);
    res.status(500).json({
      error: 'Failed to compare history',
      details: error.message
    });
  }
});

/**
 * Detect recurring patterns (NEW)
 */
router.post('/profile/patterns', validateAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const patterns = await profileIntelligence.detectRecurringPatterns(userId);
    res.json(patterns);

  } catch (error) {
    console.error('Pattern detection error:', error);
    res.status(500).json({
      error: 'Failed to detect patterns',
      details: error.message
    });
  }
});

/**
 * Get explanation for response (NEW)
 */
router.post('/explain/response', async (req, res) => {
  try {
    const { response, context } = req.body;

    if (!response) {
      return res.status(400).json({ error: 'Response is required' });
    }

    const explanation = await explainableAI.explainResponse(response, context);
    res.json(explanation);

  } catch (error) {
    console.error('Explanation error:', error);
    res.status(500).json({
      error: 'Failed to generate explanation',
      details: error.message
    });
  }
});

/**
 * Generate life narrative (NEW)
 */
router.post('/narrative/generate', validateAuth, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const narrative = await narrativeEngine.generateLifeNarrative(userId);
    res.json(narrative);

  } catch (error) {
    console.error('Narrative generation error:', error);
    res.status(500).json({
      error: 'Failed to generate narrative',
      details: error.message
    });
  }
});

/**
 * Detect recurring patterns (Enhanced)
 */
router.post('/narrative/patterns', validateAuth, async (req, res) => {
  try {
    const { userId, days = 60 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const patterns = await narrativeEngine.detectRecurringPatterns(userId, days);
    res.json(patterns);

  } catch (error) {
    console.error('Pattern detection error:', error);
    res.status(500).json({
      error: 'Failed to detect patterns',
      details: error.message
    });
  }
});

/**
 * Compare to history with narrative (Enhanced)
 */
router.post('/narrative/compare', validateAuth, async (req, res) => {
  try {
    const { userId, timeframe = 30 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const comparison = await narrativeEngine.compareToHistory(userId, timeframe);
    res.json(comparison);

  } catch (error) {
    console.error('History comparison error:', error);
    res.status(500).json({
      error: 'Failed to compare history',
      details: error.message
    });
  }
});

/**
 * Add memory anchor (NEW)
 */
router.post('/narrative/memory-anchor', validateAuth, async (req, res) => {
  try {
    const { userId, moment, context, emotionalSignificance } = req.body;

    if (!userId || !moment) {
      return res.status(400).json({ error: 'User ID and moment are required' });
    }

    const result = await narrativeEngine.addMemoryAnchor(userId, moment, context, emotionalSignificance);
    res.json(result);

  } catch (error) {
    console.error('Memory anchor error:', error);
    res.status(500).json({
      error: 'Failed to add memory anchor',
      details: error.message
    });
  }
});

/**
 * Get relevant memories (NEW)
 */
router.post('/narrative/memories', validateAuth, async (req, res) => {
  try {
    const { userId, currentEmotion, limit = 3 } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const memories = await narrativeEngine.getRelevantMemories(userId, currentEmotion, limit);
    res.json({ memories });

  } catch (error) {
    console.error('Get memories error:', error);
    res.status(500).json({
      error: 'Failed to get memories',
      details: error.message
    });
  }
});

module.exports = router;
