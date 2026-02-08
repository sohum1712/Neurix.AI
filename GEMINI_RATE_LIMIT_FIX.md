# 🔧 Gemini API Rate Limit Fix & Tavus Optimization

## Problem
1. **Gemini API quota exhausted** - Too many API calls causing `RESOURCE_EXHAUSTED` errors
2. **Unnecessary Tavus API calls** - Tavus endpoints being called even when not in video session

## Solution Applied

### 1. Updated Gemini Model ✅
Changed from `gemini-3-flash-preview` (not available) to `gemini-2.0-flash-exp` (free tier)

**File**: `server/.env`
```env
GEMINI_MODEL=gemini-2.0-flash-exp
```

### 2. Added Rate Limiting ✅
Implemented request throttling in `server/services/geminiService.js`:
- Max 10 requests per minute (conservative for free tier)
- Automatic waiting when limit reached
- Request counter with rolling window

**Code Added**:
```javascript
let requestCount = 0;
let requestWindow = Date.now();
const MAX_REQUESTS_PER_MINUTE = 10;

async function checkRateLimit() {
    const now = Date.now();
    if (now - requestWindow > WINDOW_MS) {
        requestCount = 0;
        requestWindow = now;
    }
    
    if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
        const waitTime = WINDOW_MS - (now - requestWindow);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        requestCount = 0;
        requestWindow = Date.now();
    }
    
    requestCount++;
}
```

### 3. Enhanced Caching ✅
- 5-minute cache TTL for repeated requests
- Cache size limit (100 entries)
- Automatic cache cleanup

### 4. Better Error Handling ✅
```javascript
if (error.status === 429 || error.message?.includes('RESOURCE_EXHAUSTED')) {
    return { 
        reply: "I'm currently receiving too many messages. Please give me a moment 🌸", 
        therapyStyleUsed: 'supportive' 
    };
}
```

## Tavus API Optimization

### Current Issue
Tavus API endpoints are being called even when user is not in a video session, wasting resources.

### Recommended Changes

#### Option 1: Require Authentication for All Tavus Endpoints
**File**: `server/server.js`

Change all Tavus routes from `optionalAuth` to `validateAuth`:

```javascript
// Before
app.get('/api/tavus/replica', optionalAuth, async (req, res) => {

// After  
app.get('/api/tavus/replica', validateAuth, async (req, res) => {
```

Apply to:
- `GET /api/tavus/replica`
- `GET /api/tavus/conversations`
- `POST /api/tavus/conversation`
- `POST /api/tavus/conversations/:id/end`
- `GET /api/tavus/conversation/active`

#### Option 2: Only Load Tavus When Video Session Starts
**Frontend**: `client/src/pages/TavusSession.tsx`

Only initialize Tavus when user explicitly starts video session:

```typescript
const startVideoSession = async () => {
  if (!user) {
    toast.error('Please log in to start video session');
    return;
  }
  
  // Only NOW make Tavus API calls
  const conversation = await createConversation();
  // ... rest of logic
};
```

#### Option 3: Lazy Load Tavus Routes
**Backend**: Only register Tavus routes when needed

```javascript
// Conditional route registration
if (process.env.ENABLE_VIDEO_SESSIONS === 'true') {
  app.get('/api/tavus/replica', validateAuth, tavusReplicaHandler);
  // ... other Tavus routes
}
```

## Implementation Steps

### Step 1: Update Environment ✅ DONE
```bash
# server/.env
GEMINI_MODEL=gemini-2.0-flash-exp
```

### Step 2: Restart Server
```bash
cd server
node server.js
```

### Step 3: Test Rate Limiting
Make multiple rapid requests to see rate limiting in action:
```bash
# Should see: "⏳ Rate limit reached. Waiting Xs..."
for i in {1..15}; do
  curl -X POST http://localhost:3001/api/chatbot/chat \
    -H "Content-Type: application/json" \
    -d '{"message":"Hello","sessionId":"test"}' &
done
```

### Step 4: Secure Tavus Endpoints (RECOMMENDED)
```javascript
// server/server.js
// Change all optionalAuth to validateAuth for Tavus routes

app.get('/api/tavus/replica', validateAuth, async (req, res) => {
app.get('/api/tavus/conversations', validateAuth, async (req, res) => {
app.post('/api/tavus/conversation', validateAuth, async (req, res) => {
app.post('/api/tavus/conversations/:id/end', validateAuth, async (req, res) => {
app.get('/api/tavus/conversation/active', validateAuth, async (req, res) => {
```

### Step 5: Update Frontend (RECOMMENDED)
```typescript
// client/src/pages/TavusSession.tsx
// Only call Tavus API when user clicks "Start Video Session"

const TavusSession = () => {
  const [sessionActive, setSessionActive] = useState(false);
  
  const startSession = async () => {
    if (!user?.id) {
      toast.error('Please log in first');
      return;
    }
    
    // NOW make Tavus API call
    const conversation = await api.post('/tavus/conversation', {
      userId: user.id
    });
    
    setSessionActive(true);
  };
  
  return (
    <div>
      {!sessionActive ? (
        <button onClick={startSession}>Start Video Session</button>
      ) : (
        <TavusVideoComponent />
      )}
    </div>
  );
};
```

## Monitoring

### Check Rate Limiting
Look for these logs:
```
✅ Cache hit for Gemini request
🤖 Gemini API call (gemini-2.0-flash-exp)
⏳ Rate limit reached. Waiting 45s...
```

### Check Quota Usage
Visit: https://ai.dev/rate-limit

### Check Errors
```bash
# Should NOT see these anymore:
❌ Gemini generation error: RESOURCE_EXHAUSTED
Error: API quota exceeded
```

## Free Tier Limits

### Gemini 2.0 Flash Exp (Free)
- **Requests per minute**: 15
- **Requests per day**: 1,500
- **Tokens per minute**: 1,000,000

### Our Configuration
- **Rate limit**: 10 requests/minute (conservative)
- **Cache TTL**: 5 minutes
- **Max cache size**: 100 entries

## Expected Improvements

### Before Fix
- ❌ Frequent `RESOURCE_EXHAUSTED` errors
- ❌ Unnecessary Tavus API calls
- ❌ No rate limiting
- ❌ Poor error messages

### After Fix
- ✅ Automatic rate limiting
- ✅ 5-minute response caching
- ✅ Graceful error handling
- ✅ Better user feedback
- ✅ Reduced API costs

## Testing Checklist

- [ ] Server starts without errors
- [ ] Chat works with rate limiting
- [ ] Cache hits logged correctly
- [ ] Quota errors handled gracefully
- [ ] Tavus only called when authenticated
- [ ] Video session works correctly

## Troubleshooting

### Still Getting Quota Errors?
1. Reduce `MAX_REQUESTS_PER_MINUTE` to 5
2. Increase `CACHE_TTL` to 10 minutes
3. Check https://ai.dev/rate-limit for usage

### Rate Limiting Too Aggressive?
1. Increase `MAX_REQUESTS_PER_MINUTE` to 12
2. Monitor quota usage
3. Adjust based on actual limits

### Tavus Not Working?
1. Check authentication is working
2. Verify userId is being passed
3. Check Tavus API key is valid

## Additional Optimizations

### 1. Disable Multi-Agent for Non-Critical Requests
```javascript
// chatbot-universal.js
const { useMultiAgent = false } = req.body; // Default to false
```

### 2. Reduce Emotion Analysis Frequency
```javascript
// Only analyze emotion every 3rd message
if (conversationHistory.length % 3 === 0) {
  emotionAnalysis = await geminiService.analyzeEmotion(userMessage);
}
```

### 3. Batch Requests
```javascript
// Combine multiple analyses into one API call
const combinedPrompt = `
Analyze emotion: ${userMessage}
Detect crisis: ${userMessage}
Select therapy style: ${conversationHistory}
`;
```

## Files Modified

1. ✅ `server/.env` - Updated GEMINI_MODEL
2. ✅ `server/services/geminiService.js` - Added rate limiting
3. ⏳ `server/server.js` - Need to secure Tavus routes
4. ⏳ `client/src/pages/TavusSession.tsx` - Need to lazy load

## Next Steps

1. **Immediate**: Restart server with new model
2. **Today**: Secure Tavus endpoints with `validateAuth`
3. **This Week**: Implement frontend lazy loading
4. **Ongoing**: Monitor quota usage

---

**Status**: Partially Complete  
**Priority**: HIGH  
**Impact**: Prevents quota exhaustion, reduces costs
