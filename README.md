<div align="center">
  <img src="frontend/src/assets/hero.png" alt="SumeetAI" width="560" />

  # 🤖 SumeetAI — Multi-Agent AI Studio

  **A microservices AI platform where one chat routes your prompt to the right specialist agent — chat, web search, coding, document & slide generation, image generation, image analysis, and PDF Q&A.**

  🌐 **Live:** https://sumeetai.vercel.app

  ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
  ![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
  ![Node](https://img.shields.io/badge/Node-20+-339933?logo=nodedotjs&logoColor=white)
  ![LangGraph](https://img.shields.io/badge/LangGraph-StateGraph-1C3C3C)
  ![Docker](https://img.shields.io/badge/Docker-compose-2496ED?logo=docker&logoColor=white)
  ![AWS](https://img.shields.io/badge/AWS-ECS%20Fargate-232F3E?logo=amazonaws&logoColor=white)
</div>

---

## ✨ What it does

Send one message. A **LangGraph router** decides which agent should handle it (or you pick one manually, or it's inferred from an attached file):

| Agent | Purpose | Model / tool |
|---|---|---|
| **chat** | General conversation, explanations, follow-ups. Full per-conversation memory. | Groq `openai/gpt-oss-120b` |
| **search** | Current events, live prices, latest news — real web data. | Tavily → answer synthesised by Groq |
| **coding** | Generate / review / debug code. Returns a runnable multi-file project as an **artifact** (Monaco editor + live preview). | OpenRouter `deepseek/deepseek-chat` |
| **pdf** | Generate a structured PDF document from a topic. | Groq → `pdfkit` → S3 (signed link) |
| **ppt** | Generate a PowerPoint deck from a topic. | Groq → `pptxgenjs` → S3 (signed link) |
| **vision** | Generate an image from a description. | Groq writes the prompt → pollinations.ai renders → S3 |
| **imageAnalyzer** | Answer questions about an uploaded image (OCR, charts, description). | Google `gemini-3.6-flash` |
| **pdfRag** | Q&A over an uploaded PDF (retrieval-augmented). | `pdf-parse` → Qdrant (Gemini embeddings) → Groq |

Plus: Firebase Google sign-in, a credit system with Razorpay top-ups, per-user per-minute rate limiting, streaming-style loading UI, and uploaded images that persist in the conversation.

---

## 🏗️ Architecture

```mermaid
flowchart TD
  U[React SPA — Vercel<br/>sumeetai.vercel.app] -->|/api/* rewrite| AGW[AWS API Gateway<br/>HTTPS]
  AGW --> ALB[Application Load Balancer]
  ALB --> GW[Gateway :8000<br/>proxy + Redis session check]

  GW -->|/api/auth| AUTH[Auth :8001]
  GW -->|/api/chat| CHAT[Chat :8002]
  GW -->|/api/agent| AGENT[Agent :8003]
  GW -->|/api/billing| BILL[Billing :8004]

  AUTH --> FB[(Firebase Auth)]
  AUTH -.-> RD[(Redis — sessions, memory, rate limits)]
  GW -.-> RD
  CHAT --> MG[(MongoDB — conversations, messages)]
  BILL --> RP[(Razorpay)]
  BILL --> MG
  AUTH --> MG

  AGENT --> LG{{LangGraph router}}
  LG --> LLM[Groq / OpenRouter / Gemini]
  AGENT --> QD[(Qdrant — vectors)]
  AGENT --> S3[(S3 — generated files & uploads<br/>7-day expiry)]
  AGENT --> TV[Tavily] & POLL[pollinations.ai]
```

### Backend microservices (Node + Express, ESM)

| Service | Port | Responsibility |
|---|---|---|
| `gateway` | 8000 | Single entry point. CORS, reverse-proxy to each service, verifies the Redis session (`protect` middleware) and forwards `x-user-id` downstream. |
| `services/auth` | 8001 | Firebase ID-token verification, user creation (Mongoose), Redis session issue/revoke, plan & credit balance, `deduct-credits` for inter-service calls. |
| `services/chat` | 8002 | Conversation & message persistence (MongoDB). |
| `services/agent` | 8003 | The AI engine. `graph/graph.js` is a LangGraph `StateGraph`; `graph/router.js` picks the node; `agents/*` implement each one. |
| `services/billing` | 8004 | Razorpay order creation + HMAC signature verification, `Payment` model, calls auth to credit the user. |
| `shared/redis` | — | Shared `ioredis` client. |

---

## 🧰 Tech stack

**Frontend:** React 19, Vite 8, Tailwind CSS v4, Redux Toolkit, `motion` (Framer Motion), `@monaco-editor/react`, `react-markdown` + `remark-gfm`, Firebase JS SDK, Axios.

**Backend:** Node 20+, Express 5, `@langchain/langgraph`, `@langchain/groq`, `@langchain/openrouter`, `@langchain/google-genai`, `@langchain/qdrant`, `@langchain/tavily`, `firebase-admin`, `mongoose`, `ioredis`, `http-proxy-middleware`, `@aws-sdk/client-s3`, `pdfkit`, `pptxgenjs`, `pdf-parse`, `multer`, `razorpay`.

**Infra:** Docker / Docker Compose, AWS ECS Fargate + ECR + ALB + API Gateway + S3, Vercel, MongoDB Atlas, Redis Cloud, Qdrant Cloud. Region `ap-south-1`.

---

## 📁 Repo structure

```
sumeetai/
├─ frontend/                 # React SPA (deployed to Vercel)
│  ├─ src/components/         # ChatArea, ChatInput, MessageBubble, Sidebar, Artifact, …
│  ├─ src/features/           # thin API-call modules (axios)
│  ├─ src/redux/              # user / conversation / message slices
│  └─ vercel.json             # /api/* → API Gateway rewrite + SPA fallback
├─ backend/
│  ├─ gateway/                # :8000  API gateway
│  ├─ services/auth/          # :8001
│  ├─ services/chat/          # :8002
│  ├─ services/agent/         # :8003  LangGraph engine
│  │  ├─ graph/               # graph.js, router.js, state.js
│  │  ├─ agents/              # chat, search, coding, pdf, ppt, vision, pdfRag, imageAnalyzer
│  │  ├─ config/              # llmModels, memory, agentLimit, vectorDb, embeddings, s3, tavily, multer
│  │  └─ utils/               # generatePdf, generatePpt, uploadToS3, getFromS3, deductCredits, …
│  ├─ services/billing/       # :8004
│  └─ shared/redis/
├─ docker-compose.yml         # full local cluster (redis, mongo, 5 services, frontend)
└─ .github/workflows/deploy.yml
```

---

## 🚀 Local development

### Prerequisites
- Node.js 20+
- Docker & Docker Compose
- API keys: Firebase (web + admin service account), Groq, OpenRouter, Google Gemini, Tavily, AWS (S3), Qdrant, Razorpay (test)

### 1. Clone
```bash
git clone https://github.com/Sumeet602/sumeetai.git
cd sumeetai
```

### 2. Environment files
Create a `.env` in each service directory (all are git-ignored). See the reference below.

For the **auth** service you also need Firebase Admin credentials — either the three `FIREBASE_*` env vars, or drop a `serviceAccountKey.json` next to `backend/services/auth/config/`.

### 3. Run the whole cluster
```bash
docker-compose up --build
```
- Frontend → http://localhost:5173
- Gateway  → http://localhost:8000

### 4. Or run pieces individually
```bash
# each backend service
cd backend/services/agent && npm install && npm run dev   # nodemon

# frontend
cd frontend && npm install && npm run dev
```

---

## 🔑 Environment reference

**`backend/gateway/.env`**
```env
PORT=8000
AUTH_SERVICE=http://localhost:8001
CHAT_SERVICE=http://localhost:8002
AGENT_SERVICE=http://localhost:8003
BILLING_SERVICE=http://localhost:8004
REDIS_URL=redis://localhost:6379
```

**`backend/services/auth/.env`**
```env
PORT=8001
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://localhost:6379
FIREBASE_PROJECT_ID=your-project
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

**`backend/services/chat/.env`**
```env
PORT=8002
MONGODB_URI=mongodb+srv://...
```

**`backend/services/agent/.env`**
```env
PORT=8003
REDIS_URL=redis://localhost:6379
MONGODB_URI=mongodb+srv://...
CHAT_SERVICE=http://localhost:8002
AUTH_SERVICE=http://localhost:8001
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
TAVILY_API_KEY=tvly-...
QDRANT_URL=https://...qdrant.io
QDRANT_API_KEY=...
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=your-assets-bucket
```

**`backend/services/billing/.env`**
```env
PORT=8004
MONGODB_URI=mongodb+srv://...
AUTH_SERVICE=http://localhost:8001
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

**`frontend/.env`**
```env
# leave empty on Vercel (API is same-origin via vercel.json rewrite);
# for a standalone frontend point it at the gateway/ALB URL.
VITE_SERVER_URL=
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=1:...:web:...
VITE_RAZORPAY_KEY_ID=rzp_test_...
```

---

## 💳 Credits & rate limits

New users start with **100 credits**. Cost per request: `chat` 1 · `search` 5 · `coding` / `pdf` / `ppt` / `vision` / image analysis 10.

Plans (Razorpay): **Free** 100 · **Starter** ₹199 → 500 · **Pro** ₹499 → 1000 (30-day validity).

Per-user, per-minute request caps (Redis): `chat` 20, every other agent 5.

Generated files and uploaded images land in S3 with a **7-day lifecycle expiry** — download links are short-lived signed URLs.

---

## ☁️ Deployment

**Frontend — Vercel.** Push to `main` auto-deploys. `frontend/vercel.json` rewrites `/api/*` to an AWS API Gateway HTTPS endpoint, which proxies to the ALB → gateway, so the SPA and API are same-origin (no CORS, no mixed content).

**Backend — AWS ECS Fargate.** `.github/workflows/deploy.yml` on push to `main`:
1. Builds 5 Docker images, pushes to ECR.
2. Pulls the live task definition, injects env, renders the 5 container images.
3. Deploys one ECS service task (all 5 containers co-located; internal URLs are `localhost:800x`) behind an ALB, waits for stability.

Set `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` as repo secrets. MongoDB Atlas, Redis Cloud, Qdrant Cloud back the stateful pieces.

---

<div align="center">
  <sub>Built with the MERN stack + LangGraph.</sub>
</div>
