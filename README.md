# 🚀 AI Resume Builder & Analyzer (MERN)

[![Groq Llama-3.3-70B](https://img.shields.io/badge/AI-Groq%20Llama--3.3--70B-orange)](https://groq.com)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)](https://react.dev)

An AI-powered, production-grade web application designed to build ATS-optimized resumes, perform instant AI screening audits, track career progress, and manage personalized student profiles using Groq's Llama-3.3-70B model.

**Cost:** **$0**. Uses Groq's free API tier for AI analysis and MongoDB Atlas free tier (or local MongoDB) for database storage.

---

## ✨ Key Features

- **ATS-Optimized Resume Builder:** Draft, edit, and compile professional resumes with real-time PDF previews.
- **AI-Powered Screening & Parsing:** Upload PDF/DOCX resumes for instant ATS compatibility scores, strengths, weaknesses, and keyword recommendations powered by Llama-3.3-70B.
- **Student Profile & Dashboard:** Personal profile hub tracking total resumes created, AI analyses completed, peak ATS scores, project counts, and PDF downloads.
- **AI Personalization Controls:** Opt-in toggle allowing AI engines to use stored background details to auto-fill forms and generate targeted summaries.
- **LinkedIn & GitHub Integration:** Seamlessly add and link professional LinkedIn and GitHub profiles directly to user accounts.
- **Privacy & Data Control:** Trust-focused section allowing users to update info, stream full JSON data exports, or permanently delete accounts.
- **Recent Activity Timeline:** Real-time event log tracking resume creation, updates, ATS audits, PDF exports, and AI suggestions.
- **AI-Powered Grammar & Style Fixer:** Correct spelling, syntax, and action-verb impact in real-time.
- **Invisible Text Layer PDF Embedding:** Embeds a searchable plain-text layer on PDF exports to guarantee 100% ATS readability.

---

## 🔒 Security & Architecture

### 1. Session Protection (JWT + HttpOnly Cookies)
- **Short-Lived Access Tokens**: Stored strictly in memory on the client side (mitigating XSS vulnerabilities).
- **HttpOnly Refresh Cookies**: Long-lived Refresh Tokens stored in `HttpOnly`, `SameSite=Strict`, `Secure` cookies.
- **Refresh Token Rotation (RTR)**: Rotates token pairs on every refresh to invalidate stolen sessions.
- **Automatic Session Restoration**: Client auto-restores in-memory tokens on page startup without unauthenticated errors.

### 2. NoSQL & Input Protection
- **Sanitization**: Equipped with `express-mongo-sanitize` to strip `$` and `.` operators.
- **Schema Validation**: All payloads validated with Zod schemas.

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (v18.x or higher)
- MongoDB (local or MongoDB Atlas connection string)
- Groq API Key
- Google Client ID (for Google OAuth)

---

### Step-by-Step Installation

#### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
```

Configure `.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/resume_ai
GROQ_API_KEY=your_groq_api_key_here
JWT_SECRET=your_strong_jwt_secret_here
ALLOWED_ORIGINS=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id_here
```

Start dev server:
```bash
npm run dev
```

#### 2. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
```

Configure `.env`:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

Start dev server:
```bash
npm run dev
```

Access app at `http://localhost:5173`.

---

## 📁 Architecture Directory Structure

```
.
├── backend (Express/Node)
│   ├── middleware/     → Rate-limiting, Zod validation, security, error handling
│   ├── models/         → User, Resume, and RefreshToken schemas
│   ├── routes/         → auth.js, analyze.js, resume.js, user.js
│   ├── uploads/        → Temporary storage for resume uploads (.pdf, .docx)
│   ├── utils/          → Token utilities, email, and resume text parsing
│   ├── validators/     → Input schemas & Zod validators
│   └── server.js       → Application entry point
└── frontend (React/Vite)
    ├── src/
    │   ├── api.js      → Axios instance & profile API helpers
    │   ├── pages/      → Profile.jsx, ResumeBuilder.jsx, ResumeAnalyzer.jsx, Auth.jsx, ResetPassword.jsx
    │   └── main.jsx    → Frontend entry point
    └── index.html      → Base HTML template
```
