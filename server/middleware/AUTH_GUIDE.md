# 🔐 Authentication Middleware Guide

## Overview
This directory contains authentication middleware for the Neurix mental wellness platform.

## Current Implementation (Development)

### Middleware Functions

#### `validateAuth(req, res, next)`
**Purpose**: Require authentication for protected routes  
**Usage**: User-specific data endpoints

**How it works**:
1. Extracts userId from request (body, query, params, or headers)
2. Returns 401 if userId not found
3. Attaches userId to `req.userId` for downstream use
4. Calls `next()` to continue

**Example**:
```javascript
router.get('/api/profile/:userId', validateAuth, async (req, res) => {
  const userId = req.userId; // Available from middleware
  // ... fetch profile
});
```

#### `optionalAuth(req, res, next)`
**Purpose**: Allow both authenticated and anonymous access  
**Usage**: Public endpoints that can benefit from user context

**How it works**:
1. Extracts userId if present
2. Attaches to `req.userId` if found
3. Always calls `next()` (never blocks)

**Example**:
```javascript
router.post('/api/chatbot/chat', optionalAuth, async (req, res) => {
  const userId = req.userId; // May be undefined
  if (userId) {
    // Load user profile
  } else {
    // Anonymous chat
  }
});
```

## Usage Patterns

### Protected Routes (Require Auth)
Use `validateAuth` for:
- User profiles
- Session history
- Wellness plans
- Personal data
- Settings

```javascript
const { validateAuth } = require('./middleware/validateAuth');

router.get('/api/profile/:userId', validateAuth, handler);
router.post('/api/wellness-plan/:userId/save', validateAuth, handler);
```

### Public Routes (Optional Auth)
Use `optionalAuth` for:
- Chat endpoints
- Public content
- Landing pages
- Health checks

```javascript
const { optionalAuth } = require('./middleware/validateAuth');

router.post('/api/chatbot/chat', optionalAuth, handler);
router.get('/api/tavus/replica', optionalAuth, handler);
```

## Request Examples

### With Authentication
```bash
# Via body
curl -X POST http://localhost:3001/api/profile/insights \
  -H "Content-Type: application/json" \
  -d '{"userId": "user123"}'

# Via query parameter
curl http://localhost:3001/api/profile/user123?userId=user123

# Via header
curl http://localhost:3001/api/profile/user123 \
  -H "x-user-id: user123"
```

### Without Authentication (Public)
```bash
curl -X POST http://localhost:3001/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "sessionId": "session123"}'
```

## Current Route Protection

### Protected with `validateAuth` (15 routes)
- `GET /api/profile/:userId`
- `POST /api/profile/:userId/goals`
- `GET /api/sessions/:userId`
- `GET /api/wellness-plan/:userId`
- `POST /api/wellness-plan/:userId/save`
- `POST /api/wellness-plan/:planId/complete-activity`
- `POST /api/wellness-plan/:planId/journal`
- `POST /api/chatbot/wellness-plan/generate`
- `POST /api/chatbot/wellness/trajectory`
- `POST /api/chatbot/profile/insights`
- `POST /api/chatbot/profile/compare-history`
- `POST /api/chatbot/profile/patterns`
- `POST /api/chatbot/narrative/generate`
- `POST /api/chatbot/narrative/patterns`
- `POST /api/chatbot/narrative/compare`
- `POST /api/chatbot/narrative/memory-anchor`
- `POST /api/chatbot/narrative/memories`

### Public with `optionalAuth` (11 routes)
- `POST /api/tavus/conversations/:id/end`
- `GET /api/tavus/conversation/active`
- `GET /api/tavus/replica`
- `GET /api/tavus/conversations`
- `POST /api/tavus/conversations/:conversationId/end`
- `POST /api/tavus/conversation`
- `POST /api/chatbot/chat`
- `POST /api/chatbot/chat/explained`
- `POST /api/chatbot/session/end`
- `POST /api/chatbot/analyze/emotion`
- `POST /api/chatbot/analyze/crisis`
- `POST /api/chatbot/translate`
- `POST /api/chatbot/explain/response`

## ⚠️ Production Upgrade Required

### Current Limitations
1. **No token validation** - Accepts any userId
2. **No session management** - Stateless
3. **No expiration** - No timeout
4. **No refresh tokens** - Single-use only
5. **No role-based access** - All users equal

### Recommended Production Implementation

#### Option 1: JWT (JSON Web Tokens)
```javascript
const jwt = require('jsonwebtoken');

const validateAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};
```

**Usage**:
```bash
curl http://localhost:3001/api/profile/user123 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Option 2: Supabase Auth
```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

const validateAuth = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return res.status(401).json({ error: 'Invalid token' });
  }
  
  req.userId = user.id;
  req.userEmail = user.email;
  next();
};
```

#### Option 3: OAuth 2.0
For enterprise deployments with SSO requirements.

## Migration Path

### Step 1: Add JWT Support (Parallel)
```javascript
const validateAuth = (req, res, next) => {
  // Try JWT first
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = decoded.userId;
      return next();
    } catch (error) {
      // Fall through to userId check
    }
  }
  
  // Fallback to userId (development)
  const userId = req.body?.userId || req.query?.userId || req.params?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  req.userId = userId;
  next();
};
```

### Step 2: Update Frontend
```typescript
// Add token to all requests
const response = await fetch('/api/profile/user123', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### Step 3: Remove userId Fallback
Once all clients use tokens, remove the userId fallback.

## Security Best Practices

### DO ✅
- Use HTTPS in production
- Store tokens securely (httpOnly cookies or secure storage)
- Implement token expiration (15-60 minutes)
- Use refresh tokens for long sessions
- Validate token on every request
- Log authentication failures
- Rate limit authentication attempts

### DON'T ❌
- Store tokens in localStorage (XSS risk)
- Use long-lived tokens without refresh
- Accept userId from request body in production
- Skip token validation
- Log sensitive token data
- Use weak JWT secrets

## Testing

### Unit Tests
```javascript
describe('validateAuth', () => {
  it('should reject requests without userId', async () => {
    const req = { body: {}, query: {}, params: {} };
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const next = jest.fn();
    
    validateAuth(req, res, next);
    
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
  
  it('should accept requests with userId', async () => {
    const req = { body: { userId: 'user123' }, query: {}, params: {} };
    const res = {};
    const next = jest.fn();
    
    validateAuth(req, res, next);
    
    expect(req.userId).toBe('user123');
    expect(next).toHaveBeenCalled();
  });
});
```

### Integration Tests
```javascript
describe('Protected Routes', () => {
  it('should require authentication', async () => {
    const response = await request(app)
      .get('/api/profile/user123')
      .expect(401);
    
    expect(response.body.error).toBe('Authentication required');
  });
  
  it('should accept valid userId', async () => {
    const response = await request(app)
      .get('/api/profile/user123')
      .set('x-user-id', 'user123')
      .expect(200);
    
    expect(response.body.profile).toBeDefined();
  });
});
```

## Troubleshooting

### 401 Unauthorized
**Cause**: No userId provided  
**Solution**: Add userId to body, query, params, or x-user-id header

### userId not available in handler
**Cause**: Middleware not applied to route  
**Solution**: Add `validateAuth` or `optionalAuth` to route

### Authentication works in Postman but not browser
**Cause**: CORS or cookie issues  
**Solution**: Check CORS configuration and cookie settings

## Environment Variables

```env
# Current (Development)
# No auth-specific variables needed

# Production (JWT)
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=15m
JWT_REFRESH_EXPIRATION=7d

# Production (Supabase)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
```

## Related Files

- `server/server.js` - Main server with route protection
- `server/chatbot-universal.js` - Chatbot routes with auth
- `server/middleware/validateAuth.js` - This middleware
- `PRODUCTION_CHECKLIST.md` - Production requirements

---

**Last Updated**: February 8, 2026  
**Status**: Development Implementation  
**Production Ready**: ❌ Needs JWT/OAuth upgrade
