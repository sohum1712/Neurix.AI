require('dotenv').config();

async function testGeminiDirect() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY is missing');
        return;
    }

    console.log('Testing Gemini API with direct HTTP call...');
    console.log('API Key (first 10 chars):', apiKey.substring(0, 10) + '...');

    // Test listing available models first
    try {
        const listResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
        );
        const listData = await listResponse.json();

        if (listData.error) {
            console.error('❌ List Models Error:', listData.error.message);
            console.error('Status:', listData.error.status);
            return;
        }

        console.log('\n✅ Available Models:');
        listData.models?.forEach(model => {
            if (model.name.includes('gemini')) {
                console.log(`  - ${model.name} (${model.displayName})`);
            }
        });

        // Now test generating content with a working model
        const modelName = 'gemini-1.5-flash';
        console.log(`\nTesting content generation with ${modelName}...`);

        const genResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: 'Hello, are you working?' }] }]
                })
            }
        );

        const genData = await genResponse.json();

        if (genData.error) {
            console.error('❌ Generate Error:', genData.error.message);
        } else {
            console.log('✅ Generation successful!');
            console.log('Response:', genData.candidates?.[0]?.content?.parts?.[0]?.text?.substring(0, 100) + '...');
        }

    } catch (error) {
        console.error('❌ Network Error:', error.message);
    }
}

testGeminiDirect();
