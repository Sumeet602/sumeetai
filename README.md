<div align="center">
  <img src="frontend/src/assets/hero.png" alt="Multi-Agent AI Studio Banner" width="100%" />
  
  # 🤖 Multi-Agent AI Studio

  **An enterprise-grade, microservices-based AI platform featuring specialized autonomous agents.**

  [![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
  [![AWS](https://img.shields.io/badge/AWS-ECS_Fargate-232F3E?style=for-the-badge&logo=amazon-aws&logoColor=white)](https://aws.amazon.com/)
</div>

<br />

## 🌟 Overview

**Multi-Agent AI Studio** (SumeetAI) is a full-stack, distributed web application built on a microservices architecture. It provides users with a single, sleek interface to interact with multiple specialized AI agents, each designed to tackle distinct challenges—from deep analytical thinking to advanced web searching and coding.

---

## ✨ Features

- 🧠 **Five Specialized AI Agents**:
  - **Standard Chat**: General purpose LLM for everyday queries and conversation.
  - **Coding Agent**: Specialized in software architecture, debugging, and code generation.
  - **Vision Agent**: Analyzes images, reads documents, and understands visual context.
  - **Search Agent**: Connects to the internet for real-time data retrieval (via Tavily/SerpAPI).
  - **Deep Thinker (o1)**: Uses step-by-step chain-of-thought reasoning for complex problem solving.
- 🎨 **Modern, Sleek UI**: Built with React 19, TailwindCSS v4, and Framer Motion for buttery-smooth animations and glassmorphic designs.
- 🔐 **Secure Authentication**: End-to-end Firebase Google Sign-In with robust session management backed by Redis Cloud.
- 💳 **Integrated Billing**: Complete Razorpay integration for credit purchasing, subscription management, and payment verification.
- ☁️ **Cloud Native**: Fully containerized with Docker, deployed on AWS ECS (Elastic Container Service) with AWS API Gateway for load balancing.

---

## 🏗️ Architecture

The backend utilizes an **API Gateway** pattern to route requests to highly decoupled microservices. 

```mermaid
graph TD
    Client[React Frontend (Vite/Tailwind)] -->|HTTPS| ALB[AWS Application Load Balancer]
    ALB --> Gateway[API Gateway Service :8000]
    
    Gateway -->|/auth| Auth[Auth Service :8001]
    Gateway -->|/chat| Chat[Chat Service :8002]
    Gateway -->|/agent| Agent[Agent Execution Service :8003]
    Gateway -->|/billing| Billing[Billing Service :8004]
    
    Auth --> Firebase[(Firebase Auth)]
    Auth -.-> Redis[(Redis Session Store)]
    Gateway -.-> Redis
    
    Chat --> MongoDB[(MongoDB)]
    Agent --> LLM[LLM APIs / LangChain]
    Billing --> Razorpay[(Razorpay API)]
    Billing --> MongoDB
```

### Microservices Breakdown:
1. **Gateway (`:8000`)**: The centralized entry point. Handles CORS, proxying, and session verification (via Redis).
2. **Auth Service (`:8001`)**: Manages Firebase ID token verification, creates authenticated sessions in Redis, and handles user creation.
3. **Chat Service (`:8002`)**: Manages conversation history, message persistence, and chat sessions (MongoDB).
4. **Agent Service (`:8003`)**: The core AI engine. Parses prompts, routes requests to the correct LLM/LangGraph agent, and deducts credits via inter-service communication.
5. **Billing Service (`:8004`)**: Handles credit balances, premium tiers, and Razorpay webhook verifications.

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/)
- [Node.js (v20+)](https://nodejs.org/)
- API Keys (Firebase, Razorpay, OpenAI/Groq, Redis Cloud)

### 1. Clone the repository
```bash
git clone https://github.com/Sumeet602/sumeetai.git
cd sumeetai
```

### 2. Environment Setup
You will need to create `.env` files in the respective service directories.

**Gateway (`backend/gateway/.env`)**
```env
PORT=8000
AUTH_SERVICE=http://auth:8001
CHAT_SERVICE=http://chat:8002
AGENT_SERVICE=http://agent:8003
BILLING_SERVICE=http://billing:8004
REDIS_URL=redis://your-redis-cloud-url
```

*(Create similar `.env` files for `auth`, `chat`, `agent`, `billing`, and `frontend` using their respective required keys).*

### 3. Run with Docker Compose
The easiest way to boot the entire microservice cluster locally is via Docker Compose:

```bash
# Build and start all services in detached mode
docker-compose up --build -d
```

### 4. Access the App
- **Frontend**: `http://localhost:5173`
- **API Gateway**: `http://localhost:8000`

---

## ☁️ Deployment

This project is configured for cloud deployment on AWS:
- **Frontend**: Compiled statically via Vite and synced to an **Amazon S3** bucket (configured for static website hosting).
- **Backend Microservices**: Docker images are pushed to **Amazon ECR** and deployed as scalable serverless tasks on **AWS ECS Fargate**.
- **Database/Cache**: Hosted on MongoDB Atlas and Redis Cloud to ensure persistence regardless of container lifecycle.

---

<div align="center">
  <p>Built with ❤️ for the future of AI Agents.</p>
</div>
