# 🧪 Quick Testing Guide

## 🚀 Start Services

### Terminal 1 - Backend
```bash
cd server
node server.js
```
Expected output:
```
Server running in development mode on port 3001
✅ MongoDB connected
📅 Data retention cleanup scheduled
```

### Terminal 2 - Frontend
```bash
cd client
npm run dev
```
Expected output:
```
VITE ready in XXXms
➜ Local: http://localhost:8081/
```

---

## ✅ Feature Testing Sequence

### 1. Test Multi-Agent Chat (2 min)
1. Open `http://localhost:8081`
2. Click chat widget (bottom right)
3. Send: **"I'm feeling really anxious about work"**
4. Wait 3-5 seconds
5. ✅ Check for "Multi-Agent" badge
6. ✅ Check confidence percentage
7. ✅ Verify emotion detected (anxious)

### 2. Test Dashboard (2 min)
1. Navigate to `/dashboard`
2. ✅ Verify EmotionTimeline loads
3. ✅ Hover over emotion bars
4. ✅ Check CognitiveProfileDashboard (4 panels)
5. ✅ Verify WellnessTrajectory shows prediction
6. ✅ Check stats display

### 3. Test Journey Page (3 min)
1. Click "Journey" in navigation
2. ✅ Wait for narrative generation (~3s)
3. ✅ Read life narrative
4. ✅ Check growth trajectory
5. ✅ View key strengths
6. ✅ Check recurring themes
7. ✅ Verify wellness trajectory chart
8. ✅ Check 60-day emotion timeline

### 4. Test Crisis Detection (2 min)
1. Open chat widget
2. Send: **"I don't want to be here anymore"**
3. ✅ Crisis alert should appear
4. ✅ Helpline numbers displayed (Tele-MANAS)
5. ✅ Grounding exercise available
6. ✅ Check risk level indicator

### 5. Test Profile Intelligence (2 min)
1. Go to Dashboard
2. Scroll to Cognitive Profile section
3. ✅ Check emotional patterns
4. ✅ View triggers (if any)
5. ✅ Check effective interventions
6. ✅ View active concerns

---

## 🔍 API Testing (Postman/curl)

### Test 1: Multi-Agent Chat
```bash
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "I feel stressed about my job",
    "userId": "test_user_123",
    "useMultiAgent": true
  }'
```

**Expected Response**:
```json
{
  "reply": "...",
  "emotion": {
    "detected": "stressed",
    "intensity": 0.7,
    "confidence": 0.85
  },
  "multiAgent": {
    "used": true,
    "confidence": 0.82,
    "processingTime": 3500
  }
}
```

### Test 2: Life Narrative
```bash
curl -X POST http://localhost:3001/api/chatbot/narrative/generate \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123"}'
```

**Expected Response**:
```json
{
  "narrative": "Your journey has been...",
  "recurring_themes": ["resilience", "growth"],
  "key_strengths": ["self-awareness", "commitment"],
  "future_outlook": "..."
}
```

### Test 3: Wellness Trajectory
```bash
curl -X POST http://localhost:3001/api/chatbot/wellness/trajectory \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123"}'
```

**Expected Response**:
```json
{
  "trend": "improving",
  "confidence": 0.78,
  "burnout_risk": 0.3,
  "predicted_mood_7_days": "calm",
  "warning_signs": [],
  "preventive_actions": ["Continue mindfulness practice"]
}
```

### Test 4: Pattern Detection
```bash
curl -X POST http://localhost:3001/api/chatbot/narrative/patterns \
  -H "Content-Type: application/json" \
  -d '{"userId": "test_user_123", "days": 60}'
```

---

## 🐛 Common Issues & Fixes

### Issue: "Gemini API Quota Exceeded"
**Fix**: Wait 5 minutes (free tier limit) or upgrade to paid tier

### Issue: "Profile not found"
**Fix**: Send at least one chat message to create profile

### Issue: "Multi-Agent not showing"
**Fix**: 
1. Check server logs for errors
2. Verify GEMINI_API_KEY in .env
3. Restart server

### Issue: "Narrative generation failed"
**Fix**: Need at least 5 chat sessions for meaningful narrative

### Issue: Components not loading
**Fix**:
1. Check browser console for errors
2. Verify API endpoint URLs
3. Check CORS settings

### Issue: Encryption key error
**Fix**:
```bash
# Generate new key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Add to server/.env
ENCRYPTION_KEY=<generated_key>
```

---

## 📊 Performance Benchmarks

### Expected Response Times
- Emotion analysis: < 1s
- Multi-agent chat: 3-5s
- Profile insights: 1-2s
- Narrative generation: 2-3s
- Pattern detection: < 1s
- Trajectory prediction: 1-2s

### If Slower Than Expected
1. Check internet connection
2. Verify Gemini API status
3. Check MongoDB connection
4. Review server logs
5. Check cache hit rate

---

## ✅ Success Indicators

### Backend Health
- ✅ Server starts without errors
- ✅ MongoDB connection successful
- ✅ Data retention scheduler active
- ✅ All API endpoints responding
- ✅ No console errors

### Frontend Health
- ✅ Vite dev server running
- ✅ No build errors
- ✅ All routes accessible
- ✅ Components render correctly
- ✅ No console errors

### Feature Health
- ✅ Chat responses in < 5s
- ✅ Multi-agent badge visible
- ✅ Emotion timeline interactive
- ✅ Profile dashboard populated
- ✅ Narrative generates successfully
- ✅ Trajectory shows predictions
- ✅ Crisis detection works

---

## 🎯 Quick Smoke Test (5 min)

Run this sequence to verify everything works:

1. **Start services** (both terminals)
2. **Open browser** → `http://localhost:8081`
3. **Send chat message** → "I'm feeling anxious"
4. **Check response** → Multi-agent badge visible
5. **Go to Dashboard** → All components load
6. **Go to Journey** → Narrative generates
7. **Test crisis** → Send concerning message
8. **Verify helpline** → Tele-MANAS displayed

If all 8 steps pass → ✅ **System is working!**

---

## 📱 Mobile Testing

### Chrome DevTools
1. Open DevTools (F12)
2. Click device toolbar (Ctrl+Shift+M)
3. Select iPhone/Android
4. Test:
   - ✅ Navigation menu
   - ✅ Chat widget
   - ✅ Dashboard layout
   - ✅ Journey page
   - ✅ Emotion timeline scroll

---

## 🔐 Security Testing

### HIPAA Compliance
1. ✅ Check encryption key is set
2. ✅ Verify data retention scheduler
3. ✅ Test 30-day deletion (check logs)
4. ✅ Verify audit logging
5. ✅ Check HTTPS in production

---

## 📈 Monitoring

### What to Monitor
- API response times
- Error rates
- Cache hit rates
- Database query times
- Memory usage
- CPU usage

### Log Locations
- Backend: Server console
- Frontend: Browser console
- Database: MongoDB Atlas logs

---

## 🎉 Ready for Production?

Checklist:
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] HIPAA compliant
- [ ] Documentation complete
- [ ] Environment variables set
- [ ] Backup strategy in place

---

**Happy Testing! 🚀**

For issues, check:
1. Server logs
2. Browser console
3. Network tab
4. MongoDB logs
5. Gemini API status
