require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testGeminiAlternative() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing in .env');
        return;
    }

    const modelName = 'gemini-1.5-flash';
    console.log(`Testing Gemini API (Alternative SDK) with model: ${modelName}`);

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: modelName });

        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API Response:', text);
    } catch (error) {
        console.error('❌ Gemini API Error:', error.message);
        if (error.status) console.error('Status Code:', error.status);
    }
}

testGeminiAlternative();
