require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function listGeminiModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }

    // Try listing models via REST if SDK method is tricky, but let's try raw fetch first to be sure
    // Or just try specific common models

    const modelsToTest = [
        'gemini-1.5-flash',
        'gemini-1.5-flash-001',
        'gemini-1.5-pro',
        'gemini-1.5-pro-001',
        'gemini-pro',
        'gemini-1.0-pro',
        'gemini-2.0-flash-exp'
    ];

    const genAI = new GoogleGenerativeAI(apiKey);

    console.log('Testing models...');

    for (const modelName of modelsToTest) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hi");
            console.log(`✅ SUCCESS: ${modelName}`);
            return; // Found one!
        } catch (e) {
            console.log(`❌ FAILED: ${modelName} - ${e.message.split(' ')[0]}...`);
        }
    }
}

listGeminiModels();
