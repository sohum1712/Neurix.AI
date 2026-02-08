# 🚀 Quick Start Guide - Gemini AI Features

## Prerequisites
- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- Gemini API key (free tier works!)

## Setup (5 minutes)

### 1. Generate Encryption Key
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output.

### 2. Configure Server Environment
Create `server/.env`:
```bash
# Server
PORT=3001
NODE_ENV=development

# MongoDB
MONGODB_URI=your_mongodb_connection_string

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-3-flash-preview

# HIPAA Compliance
ENCRYPTION_KEY=<paste_generated_key_here>
DATA_RETENTION_DAYS=30

# Tavus (optional)
TAVUS_API_KEY=your_tavus_key
TAVUS_REPLICA_ID=your_replica_id
```

### 3. Install Dependencies
```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 4. Start Services
```bash
# Terminal 1 - Backend
cd server
node server.js

# Terminal 2 - Frontend
cd client
npm run dev
```

### 5. Access Application
Open browser: `http://localhost:8081`

---

## Testing New Features

### Test 1: Multi-Agent Chat
1. Click chat widget (bottom right)
2. Send: "I'm feeling anxious about my job"
3. Wait 3-5 seconds
4. Look for "Multi-Agent" badge with confidence %

### Test 2: Emotion Timeline
1. Go to Dashboard
2. Scroll to "EMOTIONAL JOURNEY" section
3. Hover over bars to see emotion details
4. Check trajectory indicator (improving/stable/declining)

### Test 3: Profile Dashboard
1. Stay on Dashboard
2. Scroll to "COGNITIVE DIGITAL TWIN" section
3. View 4 panels:
   - Emotional Patterns
   - Triggers
   - Effective Interventions
   - Active Concerns

### Test 4: Crisis Detection
1. Open chat widget
2. Send: "I don't want to be here anymore"
3. Crisis alert should appear
4. Helpline numbers displayed
5. Grounding exercise available

---

## Troubleshooting

### "Gemini API Quota Exceeded"
- You're hitting free tier limits
- Caching is enabled (5-min TTL)
- Wait a few minutes or upgrade to paid tier

### "Profile not found"
- First-time users need to send a chat message
- Profile is auto-created on first interaction

### "Multi-Agent not showing"
- Check server logs for errors
- Verify GEMINI_API_KEY is set
- Try sending message again

### Encryption Key Error
- Generate new key: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- Add to server/.env as ENCRYPTION_KEY

---

## API Testing (Postman/curl)

### Test Multi-Agent Chat
```bash
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I am feeling stressed",
    "userId": "test_user_123",
    "useMultiAgent": true
  }'
```

### Test Profile Insights
```bash
curl -X POST http://localhost:3001/api/chatbot/profile/insights \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123"}'
```

### Test Pattern Detection
```bash
curl -X POST http://localhost:3001/api/chatbot/profile/patterns \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123"}'
```

---

## What to Expect

### First Message
- Profile auto-created
- Emotion detected
- Multi-agent analysis
- Response in 3-5 seconds

### After 5+ Messages
- Emotion timeline populates
- Profile insights available
- Patterns start emerging
- Trajectory calculated

### After 10+ Messages
- Rich profile dashboard
- Trigger identification
- Intervention tracking
- Growth metrics

---

## Performance Tips

1. **Free Tier Optimization**
   - Caching enabled (5-min TTL)
   - Conversation history limited to last 5 messages
   - Cache auto-cleans at 100 entries

2. **Response Times**
   - Emotion analysis: ~800ms
   - Multi-agent: ~3-5s
   - Profile insights: ~1-2s
   - With cache: ~50ms

3. **Database**
   - Use MongoDB Atlas for best performance
   - Indexes already configured
   - Auto-cleanup runs daily at 2 AM

---

## Security Notes

### HIPAA Compliance
- ✅ AES-256-GCM encryption
- ✅ 30-day data retention
- ✅ Audit logging
- ✅ Secure key management

### Best Practices
- Never commit .env files
- Rotate encryption key quarterly
- Monitor audit logs
- Use HTTPS in production

---

## Next Steps

1. ✅ Test all features
2. ✅ Review implementation progress
3. ✅ Check IMPLEMENTATION_PROGRESS.md
4. ✅ Plan Day 2 work (Life Narrative, Wellness Trajectory)

---

## Support

- Check `IMPLEMENTATION_PROGRESS.md` for detailed status
- Review `GEMINI_AI_IMPLEMENTATION_PLAN.md` for full plan
- See server logs for debugging
- Check browser console for frontend errors

---

**Happy Testing! 🎉**
