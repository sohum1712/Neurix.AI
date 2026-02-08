/**
 * Gemini API Helper - Direct HTTP calls
 * Uses fetch() to call the Gemini API directly, bypassing SDK issues
 * 
 * This helper works with all Gemini models including 2.0+ versions
 */

const geminiLimiter = require('./geminiLimiter');

const API_KEY = process.env.GEMINI_API_KEY;
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

/**
 * Generate content using Gemini API via direct HTTP call
 * @param {string} prompt - The prompt text
 * @param {object} options - Optional configuration
 * @returns {Promise<string>} - The generated text
 */
async function generateContent(prompt, options = {}) {
    const {
        model = MODEL_NAME,
        temperature = 0.7,
        maxOutputTokens = 1000,
        systemInstruction = null,
        callId = 'unknown'
    } = options;

    // Build the request body
    const requestBody = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            temperature,
            maxOutputTokens
        }
    };

    // Add system instruction if provided
    if (systemInstruction) {
        requestBody.systemInstruction = { parts: [{ text: systemInstruction }] };
    }

    // Wrap with rate limiter
    return await geminiLimiter.schedule({ id: callId }, async () => {
        console.log(`🤖 Gemini API call (${callId}) - Model: ${model}`);

        const response = await fetch(
            `${BASE_URL}/models/${model}:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            }
        );

        const data = await response.json();

        if (data.error) {
            const error = new Error(data.error.message);
            error.status = data.error.code;
            throw error;
        }

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return text;
    });
}

/**
 * Parse JSON from AI response text
 * @param {string} text - Response text that may contain JSON
 * @returns {object|null} - Parsed JSON or null
 */
function parseJSON(text) {
    try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    } catch (e) {
        return null;
    }
}

module.exports = {
    generateContent,
    parseJSON,
    MODEL_NAME,
    API_KEY
};
