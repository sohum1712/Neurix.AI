require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

async function testGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing in .env');
        return;
    }

    const modelName = 'gemini-pro';
    console.log(`Testing Gemini API with model: ${modelName}`);

    try {
        const genai = new GoogleGenAI({ apiKey });
        const response = await genai.models.generateContent({
            model: modelName,
            contents: [{ role: 'user', parts: [{ text: 'Hello, are you working?' }] }]
        });

        console.log('✅ Gemini API Response:', response.text);
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        if (error.status) console.error('Status Code:', error.status);
    }
}

testGemini();
