<div align="center">

# Sentinox Backend

Enterprise-grade Node.js API for AI-powered consumable health analysis.

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5-000000?style=for-the-badge&logo=fastify&logoColor=white)](https://fastify.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

**Frontend:** [github.com/drax369/sentinox](https://github.com/drax369/sentinox)

</div>

---

## Architecture

```
                    ┌─────────────┐
                    │   CDN / LB   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              │     Fastify API (x N)    │
              │  REST + WebSocket /ws    │
              └────────────┬────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  PostgreSQL            Redis            BullMQ Workers
  (Prisma ORM)      (cache/pubsub)      (async analysis)
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
        ┌──────────────────┴──────────────────┐
        ▼                  ▼                  ▼
    xAI Grok          RxNorm / OFF         USDA FDC
  (chat/vision)      (drug/food DB)      (nutrition)
```

## Core Modules

| Module | Responsibility |
|--------|----------------|
| **Auth** | JWT + refresh tokens, OAuth, OTP, sessions, device fingerprint |
| **Profile** | Health profile for personalization |
| **Input Pipeline** | OCR → STT → normalize → entity resolution |
| **Analysis Engine** | Grok (xAI) reasoning + risk scoring + personalization |
| **Multilingual** | Translation + regional simplification |
| **Voice Engine** | TTS + phoneme/timing payload for lip sync |
| **Knowledge Graph** | Ingredient relationships for contextual reasoning |
| **Notifications** | Allergy, interaction, toxicity, recall alerts |

## Quick Start

```bash
cd sentinox-backend
cp .env.example .env
docker compose up -d postgres redis
npm install
npx prisma db push
npm run dev          # API on :4000
npm run dev:worker   # Queue worker (separate terminal)
```

## API Endpoints (`/api/v1`)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/signup` | No | Register + OTP |
| POST | `/auth/login` | No | Email/password login |
| POST | `/auth/otp/verify` | No | Verify OTP |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/oauth` | No | OAuth login |
| POST | `/scan/text` | Yes | Text scan (async queue) |
| POST | `/scan/voice` | Yes | Audio upload → STT |
| POST | `/scan/image` | Yes | Image/PDF → OCR |
| POST | `/analysis/run` | Yes | Run/re-run analysis |
| GET | `/history` | Yes | Scan history |
| GET | `/recommendations` | Yes | Personalized tips |
| POST | `/voice/generate` | Yes | TTS + lip-sync data |
| GET | `/profile` | Yes | Health profile |
| PUT | `/profile/update` | Yes | Update profile |

### WebSocket Streaming

Connect: `ws://localhost:4000/ws?token=<accessToken>&scanId=<uuid>`

Subscribe to Redis channel `scan:{scanId}` for progress/complete events.

### Headers

- `Authorization: Bearer <accessToken>`
- `X-Device-Fingerprint: <optional device id>`

## Database

Prisma models: `User`, `Profile`, `Scan`, `Product`, `Ingredient`, `Analysis`, `Warning`, `MedicalInteraction`, `KnowledgeEdge`, `VoiceSession`, `Notification`, `AuditLog`, `ProductRecall`, and auth tables.

```bash
npx prisma studio   # GUI
npx prisma db push  # Sync schema
```

## Docker (full stack)

```bash
docker compose up --build
```

## Kubernetes

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
# Create secret: sentinox-secrets (DATABASE_URL, JWT_*, GROK_API_KEY)
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/worker-deployment.yaml
```

HPA scales API pods 3–50 based on CPU. Workers run independently for horizontal job processing.

## Security

- Helmet, CORS, rate limiting, abuse detection
- Prompt injection filtering on text inputs
- Upload MIME + magic-byte validation
- Audit logs for auth and scans
- Field-level encryption helpers (`lib/crypto.ts`)
- HIPAA-aligned patterns: least privilege, audit trail, no PHI in logs

## Environment

See `.env.example`. Required in production: `DATABASE_URL`, `REDIS_URL`, `JWT_*`, `GROK_API_KEY`.

### Grok (xAI) setup

1. Create an API key at [console.x.ai](https://console.x.ai)
2. Add to `.env`: `GROK_API_KEY=xai-...`
3. Optional: `XAI_API_KEY` works as an alias

Models (defaults): `grok-3-mini` (text), `grok-2-vision-1212` (labels/images). Voice **playback** uses the frontend Web Speech API; Grok handles analysis, OCR, and translation.

## Scaling Notes

- **100k+ concurrent users**: Scale API pods + Redis cluster + PgBouncer
- **Async workers**: Increase `WORKER_CONCURRENCY` and worker replicas
- **CDN**: Cache `GET /history` and static voice assets
- **Streaming**: WebSocket + Redis pub/sub for analysis progress

## Connect Frontend

Point Next.js app to `http://localhost:4000/api/v1` and replace mock `/api/analyze` with authenticated scan endpoints.
