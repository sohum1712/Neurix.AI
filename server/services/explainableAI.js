/**
 * Explainable AI Service
 * Provides transparency into AI decision-making
 * "Why did the AI say this?"
 * 
 * Uses direct HTTP calls via geminiHelper for reliability
 */

const { generateContent, parseJSON } = require('../utils/geminiHelper');

class ExplainableAI {
    /**
     * Generate explanation for AI response
     */
    async explainResponse(response, context = {}) {
        try {
            const prompt = `Explain why this AI response was generated in simple, transparent terms.

AI Response: "${response}"

Context:
- User Message: "${context.userMessage || 'N/A'}"
- Detected Emotion: ${context.emotion?.detected || 'unknown'}
- Risk Level: ${context.safety?.risk_level || 'low'}
- Therapy Style: ${context.therapy?.style_used || 'supportive'}

Return ONLY valid JSON:
{
  "reasoning": "why this specific response (1-2 sentences)",
  "therapy_approach": "what therapeutic approach was used",
  "key_considerations": ["consideration1", "consideration2"],
  "alternative_approaches": ["approach1", "approach2"],
  "confidence_level": 0.0-1.0,
  "safety_factors": ["factor1"]
}`;

            const text = await generateContent(prompt, {
                temperature: 0.5,
                maxOutputTokens: 400,
                callId: 'explainResponse'
            });

            const explanation = parseJSON(text);
            return explanation || this.getDefaultExplanation(context);
        } catch (error) {
            console.error('Explanation generation error:', error);
            return this.getDefaultExplanation(context);
        }
    }

    /**
     * Get default explanation if generation fails
     */
    getDefaultExplanation(context) {
        const style = context.therapy?.style_used || 'supportive';
        const emotion = context.emotion?.detected || 'neutral';

        return {
            reasoning: `I used ${style} listening to respond to your ${emotion} state.`,
            therapy_approach: style,
            key_considerations: ['Emotional safety', 'Empathetic response'],
            alternative_approaches: ['CBT', 'Mindfulness'],
            confidence_level: 0.7,
            safety_factors: ['Non-judgmental tone', 'Validation']
        };
    }

    /**
     * Explain emotion detection
     */
    async explainEmotionDetection(userMessage, emotionResult) {
        try {
            const prompt = `Explain how you detected this emotion from the user's message.

User Message: "${userMessage}"
Detected Emotion: ${emotionResult.emotion}
Intensity: ${emotionResult.intensity}
Confidence: ${emotionResult.confidence}

Return ONLY valid JSON:
{
  "explanation": "how emotion was detected (2-3 sentences)",
  "key_indicators": ["indicator1", "indicator2"],
  "tone_markers": ["marker1"],
  "context_clues": ["clue1"],
  "confidence_reasoning": "why this confidence level"
}`;

            const text = await generateContent(prompt, {
                temperature: 0.5,
                maxOutputTokens: 300,
                callId: 'explainEmotionDetection'
            });

            return parseJSON(text) || {
                explanation: `Detected ${emotionResult.emotion} based on language patterns and emotional cues.`,
                key_indicators: ['Word choice', 'Tone'],
                tone_markers: [],
                context_clues: [],
                confidence_reasoning: 'Based on clear emotional signals'
            };
        } catch (error) {
            console.error('Emotion explanation error:', error);
            return {
                explanation: `Detected ${emotionResult.emotion} from your message.`,
                key_indicators: [],
                tone_markers: [],
                context_clues: [],
                confidence_reasoning: 'Standard analysis'
            };
        }
    }

    /**
     * Explain risk assessment
     */
    explainRiskAssessment(riskResult) {
        const explanations = {
            low: {
                reasoning: "No immediate safety concerns detected. Your message indicates you're managing well.",
                factors: ['Stable emotional tone', 'No distress signals', 'Constructive language']
            },
            medium: {
                reasoning: "Some emotional distress detected, but no immediate crisis. I'm here to support you.",
                factors: ['Elevated stress indicators', 'Emotional intensity', 'Need for support']
            },
            high: {
                reasoning: "Significant distress detected. Your wellbeing is important, and I want to ensure you have support.",
                factors: ['High emotional intensity', 'Distress signals', 'Need for intervention']
            },
            crisis: {
                reasoning: "Critical safety concerns detected. Immediate support resources are being provided.",
                factors: ['Crisis indicators', 'Safety risk', 'Urgent intervention needed']
            }
        };

        const level = riskResult.risk_level || 'low';
        return {
            risk_level: level,
            reasoning: explanations[level].reasoning,
            factors_considered: explanations[level].factors,
            intervention_rationale: riskResult.intervention_needed
                ? 'Additional support recommended based on distress level'
                : 'Continued monitoring, no immediate intervention needed',
            confidence: riskResult.confidence || 0.7
        };
    }

    /**
     * Explain therapy style selection
     */
    explainTherapyStyle(style, context = {}) {
        const styleExplanations = {
            CBT: {
                name: 'Cognitive Behavioral Therapy',
                when: 'When addressing thought patterns and behaviors',
                approach: 'Focuses on identifying and changing negative thought patterns',
                benefits: ['Practical', 'Evidence-based', 'Action-oriented']
            },
            supportive: {
                name: 'Supportive Listening',
                when: 'When you need empathy and validation',
                approach: 'Provides emotional support and validation without judgment',
                benefits: ['Empathetic', 'Non-judgmental', 'Validating']
            },
            mindfulness: {
                name: 'Mindfulness-Based',
                when: 'When managing stress or anxiety',
                approach: 'Encourages present-moment awareness and acceptance',
                benefits: ['Calming', 'Grounding', 'Stress-reducing']
            },
            motivational: {
                name: 'Motivational Coaching',
                when: 'When working toward goals or change',
                approach: 'Encourages self-efficacy and positive change',
                benefits: ['Empowering', 'Goal-focused', 'Encouraging']
            }
        };

        const explanation = styleExplanations[style] || styleExplanations.supportive;

        return {
            style_name: explanation.name,
            why_chosen: explanation.when,
            approach_description: explanation.approach,
            benefits: explanation.benefits,
            context_factors: [
                context.emotion?.detected ? `Your ${context.emotion.detected} state` : null,
                context.safety?.risk_level !== 'low' ? 'Safety considerations' : null,
                'Your conversation history'
            ].filter(Boolean)
        };
    }

    /**
     * Generate comprehensive explanation for entire interaction
     */
    async generateComprehensiveExplanation(interaction) {
        const {
            userMessage,
            aiResponse,
            emotion,
            safety,
            therapy,
            multiAgent
        } = interaction;

        const [
            responseExplanation,
            emotionExplanation,
            riskExplanation,
            styleExplanation
        ] = await Promise.all([
            this.explainResponse(aiResponse, { userMessage, emotion, safety, therapy }),
            emotion ? this.explainEmotionDetection(userMessage, emotion) : null,
            safety ? Promise.resolve(this.explainRiskAssessment(safety)) : null,
            therapy ? Promise.resolve(this.explainTherapyStyle(therapy.style_used, { emotion, safety })) : null
        ]);

        return {
            response: responseExplanation,
            emotion: emotionExplanation,
            risk: riskExplanation,
            therapy_style: styleExplanation,
            multi_agent: multiAgent ? this.explainMultiAgent(multiAgent) : null,
            timestamp: new Date()
        };
    }

    /**
     * Explain multi-agent contributions
     */
    explainMultiAgent(multiAgentResult) {
        const { agents, synthesis } = multiAgentResult;

        return {
            primary_agent: synthesis.primaryAgent,
            explanation: `The ${synthesis.primaryAgent} agent led this response.`,
            agent_contributions: {
                therapist: {
                    contributed: agents.therapist.success,
                    role: 'Provided emotional support and therapeutic guidance',
                    confidence: agents.therapist.data.confidence
                },
                risk: {
                    contributed: agents.risk.success,
                    role: 'Assessed safety and determined intervention needs',
                    confidence: agents.risk.data.confidence
                },
                planner: {
                    contributed: agents.planner.success,
                    role: 'Suggested practical actions and coping strategies',
                    confidence: agents.planner.data.confidence
                },
                ethics: {
                    contributed: agents.ethics.success,
                    role: 'Verified response safety and appropriateness',
                    confidence: agents.ethics.data.confidence
                }
            },
            synthesis_confidence: synthesis.confidence
        };
    }
}

module.exports = new ExplainableAI();
