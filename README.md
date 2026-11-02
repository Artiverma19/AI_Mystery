# AI Mystery Room 🔍

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://ai-mysteryroom-t642.onrender.com/)

> **🌐 Live Application:** [https://ai-mysteryroom-t642.onrender.com/](https://ai-mysteryroom-t642.onrender.com/)

AI Mystery Room is a browser-based fictional mystery investigation game built using Spec-Driven Development. Players provide a short fictional scenario, and the server leverages Google Gemini (`@google/genai`) to generate a self-contained, logically sound investigation room complete with suspects, evidence, hints, and an isolated answer key.

---

## 🌟 Features

- **Gemini-Powered Case Generation:** Automatically generates a cohesive case with suspects, alibis, motives, and diverse evidence based on user premise.
- **Three Challenge Levels:**
  - **Easy:** 3 Suspects, 5 Evidence items, 2 Hints, 100 Base Points.
  - **Medium:** 4 Suspects, 7 Evidence items, 3 Hints, 150 Base Points.
  - **Hard:** 5 Suspects, 9 Evidence items, 3 Hints, 200 Base Points.
- **Diverse Fictional Evidence Types:** WhatsApp/chat logs, CCTV transcripts, scene photographs, documents, statements, and timeline logs.
- **Server-Side Answer Key Isolation:** Culprit identity and reasoning are never exposed to the client until the accusation is submitted.
- **Interactive Deduction & Scoring:**
  - Idempotent evidence discovery (+5 points per clue).
  - Progressive hints from subtle to direct (-10 points per hint used).
  - Single accusation per case.
  - Formula: `finalScore = max(0, (isCorrect ? basePoints : 0) + (uniqueDiscoveredEvidence * 5) - (hintsUsed * 10))`.
- **Responsive & Accessible UI:** Designed with React, Vite, and Tailwind CSS, fully responsive across mobile and desktop.

---

## 🏗️ Architecture & Technology Stack

```text
AI-MysteryRoom/
├── client/                 # React frontend (Vite, Tailwind CSS, React Router)
│   ├── src/
│   │   ├── components/     # AppHeader, SuspectCard, EvidenceCard, EvidenceViewer, etc.
│   │   ├── pages/          # Home, CreateCase, Investigation, Result
│   │   ├── services/       # API client
│   │   └── index.css       # Tailwind stylesheet
│   └── vite.config.js
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # MongoDB connection lifecycle
│   │   ├── controllers/    # Case lifecycle controller
│   │   ├── middleware/     # Error handler and canonical error contract
│   │   ├── models/         # Mongoose Case model
│   │   ├── routes/         # Express API routes
│   │   ├── services/       # Gemini generator, Scoring engine, Case serializer
│   │   └── validators/     # Zod contract schemas
│   └── tests/              # Unit & Integration test suites
├── SPEC.md                 # Single source of truth specification
└── README.md
```

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React, React Router 7.
- **Backend:** Node.js, Express, MongoDB (Mongoose), `@google/genai`, Zod, Dotenv, Cors.
- **Testing:** Vitest, Supertest, MongoMemoryServer.

---

## 🔑 Environment Variables

Create a `.env` file in the `server/` directory (see `server/.env.example`):

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-mystery-room
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

> **Security Note:** Never expose `GEMINI_API_KEY` to client-side code. Gemini is called strictly server-side.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Tests
```bash
npm --prefix server run test
```
All 33 unit and integration tests run against an in-memory MongoDB environment, validating Zod schemas, scoring math, answer-key isolation, and API endpoints.

### 3. Start Backend Server
```bash
npm --prefix server run dev
```
The server will start on `http://localhost:5000`.

### 4. Start Frontend Client
```bash
npm --prefix client run dev
```
Open your browser at `http://localhost:5173`.

### 5. Build for Production
```bash
npm --prefix client run build
```

---

## 📡 API Specification

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/cases` | Generate and persist a new mystery case |
| `GET` | `/api/cases/:id` | Retrieve player-safe case state (answer key excluded) |
| `POST` | `/api/cases/:id/evidence/:evidenceId/discover` | Mark an evidence item discovered (idempotent, +5 pts) |
| `POST` | `/api/cases/:id/hints` | Reveal the next progressive hint (-10 pts) |
| `POST` | `/api/cases/:id/accuse` | Submit the single culprit accusation and finalize score |
| `GET` | `/api/cases/:id/result` | Retrieve full verdict and explanation (completed cases only) |
| `GET` | `/api/health` | Service health check |

---

## ⚖️ Safety & Boundaries

All cases, events, clues, and suspects in AI Mystery Room are strictly fictional and intended for puzzle entertainment. The system enforces non-graphic descriptions and does not accept or generate real-world accusations.

