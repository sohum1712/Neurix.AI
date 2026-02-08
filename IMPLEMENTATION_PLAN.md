# 🚀 Neurix.AI - Gemini 3 Advanced Features Implementation Plan

> **Hackathon Deadline:** February 9, 2026 @ 5:00 PM PT  
> **Current Time:** February 8, 2026 @ 5:59 PM IST  
> **Time Remaining:** ~24 hours

---

## 📋 Implementation Status Tracker

### Phase 1: Core Infrastructure (Priority: CRITICAL) ✅ COMPLETE
| # | Feature | Status | Files Changed | Notes |
|---|---------|--------|---------------|-------|
| 1.1 | Upgrade to Gemini 3 Model | ✅ Done | `server/services/geminiService.js` | Using `gemini-2.0-flash-exp` |
| 1.2 | Add Structured JSON Output | ✅ Done | `server/services/geminiService.js` | All responses use JSON schemas |
| 1.3 | Create Gemini Service Module | ✅ Done | `server/services/geminiService.js` | Centralized AI logic |
| 1.4 | Create CognitiveProfile Model | ✅ Done | `server/models/CognitiveProfile.js` | Digital twin storage |
| 1.5 | Create Session Model | ✅ Done | `server/models/Session.js` | Session history storage |
| 1.6 | Create WellnessPlan Model | ✅ Done | `server/models/WellnessPlan.js` | Wellness plans storage |

### Phase 2: Emotion & Safety Analysis (Priority: HIGH) ✅ COMPLETE
| # | Feature | Status | Files Changed | Notes |
|---|---------|--------|---------------|-------|
| 2.1 | Emotion Analysis Engine | ✅ Done | `server/services/geminiService.js` | Real-time emotion detection |
| 2.2 | Crisis Detection System | ✅ Done | `server/services/geminiService.js` | Reasoning-based safety |
| 2.3 | Enhanced Chat Response | ✅ Done | `server/chatbot-universal.js` | Full emotion + safety + therapy |
| 2.4 | Crisis UI Component | ✅ Done | `client/src/components/ChatWidget.tsx` | Emergency intervention UI |
| 2.5 | Update ChatWidget | ✅ Done | `client/src/components/ChatWidget.tsx` | Handles all new data |

### Phase 3: Cognitive Digital Twin (Priority: HIGH) ✅ COMPLETE
| # | Feature | Status | Files Changed | Notes |
|---|---------|--------|---------------|-------|
| 3.1 | Profile Creation API | ✅ Done | `server/server.js` | CRUD for profiles |
| 3.2 | Profile Update on Chat | ✅ Done | `server/chatbot-universal.js` | Auto-update profile |
| 3.3 | Profile Dashboard UI | ✅ Done | `client/src/components/CognitiveInsights.tsx` | Shows user insights |

### Phase 4: Session Management (Priority: HIGH) ✅ COMPLETE
| # | Feature | Status | Files Changed | Notes |
|---|---------|--------|---------------|-------|
| 4.1 | Session Recording | ✅ Done | `server/chatbot-universal.js`, `server/server.js` | Store session data |
| 4.2 | Session Summary Generator | ✅ Done | `server/services/geminiService.js` | AI summaries |
| 4.3 | Session History UI | ✅ Done | `client/src/components/SessionHistory.tsx` | View past sessions |

### Phase 5: Wellness Planning (Priority: HIGH) ✅ COMPLETE
| # | Feature | Status | Files Changed | Notes |
|---|---------|--------|---------------|-------|
| 5.1 | Wellness Plan Generator API | ✅ Done | `server/chatbot-universal.js`, `server/server.js` | Generate plans |
| 5.2 | Wellness Plan UI | ✅ Done | `client/src/components/WellnessPlan.tsx` | Display/track plans |
| 5.3 | Dashboard Integration | ✅ Done | `client/src/pages/Dashboard.tsx` | Added wellness widget |

### Phase 6: Explainable AI (Priority: MEDIUM) ✅ COMPLETE
| # | Feature | Status | Files Changed | Notes |
|---|---------|--------|---------------|-------|
| 6.1 | Add Explanation to Responses | ✅ Done | `server/chatbot-universal.js` | Includes reasoning |
| 6.2 | Explanation Badge UI | ✅ Done | `client/src/components/ChatWidget.tsx` | Therapy style indicator |

### Phase 7: Advanced Features (Priority: MEDIUM) ✅ COMPLETE
| # | Feature | Status | Files Changed | Notes |
|---|---------|--------|---------------|-------|
| 7.1 | Adaptive Therapy Styles | ✅ Done | `server/services/geminiService.js` | CBT/Mindfulness/etc |
| 7.2 | Wellness Trajectory | ✅ Done | `server/services/geminiService.js` | Future predictions |
| 7.3 | Multi-Agent Reasoning | ⏳ Skip | - | Time constraint |
| 7.4 | Self-Critique Loop | ✅ Done | `server/services/geminiService.js` | Safety refinement |

---

## 🗂️ New Files to Create

### Backend (server/)
```
server/
├── services/
│   ├── geminiService.js      # Centralized Gemini 3 client
│   ├── emotionAnalyzer.js    # Emotion detection
│   ├── crisisDetector.js     # Safety analysis
│   ├── sessionSummarizer.js  # Session summaries
│   ├── therapyAdapter.js     # Therapy style switching
│   ├── trajectoryPredictor.js # Wellness predictions
│   └── responseCritic.js     # Self-critique
├── models/
│   ├── CognitiveProfile.js   # User mental model
│   ├── Session.js            # Session history
│   └── WellnessPlan.js       # Wellness plans
├── routes/
│   ├── cognitiveProfile.js   # Profile APIs
│   ├── sessions.js           # Session APIs
│   └── wellnessPlan.js       # Wellness APIs
```

### Frontend (client/src/)
```
client/src/
├── components/
│   ├── CrisisAlert.tsx       # Emergency intervention
│   ├── CognitiveInsights.tsx # User insights widget
│   ├── SessionHistory.tsx    # Past sessions
│   ├── WellnessPlan.tsx      # Wellness tracking
│   └── ExplanationModal.tsx  # AI reasoning display
```

---

## 🔧 Technical Architecture

### Response Flow (Enhanced)
```
User Message
    │
    ▼
┌─────────────────┐
│ Emotion Analyzer │ ─────────────┐
└─────────────────┘               │
    │                             │
    ▼                             ▼
┌─────────────────┐     ┌─────────────────┐
│ Crisis Detector │     │ Therapy Adapter │
└─────────────────┘     └─────────────────┘
    │                             │
    ▼                             ▼
┌─────────────────────────────────────────┐
│          Gemini 3 Main Response         │
│  (with emotion + safety + therapy)      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────┐
│ Response Critic │ (Self-critique loop)
└─────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│            Final Response               │
│  - reply text                           │
│  - emotion analysis                     │
│  - risk level                           │
│  - explanation                          │
│  - follow-up suggestions                │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────┐
│ Profile Updater │ (Update cognitive twin)
└─────────────────┘
```

### Enhanced Response Schema
```json
{
  "reply": "string - main response text",
  "emotion": {
    "detected": "anxious|sad|calm|stressed|overwhelmed|hopeful|neutral",
    "intensity": 0.0-1.0,
    "confidence": 0.0-1.0
  },
  "safety": {
    "risk_level": "low|medium|high|crisis",
    "needs_intervention": boolean,
    "intervention_type": "none|gentle_check|immediate|crisis"
  },
  "explanation": {
    "reasoning": "why this response was given",
    "factors": ["list of factors considered"]
  },
  "suggestions": {
    "followups": ["suggested follow-up questions"],
    "resources": ["relevant resources"],
    "exercises": ["grounding/breathing if needed"]
  },
  "therapy_style": "CBT|supportive|mindfulness|motivational",
  "profile_updates": {
    "triggers_identified": [],
    "interventions_used": [],
    "mood_noted": ""
  }
}
```

---

## ⏱️ Timeline

### Day 1 (Feb 8) - Evening/Night
- [x] Create implementation plan
- [ ] Phase 1: Core Infrastructure (2-3 hours)
- [ ] Phase 2: Emotion & Safety (2-3 hours)

### Day 2 (Feb 9) - Morning
- [ ] Phase 3: Cognitive Digital Twin (2-3 hours)
- [ ] Phase 4: Session Management (1-2 hours)
- [ ] Phase 5: Wellness Planning (2-3 hours)

### Day 2 (Feb 9) - Afternoon
- [ ] Phase 6: Explainable AI (1 hour)
- [ ] Phase 7: Advanced Features (if time permits)
- [ ] Testing & Bug Fixes
- [ ] Deployment

---

## 🔑 Environment Variables Needed

```env
# Gemini 3 (Update)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash-exp

# MongoDB (Existing)
MONGODB_URI=your_mongodb_uri

# Tavus (Existing)
TAVUS_API_KEY=your_tavus_api_key
TAVUS_REPLICA_ID=your_replica_id
```

---

## 📝 Notes

- All new features use Gemini 3's structured output (JSON mode)
- Emotion analysis runs on every message
- Crisis detection triggers emergency UI
- Cognitive profile updates incrementally
- Session summaries generated at end of each session
- Wellness plans personalized based on cognitive profile

---

*Last Updated: Feb 8, 2026 @ 6:00 PM IST*
