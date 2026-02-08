# 🔐 Authentication Flow Diagram

## Current Implementation (Development)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express Server                             │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  1. CORS Middleware                                       │ │
│  │     - Check origin                                        │ │
│  │     - Allow credentials                                   │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  2. Request Logging                                       │ │
│  │     - Log method, path                                    │ │
│  │     - Track duration                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  3. Rate Limiting                                         │ │
│  │     - 100 requests per 15 min                             │ │
│  │     - Per IP address                                      │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  4. Authentication Middleware                             │ │
│  │                                                           │ │
│  │     ┌─────────────────────────────────────────┐          │ │
│  │     │  validateAuth (Protected Routes)        │          │ │
│  │     │  ─────────────────────────────────────  │          │ │
│  │     │  1. Extract userId from:                │          │ │
│  │     │     - req.body.userId                   │          │ │
│  │     │     - req.query.userId                  │          │ │
│  │     │     - req.params.userId                 │          │ │
│  │     │     - req.headers['x-user-id']          │          │ │
│  │     │                                          │          │ │
│  │     │  2. Check if userId exists              │          │ │
│  │     │     ├─ YES: Attach to req.userId        │          │ │
│  │     │     │       Call next()                 │          │ │
│  │     │     └─ NO:  Return 401 Unauthorized     │          │ │
│  │     └─────────────────────────────────────────┘          │ │
│  │                                                           │ │
│  │     ┌─────────────────────────────────────────┐          │ │
│  │     │  optionalAuth (Public Routes)           │          │ │
│  │     │  ─────────────────────────────────────  │          │ │
│  │     │  1. Extract userId (same sources)       │          │ │
│  │     │                                          │          │ │
│  │     │  2. If found: Attach to req.userId      │          │ │
│  │     │     If not: Continue anyway             │          │ │
│  │     │                                          │          │ │
│  │     │  3. Always call next()                  │          │ │
│  │     └─────────────────────────────────────────┘          │ │
│  └───────────────────────────────────────────────────────────┘ │
│                              │                                  │
│                              ▼                                  │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  5. Route Handler                                         │ │
│  │     - Access req.userId                                   │ │
│  │     - Process request                                     │ │
│  │     - Return response                                     │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT RESPONSE                         │
└─────────────────────────────────────────────────────────────────┘
```

## Request Examples

### Protected Route (validateAuth)

```
REQUEST:
POST /api/profile/insights
Content-Type: application/json
{
  "userId": "user123"
}

FLOW:
1. CORS ✅
2. Logging ✅
3. Rate Limit ✅
4. validateAuth:
   - Extract userId from body: "user123" ✅
   - Attach to req.userId ✅
   - Call next() ✅
5. Handler:
   - Access req.userId: "user123"
   - Fetch profile insights
   - Return response

RESPONSE:
200 OK
{
  "insights": { ... }
}
```

### Protected Route (No Auth)

```
REQUEST:
POST /api/profile/insights
Content-Type: application/json
{
  "message": "Hello"
}

FLOW:
1. CORS ✅
2. Logging ✅
3. Rate Limit ✅
4. validateAuth:
   - Extract userId: NOT FOUND ❌
   - Return 401 ❌

RESPONSE:
401 Unauthorized
{
  "success": false,
  "error": "Authentication required",
  "message": "User ID not provided"
}
```

### Public Route (optionalAuth)

```
REQUEST:
POST /api/chatbot/chat
Content-Type: application/json
{
  "message": "Hello",
  "sessionId": "session123"
}

FLOW:
1. CORS ✅
2. Logging ✅
3. Rate Limit ✅
4. optionalAuth:
   - Extract userId: NOT FOUND
   - Continue anyway ✅
   - Call next() ✅
5. Handler:
   - req.userId: undefined
   - Process as anonymous
   - Return response

RESPONSE:
200 OK
{
  "reply": "Hello! How can I help?",
  "sessionId": "session123"
}
```

### Public Route (With Auth)

```
REQUEST:
POST /api/chatbot/chat
Content-Type: application/json
x-user-id: user123
{
  "message": "Hello",
  "sessionId": "session123"
}

FLOW:
1. CORS ✅
2. Logging ✅
3. Rate Limit ✅
4. optionalAuth:
   - Extract userId from header: "user123" ✅
   - Attach to req.userId ✅
   - Call next() ✅
5. Handler:
   - req.userId: "user123"
   - Load user profile
   - Personalized response

RESPONSE:
200 OK
{
  "reply": "Hello John! How are you feeling today?",
  "sessionId": "session123",
  "profile": { ... }
}
```

## Route Protection Matrix

| Endpoint | Middleware | Requires Auth | Anonymous OK |
|----------|-----------|---------------|--------------|
| `/api/health` | None | ❌ | ✅ |
| `/api/profile/:userId` | validateAuth | ✅ | ❌ |
| `/api/sessions/:userId` | validateAuth | ✅ | ❌ |
| `/api/wellness-plan/:userId` | validateAuth | ✅ | ❌ |
| `/api/chatbot/chat` | optionalAuth | ❌ | ✅ |
| `/api/chatbot/session/end` | optionalAuth | ❌ | ✅ |
| `/api/chatbot/wellness-plan/generate` | validateAuth | ✅ | ❌ |
| `/api/chatbot/narrative/generate` | validateAuth | ✅ | ❌ |
| `/api/tavus/conversation` | optionalAuth | ❌ | ✅ |

## Production Flow (JWT - Recommended)

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT REQUEST                          │
│  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Authentication Middleware (JWT)                                │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  1. Extract token from Authorization header              │ │
│  │     - Split "Bearer <token>"                              │ │
│  │                                                           │ │
│  │  2. Verify token                                          │ │
│  │     - jwt.verify(token, JWT_SECRET)                       │ │
│  │     - Check expiration                                    │ │
│  │     - Validate signature                                  │ │
│  │                                                           │ │
│  │  3. Decode payload                                        │ │
│  │     - Extract userId                                      │ │
│  │     - Extract role                                        │ │
│  │     - Extract permissions                                 │ │
│  │                                                           │ │
│  │  4. Attach to request                                     │ │
│  │     - req.userId = decoded.userId                         │ │
│  │     - req.userRole = decoded.role                         │ │
│  │                                                           │ │
│  │  5. Continue or reject                                    │ │
│  │     ├─ Valid: Call next()                                 │ │
│  │     └─ Invalid: Return 401                                │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ROUTE HANDLER                           │
└─────────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         REQUEST                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  validateAuth   │
                    └─────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
        ┌───────────────┐         ┌───────────────┐
        │  userId found │         │ userId missing│
        └───────────────┘         └───────────────┘
                │                           │
                ▼                           ▼
        ┌───────────────┐         ┌───────────────┐
        │ Attach userId │         │  Return 401   │
        │  Call next()  │         │   Unauthorized│
        └───────────────┘         └───────────────┘
                │                           │
                ▼                           ▼
        ┌───────────────┐         ┌───────────────┐
        │ Route Handler │         │ Error Response│
        └───────────────┘         └───────────────┘
                │                           │
                ▼                           ▼
        ┌───────────────┐         ┌───────────────┐
        │  200 Success  │         │  Client Error │
        └───────────────┘         └───────────────┘
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  Layer 1: Network Security                                      │
│  - HTTPS/TLS encryption                                         │
│  - Firewall rules                                               │
│  - DDoS protection                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 2: Application Security                                  │
│  - CORS policy                                                  │
│  - Rate limiting                                                │
│  - Input validation                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 3: Authentication (Current)                              │
│  - validateAuth middleware                                      │
│  - userId validation                                            │
│  - Request context                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 4: Authorization (Future)                                │
│  - Role-based access control                                    │
│  - Permission checks                                            │
│  - Resource ownership                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│  Layer 5: Data Security                                         │
│  - AES-256-GCM encryption                                       │
│  - Data retention policies                                      │
│  - Audit logging                                                │
└─────────────────────────────────────────────────────────────────┘
```

## Migration Path

### Phase 1: Current (Development) ✅
- userId-based authentication
- Simple validation
- No token management

### Phase 2: Hybrid (Transition)
- Support both userId and JWT
- Gradual client migration
- Backward compatibility

### Phase 3: Production (Target)
- JWT-only authentication
- Token refresh mechanism
- Role-based access control

---

**Last Updated**: February 8, 2026  
**Current Phase**: Phase 1 (Development)  
**Next Phase**: Phase 2 (Hybrid) - Add JWT support
