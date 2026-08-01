# 🚀 AI Resume Builder & Analyzer (MERN)

[![GitHub License](https://img.shields.io/github/license/groq/groq-feedback-app?color=blue)](LICENSE)
[![Groq Llama-3.3-70B](https://img.shields.io/badge/AI-Groq%20Llama--3.3--70B-orange)](https://groq.com)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)](https://react.dev)

An AI-powered, production-grade application designed to build ATS-optimized resumes and provide real-time, detailed AI screening analysis utilizing Groq's Llama-3.3-70B model.

**Cost:** **$0**. Uses Groq's free API tier for AI analysis and MongoDB Atlas free tier (or local MongoDB) for database storage.

---

## ✨ Features

- **ATS-Optimized Resume Builder:** Seamlessly draft and compile professional resumes.
- **AI-Powered Screening & Parsing:** Upload your PDF/DOCX resume and receive instant feedback, scores, and improvement recommendations from Llama-3.3-70B.
- **Production-Grade Security:** Out-of-the-box configurations preventing major Web/NoSQL vulnerabilities.
- **Invisible Text Layer Embedding:** Preserves high-fidelity visual PDF representations while embedding searchable/readable plain text for ATS parsers.

---

## 🔒 Advanced Security Implementations

This project includes production-grade security implementations to prevent common web application vulnerabilities:

### 1. Session Hijacking Prevention (JWT + HttpOnly Cookie Rotation)
*   **Short-Lived Access Tokens**: JWT Access Tokens are valid for only **15 minutes** and are stored **strictly in-memory** on the frontend (never saved to `localStorage` or standard cookies, mitigating XSS attacks).
*   **HttpOnly Refresh Cookies**: Long-lived Refresh Tokens are stored in a secure cookie with the flags `HttpOnly`, `SameSite=Strict`, `Secure` (production), and restricted to `/api/auth`. JavaScript cannot access this cookie.
*   **Refresh Token Rotation (RTR)**: Every call to `/api/auth/refresh` deletes the old refresh token database record and issues a brand-new pair, making intercepted refresh tokens useless.
*   **Client Fingerprinting**: Tokens are bound to a browser fingerprint (User-Agent hash) — if an attacker steals an active session token and attempts to use it from another device, the request is rejected.
*   **DB-Backed Token Invalidation**: Logout cleanly deletes active sessions from MongoDB.

### 2. NoSQL Injection Prevention
*   **Input Sanitization**: Equipped with `express-mongo-sanitize` to strip prohibited characters (`$` and `.`) from all payloads, preventing attackers from bypassing login with queries like `{ "email": { "$gt": "" } }`.
*   **Zod Schema Hardening**: All inputs are strictly checked against schemas with `.strip()` enabled, discarding any unknown properties or malicious query objects.

### 3. Invisible Text PDF Layer (ATS-Friendliness Fix)
*   Standard client-side PDF libraries (like `html2pdf.js`) generate PDFs by capturing an image screenshot of the HTML canvas, meaning there is no selectable text layer. This fails ATS filters and backend text parsing.
*   **Our Solution**: When generating the PDF, we extract a plain-text version of the resume and embed it as an **invisible, selectable text layer** (white color, 1pt size) on the PDF page. The PDF remains visually perfect while being **100% readable by ATS systems** and backend parser engines.

### 4. Google OAuth & Email Verification Flows
*   **Google OAuth Integration**: Allows seamless authentication using Google Accounts with secure JWT generation.
*   **Nodemailer Email Workflows**: Integrated system for secure transactional emails, including HTML-styled password resets and verification.

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (v18.x or higher recommended)
- [MongoDB](https://www.mongodb.com/try/download/community) (running locally or MongoDB Atlas connection string)
- [Groq API Key](https://console.groq.com)
- [Google Client ID](https://console.cloud.google.com) (for Google OAuth authentication)
- SMTP Server details (Gmail App Password, Mailtrap, etc. for email notifications)

---

### Step-by-Step Installation

#### 1. Obtain API Credentials
1. **Groq Key**: Navigate to [console.groq.com/keys](https://console.groq.com/keys), sign up/log in, and click **"Create API Key"**.
2. **Google Client ID**: Navigate to [console.cloud.google.com](https://console.cloud.google.com), create a project, go to APIs & Services → Credentials, configure the OAuth Consent Screen, create an OAuth 2.0 Client ID, and add `http://localhost:5173` to the Authorized JavaScript Origins.

#### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Copy the template environment file:
   - **Linux/macOS:**
     ```bash
     cp .env.example .env
     ```
   - **Windows (Command Prompt):**
     ```cmd
     copy .env.example .env
     ```
   - **Windows (PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
4. Open the newly created `.env` file and configure your variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/resume_ai
   GROQ_API_KEY=your_groq_api_key_here
   JWT_SECRET=your_strong_jwt_secret_here
   ALLOWED_ORIGINS=http://localhost:5173

   # Google OAuth
   GOOGLE_CLIENT_ID=your_google_client_id_here

   # Email (Nodemailer)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email_here
   EMAIL_PASS=your_email_app_password_here
   EMAIL_FROM="Resume AI <your_email_here>"

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```
5. Spin up the backend development server:
   ```bash
   npm run dev
   ```
   *Note: If MongoDB is not connected, the server will start and the **Analyzer** (which is stateless) will still function. Only saving resume records requires MongoDB.*

#### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Copy the template environment file:
   - **Linux/macOS:**
     ```bash
     cp .env.example .env
     ```
   - **Windows (Command Prompt / PowerShell):**
     ```powershell
     Copy-Item .env.example .env
     ```
4. Open `.env` and enter your Google Client ID:
   ```env
   VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
   ```
5. Start the frontend development server:
   ```bash
   npm run dev
   ```
6. Access the web interface at `http://localhost:5173`.

---

## 📁 Architecture Directory Structure

```
.
├── backend (Express/Node)
│   ├── middleware/     → Rate-limiting, Zod schema validation, error handlers
│   ├── models/         → User database schema and TTL-indexed RefreshToken database
│   ├── routes/         → Endpoint routes (auth, analyze, resume)
│   ├── uploads/        → Temporary folder for resume uploads (.pdf, .docx)
│   ├── utils/          → Token fingerprinting, emailUtils.js, & parseResume (pdf-parse / mammoth)
│   ├── validators/     → Input schemas & Zod validators (authValidator.js)
│   └── server.js       → Server entry point & DB connections
└── frontend (React/Vite)
    ├── src/
    │   ├── api.js      → Axios interceptor instance (automates silent token refresh)
    │   ├── pages/      → Auth.jsx, ResetPassword.jsx, ResumeBuilder.jsx, ResumeAnalyzer.jsx
    │   └── main.jsx    → Application entry point
    └── index.html      → Base HTML template
```
