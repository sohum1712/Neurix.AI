/**
 * Gemini Service - HARD RATE LIMITED (NON-NEGOTIABLE)
 * Using Bottleneck to prevent ALL concurrent calls
 * 
 * CRITICAL: Every Gemini API call MUST go through geminiLimiter.schedule()
 * Even ONE unwrapped call will cause 429 errors
 */

const { GoogleGenAI } = require('@google/genai');
const geminiLimiter = require('../utils/geminiLimiter');

// Initialize client
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
    console.error('CRITICAL: GEMINI_API_KEY is missing');
    process.exit(1);
}

const genai = new GoogleGenAI({ apiKey });
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3-flash-preview';

console.log(`🤖 Gemini Service: HARD rate limiting enabled (${MODEL_NAME})`);
console.log('⚙️  Max: 1 request every 2 seconds (30/min guaranteed)');

// Response cache
const responseCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

function getCacheKey(prompt, system) {
    return `${system || 'default'}_${prompt.substring(0, 100)}`;
}

/**
 * CRITICAL: ALL Gemini calls MUST use this function
 * This wraps the call with Bottleneck limiter
 */
async function generateContent(prompt, systemInstruction = null, useCache = true, callId = 'unknown') {
    // Check cache first
    if (useCache) {
        const key = getCacheKey(prompt, systemInstruction);
        const cached = responseCache.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            console.log(`✅ Cache hit (${callId})`);
            return cached.response;
        }
    }

    // CRITICAL: Wrap with Bottleneck limiter
    const text = await geminiLimiter.schedule({ id: callId }, async () => {
        console.log(`🤖 Gemini API call (${callId})`);
        
        let fullPrompt = systemInstruction ? `${systemInstruction}\n\n${prompt}` : prompt;
        
        const response = await genai.models.generateContent({
            model: MODEL_NAME,
            contents: [{ role: 'user', parts: [{ text: fullPrompt }] }]
        });

        return response.text;
    });

    // Cache the response
    if (useCache) {
        const key = getCacheKey(prompt, systemInstruction);
        responseCache.set(key, { response: text, timestamp: Date.now() });
        if (responseCache.size > 100) {
            const oldestKey = responseCache.keys().next().value;
            responseCache.delete(oldestKey);
        }
    }

    return text;
}

// System prompts
const SYSTEM_PROMPTS = {
    chatCompanion: `You are a compassionate mental health companion. Be supportive, concise (2-3 sentences), and never provide medical advice.`,
    emotionAnalyzer: `Analyze emotion. Return JSON: {"emotion":"anxious|sad|calm|stressed|neutral|happy","intensity":0-1,"confidence":0-1,"reasoning":"why"}`,
    crisisDetector: `Detect crisis. Return JSON: {"needs_intervention":boolean,"risk_level":"low|medium|high|crisis","show_helpline":boolean}`,
    sessionSummarizer: `Summarize session. Return JSON: {"summary":"text","key_themes":[],"mood_at_start":"mood","mood_at_end":"mood"}`,
    wellnessPlanGenerator: `Create 7-day wellness plan. Return JSON with plan_name, days array, tips.`,
    therapyStyleSelector: `Select therapy style. Return JSON: {"recommended_style":"CBT|supportive|mindfulness","reasoning":"why"}`,
    responseCritic: `Review response. Return JSON: {"is_safe":boolean,"improvement_needed":boolean,"improved_response":"text"}`,
    wellnessTrajectory: `Predict trajectory. Return JSON: {"trend":"improving|stable|declining","burnout_risk":0-1,"predicted_mood_7_days":"mood"}`,
    profileUpdate: `Suggest updates. Return JSON: {"new_triggers_identified":[],"new_effective_interventions":[]}`,
    translation: `Translate preserving emotion. Return JSON: {"translation":"text","emotional_fidelity":0-1}`
};

function parseJSON(text) {
    try {
        const match = text.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    } catch (e) {
        return null;
    }
}

async function analyzeEmotion(userMessage, conversationHistory = []) {
    try {
        const history = conversationHistory.slice(-5).map(m => `${m.role}: ${m.text}`).join('\n');
        const prompt = `History:\n${history}\n\nMessage: "${userMessage}"\n\nAnalyze emotion JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.emotionAnalyzer, true, 'analyzeEmotion');
        return parseJSON(text) || { emotion: 'neutral', intensity: 0.5, confidence: 0.5, reasoning: 'Default' };
    } catch (error) {
        console.error('Emotion analysis error:', error.message);
        return { emotion: 'neutral', intensity: 0.5, confidence: 0.3, reasoning: 'Error' };
    }
}

async function detectCrisis(userMessage, conversationHistory = [], emotionAnalysis = null) {
    try {
        const prompt = `Message: "${userMessage}"\nEmotion: ${JSON.stringify(emotionAnalysis)}\n\nDetect crisis JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.crisisDetector, false, 'detectCrisis');
        return parseJSON(text) || { needs_intervention: false, risk_level: 'low', show_helpline: false };
    } catch (error) {
        console.error('Crisis detection error:', error.message);
        return { needs_intervention: false, risk_level: 'low', show_helpline: false };
    }
}

async function generateChatResponse(userMessage, { conversationHistory = [], emotionAnalysis = null, crisisAnalysis = null, userProfile = null, therapyStyle = 'supportive' }) {
    try {
        let system = SYSTEM_PROMPTS.chatCompanion;
        system += `\nTherapy Style: ${therapyStyle}`;
        if (crisisAnalysis?.needs_intervention) system += `\nCRITICAL: User in distress (${crisisAnalysis.risk_level})`;

        const history = conversationHistory.slice(-10).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.text}`).join('\n');
        const prompt = `${system}\n\nHistory:\n${history}\n\nUser: ${userMessage}\n\nAssistant:`;

        // CRITICAL: Use limiter for chat response
        const text = await geminiLimiter.schedule({ id: 'generateChatResponse' }, async () => {
            console.log(`🤖 Gemini API call (generateChatResponse)`);
            const response = await genai.models.generateContent({
                model: MODEL_NAME,
                contents: [{ role: 'user', parts: [{ text: prompt }] }]
            });
            return response.text;
        });

        return { reply: text, therapyStyleUsed: therapyStyle };
    } catch (error) {
        console.error('Chat error:', error.message);
        if (error.status === 429 || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
            return { reply: "I'm receiving too many messages. Please give me a moment 🌸", therapyStyleUsed: 'supportive' };
        }
        return { reply: "I'm here for you. Could you try again?", therapyStyleUsed: 'supportive' };
    }
}

async function generateExplainedResponse(userMessage, conversationHistory = []) {
    return { reply: "I understand.", explanation: { reasoning: "Simple acknowledgement" } };
}

async function selectTherapyStyle(conversationHistory = [], emotionAnalysis = null) {
    try {
        const prompt = `History: ${conversationHistory.length} msgs. Emotion: ${JSON.stringify(emotionAnalysis)}. Select style JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.therapyStyleSelector, true, 'selectTherapyStyle');
        return parseJSON(text) || { recommended_style: 'supportive', reasoning: 'Default' };
    } catch (e) {
        return { recommended_style: 'supportive', reasoning: 'Error' };
    }
}

async function generateSessionSummary(sessionTranscript, previousSessions = []) {
    try {
        const prompt = `Transcript: ${sessionTranscript}. Generate summary JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.sessionSummarizer, false, 'generateSessionSummary');
        return parseJSON(text) || { summary: "Session recorded." };
    } catch (e) {
        return { summary: "Summary generation failed." };
    }
}

async function generateWellnessPlan(userProfile, duration = 7) {
    try {
        const prompt = `Profile: ${JSON.stringify(userProfile)}. Duration: ${duration} days. Generate Plan JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.wellnessPlanGenerator, false, 'generateWellnessPlan');
        return parseJSON(text);
    } catch (e) {
        throw e;
    }
}

async function predictWellnessTrajectory(emotionalHistory, currentProfile) {
    try {
        const prompt = `History: ${JSON.stringify(emotionalHistory)}\nProfile: ${JSON.stringify(currentProfile)}\nPredict trajectory JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.wellnessTrajectory, false, 'predictWellnessTrajectory');
        return parseJSON(text) || { trend: 'stable', confidence: 0.5 };
    } catch (e) {
        return { trend: 'stable', confidence: 0.5 };
    }
}

async function critiqueAndImprove(originalResponse, userMessage, context = {}) {
    try {
        const prompt = `Message: "${userMessage}"\nResponse: "${originalResponse}"\nReview JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.responseCritic, false, 'critiqueAndImprove');
        const critique = parseJSON(text);
        if (critique && critique.improvement_needed) {
            return { finalResponse: critique.improved_response, critique };
        }
        return { finalResponse: originalResponse, critique };
    } catch (e) {
        return { finalResponse: originalResponse, critique: { error: e.message } };
    }
}

async function suggestProfileUpdates(conversationSnippet, currentProfile) {
    try {
        const prompt = `Profile: ${JSON.stringify(currentProfile)}\nConversation: ${conversationSnippet}\nSuggest updates JSON.`;
        const text = await generateContent(prompt, SYSTEM_PROMPTS.profileUpdate, false, 'suggestProfileUpdates');
        return parseJSON(text);
    } catch (e) {
        return null;
    }
}

async function translateWithEmotion(text, targetLanguage, sourceLanguage = 'auto') {
    try {
        const prompt = `Source: ${sourceLanguage}, Target: ${targetLanguage}\nText: "${text}"\nTranslate JSON.`;
        const text2 = await generateContent(prompt, SYSTEM_PROMPTS.translation, false, 'translateWithEmotion');
        return parseJSON(text2) || { translation: text };
    } catch (e) {
        return { translation: text, error: e.message };
    }
}

module.exports = {
    analyzeEmotion,
    detectCrisis,
    generateChatResponse,
    generateExplainedResponse,
    selectTherapyStyle,
    generateSessionSummary,
    generateWellnessPlan,
    predictWellnessTrajectory,
    critiqueAndImprove,
    suggestProfileUpdates,
    translateWithEmotion,
    SYSTEM_PROMPTS,
    geminiLimiter  // Export limiter for other services
};
