/**
 * Multi-Agent Reasoning System
 * Implements parallel AI reasoning with 4 specialized agents:
 * - Therapist Agent: Emotional support
 * - Risk Agent: Safety analysis
 * - Planner Agent: Action planning
 * - Ethics Agent: Tone & compliance
 * 
 * Uses direct HTTP calls for Gemini 2.0+ compatibility
 */

const { generateContent, parseJSON } = require('../utils/geminiHelper');

// Agent system prompts
const AGENT_PROMPTS = {
    therapist: `You are the Therapeutic Support Agent.
Focus: Emotional support, empathy, evidence-based therapeutic techniques.
Approach: CBT, supportive listening, mindfulness, motivational coaching.

Return ONLY valid JSON:
{
  "response": "therapeutic response (2-3 sentences)",
  "technique_used": "CBT|supportive|mindfulness|motivational",
  "emotional_validation": "how you validated their feelings",
  "confidence": 0.0-1.0,
  "follow_up_suggestion": "optional follow-up question"
}`,

    risk: `You are the Risk Assessment Agent.
Focus: Safety analysis, crisis detection, intervention planning.
Approach: Evidence-based risk evaluation, harm reduction.

Return ONLY valid JSON:
{
  "risk_level": "low|medium|high|crisis",
  "risk_factors": ["factor1", "factor2"],
  "protective_factors": ["factor1"],
  "intervention_needed": boolean,
  "intervention_type": "none|gentle_check|supportive|immediate|crisis",
  "confidence": 0.0-1.0,
  "reasoning": "brief explanation"
}`,

    planner: `You are the Action Planning Agent.
Focus: Practical steps, coping strategies, wellness activities.
Approach: Actionable, achievable, personalized recommendations.

Return ONLY valid JSON:
{
  "immediate_actions": ["action1", "action2"],
  "short_term_goals": ["goal1"],
  "coping_strategies": ["strategy1", "strategy2"],
  "resources_needed": ["resource1"],
  "confidence": 0.0-1.0,
  "priority": "low|medium|high"
}`,

    ethics: `You are the Ethics & Compliance Agent.
Focus: Response safety, bias detection, tone appropriateness.
Approach: Harm reduction, cultural sensitivity, professional boundaries.

Return ONLY valid JSON:
{
  "is_safe": boolean,
  "tone_appropriate": boolean,
  "biases_detected": ["bias1"],
  "concerns": ["concern1"],
  "improvements": ["improvement1"],
  "confidence": 0.0-1.0,
  "approval": "approved|needs_revision|rejected"
}`,
};

class MultiAgentOrchestrator {
    /**
     * Run a single agent
     */
    async runAgent(agentType, userMessage, context = {}) {
        try {
            const systemPrompt = AGENT_PROMPTS[agentType];
            if (!systemPrompt) throw new Error(`Unknown agent type: ${agentType}`);

            const prompt = `User Message: "${userMessage}"

Context:
- Conversation History: ${context.conversationHistory?.slice(-3).map(m => `${m.role}: ${m.text}`).join('\n') || 'None'}
- Current Emotion: ${context.emotion?.detected || 'unknown'}
- Emotion Intensity: ${context.emotion?.intensity || 0.5}
- User Profile: ${JSON.stringify(context.userProfile || {})}

Analyze and return JSON.`;

            const text = await generateContent(prompt, {
                systemInstruction: systemPrompt,
                temperature: 0.7,
                maxOutputTokens: 500,
                callId: `agent-${agentType}`
            });

            const result = parseJSON(text);

            return {
                agent: agentType,
                success: !!result,
                data: result || {},
                raw: text
            };
        } catch (error) {
            console.error(`${agentType} agent error:`, error.message);
            return {
                agent: agentType,
                success: false,
                error: error.message,
                data: this.getDefaultResponse(agentType)
            };
        }
    }

    /**
     * Get default response for failed agent
     */
    getDefaultResponse(agentType) {
        const defaults = {
            therapist: { response: "I'm here to listen.", technique_used: "supportive", confidence: 0.5 },
            risk: { risk_level: "low", intervention_needed: false, confidence: 0.5 },
            planner: { immediate_actions: [], confidence: 0.5 },
            ethics: { is_safe: true, tone_appropriate: true, approval: "approved", confidence: 0.5 }
        };
        return defaults[agentType] || {};
    }

    /**
     * Run all agents in parallel
     */
    async processWithAllAgents(userMessage, context = {}) {
        console.log('🤖 Multi-Agent System: Processing message...');
        const startTime = Date.now();

        try {
            // Run all 4 agents in parallel
            const [therapistResult, riskResult, plannerResult, ethicsResult] = await Promise.all([
                this.runAgent('therapist', userMessage, context),
                this.runAgent('risk', userMessage, context),
                this.runAgent('planner', userMessage, context),
                this.runAgent('ethics', userMessage, context)
            ]);

            const processingTime = Date.now() - startTime;
            console.log(`✅ Multi-Agent System: Completed in ${processingTime}ms`);

            // Synthesize responses
            const synthesis = await this.synthesizeResponses({
                therapist: therapistResult,
                risk: riskResult,
                planner: plannerResult,
                ethics: ethicsResult
            }, userMessage, context);

            return {
                agents: {
                    therapist: therapistResult,
                    risk: riskResult,
                    planner: plannerResult,
                    ethics: ethicsResult
                },
                synthesis,
                processingTime,
                timestamp: new Date()
            };
        } catch (error) {
            console.error('Multi-agent processing error:', error);
            throw error;
        }
    }

    /**
     * Synthesize all agent responses into final response
     */
    async synthesizeResponses(agentResults, userMessage, context) {
        const { therapist, risk, planner, ethics } = agentResults;

        // Check ethics approval first
        if (ethics.data.approval === 'rejected') {
            return {
                finalResponse: "I want to make sure I respond thoughtfully. Let me rephrase that.",
                confidence: 0.3,
                needsRevision: true,
                primaryAgent: 'ethics'
            };
        }

        // Check risk level
        const riskLevel = risk.data.risk_level || 'low';
        const isHighRisk = ['high', 'crisis'].includes(riskLevel);

        // Determine primary response based on risk
        let finalResponse = therapist.data.response || "I'm here for you.";
        let primaryAgent = 'therapist';

        // If high risk, prioritize safety
        if (isHighRisk && risk.data.intervention_needed) {
            finalResponse = `${therapist.data.response || "I hear you."} ${this.getCrisisAddendum(riskLevel)}`;
            primaryAgent = 'risk';
        }

        // Add planner suggestions if appropriate
        const includeActions = planner.data.immediate_actions?.length > 0 && !isHighRisk;
        if (includeActions) {
            const action = planner.data.immediate_actions[0];
            finalResponse += ` ${action}`;
        }

        // Calculate overall confidence
        const avgConfidence = [
            therapist.data.confidence || 0.5,
            risk.data.confidence || 0.5,
            planner.data.confidence || 0.5,
            ethics.data.confidence || 0.5
        ].reduce((a, b) => a + b, 0) / 4;

        return {
            finalResponse,
            confidence: avgConfidence,
            primaryAgent,
            techniqueUsed: therapist.data.technique_used || 'supportive',
            riskLevel,
            interventionNeeded: risk.data.intervention_needed || false,
            suggestedActions: planner.data.immediate_actions || [],
            ethicsApproved: ethics.data.approval === 'approved',
            biasesDetected: ethics.data.biases_detected || [],
            agentContributions: {
                therapist: therapist.success,
                risk: risk.success,
                planner: planner.success,
                ethics: ethics.success
            }
        };
    }

    /**
     * Get crisis addendum for high-risk situations
     */
    getCrisisAddendum(riskLevel) {
        if (riskLevel === 'crisis') {
            return "Your safety is important. Would you like me to share some immediate support resources?";
        } else if (riskLevel === 'high') {
            return "I'm concerned about how you're feeling. Would you like to talk about what's happening?";
        }
        return "";
    }

    /**
     * Get agent insights for UI display
     */
    getAgentInsights(multiAgentResult) {
        const { agents, synthesis } = multiAgentResult;

        return {
            therapist: {
                name: "Therapeutic Support",
                icon: "heart",
                response: agents.therapist.data.response,
                technique: agents.therapist.data.technique_used,
                confidence: agents.therapist.data.confidence,
                active: synthesis.primaryAgent === 'therapist'
            },
            risk: {
                name: "Safety Analysis",
                icon: "shield",
                riskLevel: agents.risk.data.risk_level,
                factors: agents.risk.data.risk_factors,
                confidence: agents.risk.data.confidence,
                active: synthesis.primaryAgent === 'risk'
            },
            planner: {
                name: "Action Planning",
                icon: "target",
                actions: agents.planner.data.immediate_actions,
                strategies: agents.planner.data.coping_strategies,
                confidence: agents.planner.data.confidence,
                active: synthesis.primaryAgent === 'planner'
            },
            ethics: {
                name: "Ethics & Safety",
                icon: "check-circle",
                approved: agents.ethics.data.approval === 'approved',
                concerns: agents.ethics.data.concerns,
                confidence: agents.ethics.data.confidence,
                active: synthesis.primaryAgent === 'ethics'
            }
        };
    }
}

module.exports = new MultiAgentOrchestrator();
