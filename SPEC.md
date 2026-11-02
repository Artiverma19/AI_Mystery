# AI Mystery Room — Single Source of Truth
## Product & Technical Specification (`SPEC.md`)

**Document status:** Implementation baseline  
**Version:** 1.0  
**Purpose:** This document is the authoritative specification for Codex and all contributors. If code, prompts, UI, or other documents conflict with this file, follow this specification and update the conflicting artifact.

---

## 1. Project Overview

AI Mystery Room is an AI-powered, browser-based investigation game. A player submits a short fictional scenario, premise, or story. The backend uses Google Gemini to turn that premise into a self-contained mystery challenge with a hidden culprit and a collection of fictional evidence.

Evidence may include:
- WhatsApp-style chat transcripts or message screenshots.
- Still images, such as fictional scene photographs or objects.
- CCTV-style clips or simulated camera recordings.
- Written statements, timelines, documents, and other evidence cards.

The evidence and its presentation are generated or assembled by AI. The player investigates the evidence, forms a theory, and selects one suspect as the culprit. The application then reveals the verdict, explains how the evidence supports the solution, and shows a score.

**Important product boundary:** All cases, people, events, messages, and media are fictional and for entertainment. Do not present generated evidence as real-world evidence. Label generated media as AI-generated or fictional. Do not use real people's private information or likenesses without permission.

### 1.1 Problem Statement
Many mystery games provide fixed stories with limited replayability. AI Mystery Room lets players turn their own story premises into fresh, structured investigation challenges.

### 1.2 Product Goals
1. Let a user create a mystery from a short premise.
2. Generate a coherent case with suspects, clues, evidence, and one intended culprit.
3. Provide an engaging investigation interface for reviewing evidence.
4. Let the player submit a culprit accusation.
5. Reveal a logically supported solution and score.
6. Keep the solution secure on the server until the player submits an accusation.
7. Support responsive use on desktop and mobile.

### 1.3 Non-Goals for MVP
- Real-world crime reporting or investigative use.
- Multiplayer, accounts, social features, leaderboards, or payments.
- User uploads of real evidence.
- Live CCTV streaming or real video analysis.
- Open-ended chat with the AI during an active case.
- Training or fine-tuning a model.
- Guaranteed production-grade image/video generation from Gemini. For MVP, visual evidence may be represented with generated image assets when an image-generation provider is configured, or by clearly labeled illustrated placeholders / text-based evidence when it is not. Do not claim a generated video exists if the system only displays a mock transcript or storyboard.

---

## 2. Users and Experience

### 2.1 Target Users
Casual players, puzzle fans, and students seeking a fictional interactive mystery experience.

### 2.2 Main User Journey
1. Open the home page.
2. Enter a short fictional premise.
3. Choose difficulty.
4. Start case generation and see a loading/progress state.
5. Enter the investigation room after a valid case is created.
6. Review the case briefing, suspects, and evidence.
7. Discover clues and optionally request hints.
8. Select one suspect and submit an accusation.
9. See the verdict, culprit, explanation, evidence connections, and score.
10. Start a new case or return home.

### 2.3 UX Principles
- Clear, immersive, readable, and accessible.
- No premature disclosure of the culprit or solution.
- Evidence should be easy to distinguish by type and source.
- Explain how to proceed; avoid dead ends.
- Loading, empty, error, and success states must be designed.
- On small screens, evidence cards stack; desktop may use a two-column investigation layout.

---

## 3. Scope and Difficulty

### 3.1 MVP Features
- Home / landing page.
- Premise entry and difficulty selection.
- Gemini-powered case generation.
- Investigation room with briefing, suspect list, evidence board, and progress.
- Evidence detail view / modal.
- Clue discovery tracking.
- Hint request and display.
- Suspect accusation.
- Server-calculated score.
- Results page with verdict and explanation.
- Start-new-case flow.
- Responsive layout and accessible controls.
- API validation, error handling, and basic abuse protection.

### 3.2 Difficulty Configuration
| Difficulty | Suspects | Evidence items | Hints available | Base correct-accusation points |
|---|---:|---:|---:|---:|
| Easy | 3 | 5 | 2 | 100 |
| Medium | 4 | 7 | 3 | 150 |
| Hard | 5 | 9 | 3 | 200 |

The generated case must contain exactly one intended culprit, selected from the suspect list. Every difficulty must produce the counts in this table. If generation fails validation, retry a limited number of times and then return a recoverable error.

---

## 4. Functional Requirements

### FR-01: Create Case
- User provides a premise between 20 and 1,000 characters.
- User selects Easy, Medium, or Hard.
- Backend validates inputs and requests structured case content from Gemini.
- Backend validates the model output before saving.
- Return a case ID and only player-safe case data.
- Never send the culprit ID, solution, private answer key, or hidden reasoning to the client before accusation.

### FR-02: Case Briefing
Show the case title, premise-derived briefing, setting, incident, and investigation objective. Avoid revealing the culprit.

### FR-03: Suspect List
Each suspect has:
- Stable suspect ID.
- Display name.
- Fictional age range or adult age (avoid unnecessary sensitive details).
- Relationship to the incident.
- Public profile / statement.
- Motive or opportunity information that may be suspicious but is not conclusive.
- Optional AI-generated portrait or a clearly labeled placeholder.

Suspect descriptions must not identify the culprit outright.

### FR-04: Evidence
Each evidence item has:
- Stable evidence ID.
- Evidence type.
- Title and short description.
- Fictional source / origin.
- Content or media reference.
- Relevance / clue text, hidden until discovered where applicable.
- Optional timestamp and location within the fictional story.
- AI-generated / fictional label.

Evidence types supported in MVP:
`chat`, `image`, `camera_record`, `document`, `statement`, `timeline`.

Evidence must be internally consistent with the case timeline and the intended solution. Evidence can be ambiguous, but the final solution must be fairly deducible. Do not fabricate a media URL. A camera-record item may be a generated still, storyboard, or transcript in MVP; label its actual format accurately.

### FR-05: Discover Evidence
- Player opens an evidence item and marks it discovered.
- Backend records discovery once per item.
- Repeated discovery requests must be idempotent.
- Discovery awards points only once.
- UI shows discovered / undiscovered state and progress.

### FR-06: Hints
- Player can request a hint while the case is active.
- Hints are ordered from subtle to more direct.
- Backend reveals the next unused hint and tracks its use.
- Hint count is limited by difficulty.
- Hint requests are idempotent or protected against duplicate submissions.
- Hints must not directly name the culprit unless the final hint is intentionally defined as a near-explicit clue; prefer clue interpretation instead.

### FR-07: Accusation
- Player selects one suspect and submits one accusation per case.
- Backend validates that the suspect belongs to the case and the case is active.
- Backend compares the submitted suspect ID with the server-only culprit ID.
- Backend finalizes the case and calculates score.
- Subsequent accusations are rejected with a conflict response.
- Results reveal the culprit and explanation only after this endpoint succeeds.

### FR-08: Results
Display:
- Correct / incorrect verdict.
- Culprit's name and profile.
- Explanation of the motive, method, and opportunity in non-graphic terms.
- Evidence-to-solution reasoning using evidence IDs/titles.
- Player's accusation.
- Discovered evidence count and hints used.
- Final score.
- Replay / create another case action.

### FR-09: Persistence
- Cases and progress persist in MongoDB.
- A case can be retrieved by ID after refresh.
- No user account is required for MVP; case ID is the access handle.
- Do not treat an unguessable case ID alone as a substitute for authorization in a later account-based version. Use strong random IDs and basic rate limits in MVP.

---

## 5. Scoring

Scoring is calculated exclusively on the backend.

**Formula:**
- Correct accusation: difficulty base points.
- Each unique discovered evidence item: +5 points.
- Each hint used: −10 points.
- Incorrect accusation: 0 base points; discovered-evidence and hint adjustments still apply.
- Minimum final score: 0.

`finalScore = max(0, (isCorrect ? basePoints : 0) + (uniqueDiscoveredEvidenceCount * 5) - (hintsUsedCount * 10))`

The score is finalized once when the accusation is submitted. The client must never submit a score or scoring parameters.

---

## 6. AI Generation and Validation

### 6.1 Provider
Google Gemini via the official server-side SDK. Keep the model name configurable through environment variables. Use a supported Gemini model selected at implementation time; do not hardcode assumptions about model availability.

### 6.2 Generation Requirements
The model must produce structured JSON matching the schema in Section 7. The generation instruction must require:
- Exactly one culprit, referenced by suspect ID.
- Counts matching the selected difficulty.
- A coherent fictional case and chronology.
- Evidence that supports the solution without making it obvious too early.
- No contradictions between statements, timestamps, evidence, and answer key.
- A concise explanation that connects evidence to the culprit.
- Hints ordered from subtle to direct.
- Fictional, non-graphic content suitable for a broad audience.
- No real private data, actual accusations against real people, or real-world crime instructions.

### 6.3 Validation
- Parse model output as JSON; reject malformed output.
- Validate with Zod on the backend.
- Verify suspect and evidence IDs are unique.
- Verify culprit ID matches one suspect.
- Verify all difficulty counts.
- Verify hint count.
- Verify explanation references existing evidence.
- Verify evidence types are in the allowed enum.
- Do not rely on model-generated score or trust model assertions as validation.
- Retry generation at most 2 times after the initial attempt (3 total attempts). If still invalid, return a safe generation error.

### 6.4 Media Generation Strategy
MVP must support mixed evidence formats without depending on unavailable capabilities:
1. Chat evidence: render a fictional chat UI from structured message data.
2. Image evidence: use a configured image-generation service if available; otherwise use an explicitly labeled visual placeholder or text description.
3. Camera-record evidence: represent as a camera still, storyboard, or transcript. Do not imply actual video generation unless a real video asset exists.
4. All media references must be validated and stored as provider output or application-owned assets.
5. Do not expose provider API keys or internal prompts to the browser.

Gemini text generation alone must not be assumed to create image/video files. If a separate media provider is introduced, document its API, cost, and failure behavior in this file before implementation.

---

## 7. Canonical Data Contracts

These structures are the canonical source of truth. Names may be adjusted only if the entire spec and code are updated together.

### 7.1 Generated Case (server-side; includes answer key)
```json
{
  "title": "string",
  "briefing": "string",
  "setting": "string",
  "incident": "string",
  "difficulty": "easy | medium | hard",
  "suspects": [
    {
      "id": "string",
      "name": "string",
      "profile": "string",
      "statement": "string",
      "motive": "string",
      "opportunity": "string",
      "portrait": {
        "kind": "generated | placeholder",
        "assetUrl": "string | null",
        "alt": "string"
      }
    }
  ],
  "evidence": [
    {
      "id": "string",
      "type": "chat | image | camera_record | document | statement | timeline",
      "title": "string",
      "description": "string",
      "source": "string",
      "content": "string",
      "assetUrl": "string | null",
      "timestamp": "string | null",
      "location": "string | null",
      "isClue": "boolean"
    }
  ],
  "hints": ["string"],
  "answerKey": {
    "culpritSuspectId": "string",
    "motive": "string",
    "method": "string",
    "opportunity": "string",
    "explanation": "string",
    "supportingEvidenceIds": ["string"]
  }
}
```

### 7.2 Persisted Case
```json
{
  "_id": "ObjectId",
  "title": "string",
  "briefing": "string",
  "setting": "string",
  "incident": "string",
  "difficulty": "easy | medium | hard",
  "suspects": ["Suspect"],
  "evidence": ["Evidence"],
  "hints": ["string"],
  "answerKey": "AnswerKey (server-only)",
  "status": "active | completed",
  "discoveredEvidenceIds": ["string"],
  "hintsUsed": "number",
  "accusationSuspectId": "string | null",
  "isCorrect": "boolean | null",
  "score": "number | null",
  "createdAt": "Date",
  "completedAt": "Date | null"
}
```

### 7.3 Player-Safe Case Response
The response must be an explicit allowlist, never a raw database document:
```json
{
  "id": "string",
  "title": "string",
  "briefing": "string",
  "setting": "string",
  "incident": "string",
  "difficulty": "easy | medium | hard",
  "suspects": ["Suspect without private answer-key fields"],
  "evidence": ["Evidence with undiscovered clue content omitted"],
  "discoveredEvidenceIds": ["string"],
  "hintsUsed": "number",
  "hintsRemaining": "number",
  "status": "active | completed"
}
```

**Security rule:** `answerKey` must never be serialized in an active-case API response, embedded in HTML, included in frontend state, or exposed in client bundles/logs. On completion, return a dedicated result response containing only the required reveal fields.

---

## 8. API Specification

Base path: `/api`. JSON requests and responses. Use consistent error format:
```json
{
  "error": {
    "code": "MACHINE_READABLE_CODE",
    "message": "Human-readable message"
  }
}
```

### Endpoints
| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/cases` | Generate and create a case |
| `GET` | `/api/cases/:id` | Retrieve player-safe case state |
| `POST` | `/api/cases/:id/evidence/:evidenceId/discover` | Mark evidence discovered |
| `POST` | `/api/cases/:id/hints` | Reveal next hint |
| `POST` | `/api/cases/:id/accuse` | Submit accusation and finalize |
| `GET` | `/api/cases/:id/result` | Retrieve result only for completed case |
| `GET` | `/api/health` | Health check |

### 8.1 Create Case
Request:
```json
{ "premise": "string", "difficulty": "easy | medium | hard" }
```
Success: `201 Created`
```json
{ "case": "PlayerSafeCase" }
```
Validation: premise length 20–1000; difficulty must be allowed.

### 8.2 Get Case
Success: `200 OK`
```json
{ "case": "PlayerSafeCase" }
```
Unknown ID: `404 CASE_NOT_FOUND`.

### 8.3 Discover Evidence
Request body: `{}`  
Success: `200 OK`
```json
{
  "discoveredEvidenceIds": ["string"],
  "newlyDiscovered": true,
  "scorePreview": "number"
}
```
`scorePreview` is optional and must not include hidden answer information. If omitted, omit it consistently.

### 8.4 Request Hint
Request body: `{}`  
Success:
```json
{ "hint": "string", "hintsUsed": "number", "hintsRemaining": "number" }
```
No hints remaining: `409 NO_HINTS_REMAINING`.

### 8.5 Accuse
Request:
```json
{ "suspectId": "string" }
```
Success: `200 OK`
```json
{
  "result": {
    "isCorrect": "boolean",
    "accusedSuspectId": "string",
    "culprit": "Suspect",
    "explanation": "string",
    "motive": "string",
    "method": "string",
    "opportunity": "string",
    "supportingEvidence": ["Evidence summary"],
    "discoveredEvidenceCount": "number",
    "hintsUsed": "number",
    "score": "number"
  }
}
```
Reject invalid suspect with `400 INVALID_SUSPECT`; completed case with `409 CASE_ALREADY_COMPLETED`.

### 8.6 Get Result
- Active case: `409 CASE_NOT_COMPLETED`.
- Completed case: same result shape as accusation response.

### 8.7 Error Codes
`400 INVALID_INPUT`, `400 INVALID_SUSPECT`, `404 CASE_NOT_FOUND`, `409 CASE_ALREADY_COMPLETED`, `409 NO_HINTS_REMAINING`, `409 CASE_NOT_COMPLETED`, `429 RATE_LIMITED`, `500 INTERNAL_ERROR`, `502 AI_GENERATION_FAILED`.

---

## 9. Frontend Page and Component Specifications

### 9.1 Pages
1. **Home (`/`)**
   - Product name and short explanation.
   - CTA: “Create a Mystery”.
   - Brief feature preview and fictional-content notice.

2. **Create Mystery (`/create`)**
   - Premise textarea with character counter and validation.
   - Difficulty selector.
   - Submit CTA.
   - Loading state with progress copy; prevent duplicate submission.
   - Error state with retry.

3. **Investigation (`/case/:id`)**
   - Case title, briefing, incident, difficulty badge.
   - Suspect cards.
   - Evidence board grouped by evidence type.
   - Evidence detail drawer/modal.
   - Discover evidence action.
   - Hint action with remaining count and confirmation/reveal state.
   - Progress indicator.
   - Accusation panel with suspect selection and confirmation.
   - No culprit-revealing labels or client-side answer data.

4. **Results (`/case/:id/result`)**
   - Verdict and score.
   - Culprit profile.
   - Explanation and supporting evidence.
   - Discovered evidence / hints summary.
   - “Create another mystery” CTA.

### 9.2 Shared Components
- `AppHeader`
- `Button`
- `DifficultySelector`
- `PremiseForm`
- `LoadingState`
- `ErrorState`
- `SuspectCard`
- `EvidenceCard`
- `EvidenceViewer`
- `HintPanel`
- `ProgressIndicator`
- `AccusationPanel`
- `ResultSummary`
- `FictionalMediaLabel`

### 9.3 UI States
For all async actions, provide:
- Idle.
- Loading / disabled.
- Success.
- Recoverable error with retry.
- Empty state where applicable.

### 9.4 Accessibility and Responsive Behavior
- Semantic headings and buttons.
- Keyboard navigation and visible focus.
- Accessible labels for form controls.
- Do not rely on color alone for status.
- Dialogs support keyboard close and focus management.
- Respect reduced-motion preferences.
- Mobile-first responsive design; no horizontal overflow at 320px width.

---

## 10. Technology Stack and Architecture

### Frontend
- React
- Vite
- React Router
- Tailwind CSS
- Fetch or Axios for API requests

### Backend
- Node.js
- Express
- MongoDB
- Mongoose
- Gemini SDK
- Zod for validation
- dotenv for environment configuration

### Architecture
- React client communicates only with Express API.
- Express owns validation, Gemini calls, persistence, scoring, and answer-key access.
- MongoDB stores cases and progress.
- Gemini is called from the server only.
- Frontend must not call Gemini directly.

### Suggested Repository Structure
```text
ai-mystery-room/
├── client/
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── features/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── styles/
│   └── ...
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   ├── gemini/
│   │   │   ├── case/
│   │   │   └── scoring/
│   │   ├── validators/
│   │   ├── middleware/
│   │   └── app.js
│   └── ...
├── SPEC.md
├── README.md
└── .gitignore
```

Codex may adjust folder names for maintainability, but must preserve the responsibilities and API contracts in this spec.

---

## 11. Environment Variables and Secrets

Backend `.env`:
```env
PORT=5000
MONGODB_URI=
GEMINI_API_KEY=
GEMINI_MODEL=
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

- Add `.env` to `.gitignore`.
- Commit `.env.example` with empty / placeholder values only.
- Never put `GEMINI_API_KEY` in a `VITE_` variable or frontend code.
- Validate required environment variables at server startup.
- Never log API keys, full prompts containing secrets, or answer keys.

---

## 12. Security, Privacy, and Reliability
- Validate and sanitize all client inputs.
- Use a request body size limit.
- Configure CORS for the client origin.
- Add rate limiting to case creation and hint endpoints.
- Use strong random case identifiers; do not expose sequential IDs.
- Do not return raw Mongoose documents.
- Keep answer key server-only until accusation.
- Make discovery and accusation updates atomic where practical.
- Prevent repeated scoring and hint/discovery farming.
- Use generic client errors; log safe diagnostic details server-side.
- Avoid storing user-identifying information; MVP requires no account.
- All stories and generated media must be fictional and clearly labeled.
- Do not accept or generate explicit, graphic, or exploitative content.

---

## 13. Testing Requirements

### Unit Tests
- Premise and difficulty validation.
- Gemini JSON parsing and Zod validation.
- Difficulty counts and unique IDs.
- Scoring formula including floor at zero.
- Correct and incorrect accusation.
- Hint limits.
- Answer-key redaction in active-case responses.

### API / Integration Tests
- Create case for each difficulty.
- Get case returns safe response only.
- Discover same evidence twice awards only once.
- Hint count cannot exceed allowed amount.
- Invalid suspect ID is rejected.
- Accusation finalizes once.
- Result endpoint blocks active cases.
- Completed result includes correct culprit and explanation.
- AI failure returns a recoverable error.

### Manual Acceptance Test
1. Create an Easy, Medium, and Hard mystery.
2. Confirm each has exact required counts.
3. Open all evidence types and verify labels and display.
4. Refresh the investigation page and confirm progress persists.
5. Request hints up to the limit; verify the next request is rejected.
6. Accuse a suspect and verify verdict and score.
7. Confirm active API responses and browser state never contain the answer key.
8. Start a new mystery.
9. Test mobile layout and deployed environment.

---

## 14. Acceptance Criteria / Definition of Done
The MVP is complete only when:
- [ ] User can submit a premise and select all three difficulty levels.
- [ ] Backend creates a valid case with exactly one culprit.
- [ ] Suspect and evidence counts match difficulty configuration.
- [ ] Evidence is fictional, correctly typed, and labeled.
- [ ] The player can inspect evidence and discover it.
- [ ] Hints work and are limited by difficulty.
- [ ] Player can accuse a suspect exactly once.
- [ ] Culprit and solution remain private until accusation.
- [ ] Backend calculates score according to Section 5.
- [ ] Results show verdict, culprit, explanation, and score.
- [ ] Case progress persists across refresh.
- [ ] API failures and invalid AI output are handled gracefully.
- [ ] App is responsive and accessible.
- [ ] Automated tests for critical rules pass.
- [ ] Production deployment works end-to-end.
- [ ] README explains setup, environment variables, architecture, and deployment.

---

## 15. Codex Implementation Instructions

Treat this file as the single source of truth.

1. Read all of `SPEC.md` before making changes.
2. Implement in small, verifiable phases; do not generate the whole application in one unreviewed pass.
3. Before coding, summarize the architecture and implementation plan, identify ambiguities, and state any assumptions. Do not silently change product requirements.
4. Build backend contracts and tests before connecting the UI.
5. Implement the case-generation service with structured output and server-side validation.
6. Implement answer-key isolation before building result UI.
7. Build frontend pages against the API contracts in Section 8.
8. Run tests and fix failures before proceeding.
9. Do not add features outside the MVP unless requested.
10. Keep this spec updated if a requirement or API contract changes. Do not allow code and spec to drift.
11. Never claim a feature, test, or deployment is complete unless it has actually been implemented and verified.
12. If a requirement cannot be implemented with the configured providers or available credentials, explain the limitation and propose the smallest spec-approved fallback.

**Initial Codex task:** Read `SPEC.md`, inspect the repository, and return a concise implementation plan with phases, key files, and risks. Do not start coding until the plan is approved.
