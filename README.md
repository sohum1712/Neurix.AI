# 🧠 Neurix.AI - AI-Powered Mental Wellness Platform

> **Two-liner:** An AI-powered mental wellness platform featuring real-time video conversations with AI companions, community support, and personalized wellness resources. Built with React, Node.js, Supabase Auth, Tavus AI Video, and Google Gemini.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

<p align="center">
  <img src="client/logo.png" alt="Neurix.AI Logo" width="120" />
</p>

---

## 🌟 What is Neurix.AI?

**Neurix.AI** is a comprehensive mental wellness platform that combines cutting-edge AI technology with human-centered design to provide accessible mental health support. The platform offers:

- **🤖 AI Video Companions** - Have real-time video conversations with empathetic AI avatars powered by Tavus
- **💬 24/7 AI Chat Support** - Instant text-based support through Google Gemini AI
- **👥 Community Support** - Connect with others on similar wellness journeys
- **📚 Wellness Resources** - Curated guides, videos, and audio content for mental health
- **📅 Session Booking** - Schedule sessions with professional counselors
- **🌐 Multi-language Support** - Access the platform in 11 Indian languages

---

## ✨ Key Features

### 🎥 AI Video Sessions (Tavus Integration)
Real-time video conversations with AI companions that understand, listen, and respond with empathy. The AI avatar maintains eye contact, responds naturally, and provides a safe space for users to express themselves.

### 🔐 Secure Authentication
- Email/Password authentication
- Google OAuth integration
- Password reset functionality
- Session persistence with secure token handling
- Role-based access control

### 🎨 Modern UI/UX
- Brutalist design system with glassmorphism effects
- Responsive mobile-first design
- Smooth Framer Motion animations
- WCAG AA accessibility compliance
- Dark theme optimized for wellness

### 💊 Wellness Tools
- Breathing exercises during loading screens
- 10+ instant stress relief tips
- Emergency helpline quick access
- Personalized dashboard with wellness stats

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 18 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| Tailwind CSS | Styling |
| Shadcn/UI | Component Library |
| Framer Motion | Animations |
| React Query | Data Fetching |
| React Router v6 | Navigation |
| i18next | Internationalization |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express.js | Web Framework |
| MongoDB | Database |
| Mongoose | ODM |

### External Services
| Service | Purpose |
|---------|---------|
| Supabase | Authentication & Database |
| Tavus API | AI Video Conversations |
| Google Gemini | AI Chat Assistant |
| Google Translate | Multi-language Support |

---

## 📁 Project Structure

```
neurix.ai/
├── 📂 client/                    # Frontend React Application
│   ├── 📂 src/
│   │   ├── 📂 components/        # Reusable UI Components
│   │   │   ├── 📂 ui/            # Shadcn UI Components (50+)
│   │   │   ├── ChatWidget.tsx    # AI Chat Interface
│   │   │   ├── EmergencyWidget.tsx
│   │   │   ├── NavigationUniversal.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   └── translate.tsx     # Multi-language Widget
│   │   ├── 📂 contexts/          # React Context Providers
│   │   │   ├── AuthContext.tsx   # Authentication State
│   │   │   └── TavusContext.tsx  # AI Video Session State
│   │   ├── 📂 pages/             # Route Pages
│   │   │   ├── Landing.tsx       # Homepage with AI Preview
│   │   │   ├── Dashboard.tsx     # User Dashboard
│   │   │   ├── TavusSession.tsx  # AI Video Session Hub
│   │   │   ├── AuthUniversal.tsx # Login/Signup
│   │   │   ├── AuthCallback.tsx  # OAuth Handler
│   │   │   ├── Settings.tsx      # User Settings
│   │   │   ├── Profile.tsx       # User Profile
│   │   │   ├── Booking.tsx       # Session Booking
│   │   │   ├── Community.tsx     # Community Posts
│   │   │   └── Resources.tsx     # Wellness Library
│   │   ├── 📂 hooks/             # Custom React Hooks
│   │   ├── 📂 lib/               # Utilities
│   │   ├── 📂 services/          # API Services
│   │   └── 📂 config/            # Configuration
│   ├── .env.example              # Environment Template
│   └── package.json
│
├── 📂 server/                    # Backend Node.js Application
│   ├── 📂 routes/                # API Routes
│   ├── 📂 middleware/            # Express Middleware
│   ├── 📂 models/                # MongoDB Models
│   ├── 📂 db/                    # Database Connection
│   ├── server.js                 # Entry Point
│   ├── .env.example              # Environment Template
│   └── package.json
│
├── README.md                     # This File
├── FEATURE_AUDIT.md              # Feature Status Document
└── LICENSE
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or bun package manager
- MongoDB Atlas account
- Supabase account
- Tavus API account (for AI video)
- Google AI Studio account (for Gemini)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/neurix.ai.git
cd neurix.ai
```

2. **Setup Frontend**
```bash
cd client
npm install
cp .env.example .env
# Edit .env with your credentials
```

3. **Setup Backend**
```bash
cd ../server
npm install
cp .env.example .env
# Edit .env with your credentials
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd server
npm start

# Terminal 2 - Frontend
cd client
npm run dev
```

5. **Access the Application**
```
http://localhost:8081
```

---

## 🔧 Environment Variables

### Client (`client/.env`)
```env
# API
VITE_API_BASE_URL=http://localhost:3001/api

# Supabase (Required)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Tavus AI (Required for video sessions)
VITE_TAVUS_API_KEY=your_tavus_api_key
VITE_TAVUS_API_URL=https://tavusapi.com/v2
VITE_TAVUS_REPLICA_ID=your_replica_id

# App Config
VITE_APP_URL=http://localhost:8081
```

### Server (`server/.env`)
```env
# Server
PORT=3001
NODE_ENV=development

# MongoDB (Required)
MONGODB_URI=your_mongodb_connection_string

# Tavus AI
TAVUS_API_KEY=your_tavus_api_key
TAVUS_REPLICA_ID=your_replica_id

# Google Gemini (Required for chat)
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

---

## 📊 Feature Status

| Feature | Status | Description |
|---------|--------|-------------|
| Authentication | ✅ Complete | Email/Password + Google OAuth |
| AI Video Sessions | ✅ Complete | Tavus integration with live preview |
| Dashboard | ✅ Complete | Stats, quick actions, session history |
| AI Chat Widget | ✅ Complete | Gemini-powered 24/7 support |
| Session Booking | ✅ Complete | Multi-step booking flow |
| Community | 🔄 Mock Data | Posts, likes (needs backend API) |
| Resources | ✅ Complete | Filter, search, categories |
| Multi-language | ✅ Complete | 11 Indian languages |
| Settings | ✅ Complete | Profile, appearance, privacy |
| Emergency Widget | ✅ Complete | Quick helpline access |

[View detailed feature audit →](FEATURE_AUDIT.md)

---

## 🖼️ Screenshots

<details>
<summary>Click to view screenshots</summary>

### Landing Page
- Hero section with AI avatar video preview
- Animated feature cards
- Statistics section
- Call-to-action

### Dashboard
- Wellness stats cards
- Recent session history
- Quick action buttons
- AI companion preview

### AI Session Hub
- Pre-flight camera/mic checks
- Session features overview
- Professional UI design

### Settings
- Profile management
- Appearance settings
- Privacy controls
- Notification preferences

</details>

---

## 🚢 Deployment

### Frontend (Vercel/Netlify)
```bash
# Build command
npm run build

# Output directory
dist
```

### Backend (Railway/Render/AWS)
```bash
# Start command
npm start

# Port
3001 (or process.env.PORT)
```

### Supabase Setup
1. Create new project at supabase.com
2. Create `profiles` table:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```
3. Enable Row Level Security (RLS)
4. Configure OAuth providers

---

## 🔒 Security

- ✅ All API keys stored in environment variables
- ✅ .env files excluded from git
- ✅ Supabase RLS policies enabled
- ✅ Rate limiting configured
- ✅ Input validation on all forms
- ✅ HTTPS enforced in production

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👏 Acknowledgments

- [Tavus](https://tavus.io) - AI Video Platform
- [Supabase](https://supabase.com) - Backend as a Service
- [Google AI](https://ai.google.dev) - Gemini API
- [Shadcn/UI](https://ui.shadcn.com) - UI Components
- [Lucide](https://lucide.dev) - Icons

---

## 📞 Support

- **Emergency Helpline**: [Tele-MANAS](https://telemanas.mohfw.gov.in/home) (24/7)
- **Issues**: [GitHub Issues](https://github.com/yourusername/neurix.ai/issues)
- **Email**: support@neurix.ai

---

<p align="center">
  Made with 💙 for mental wellness
</p>
