# Cloud Deployment Guide

**Stack:** GitHub → GitHub Actions → **Vercel** (frontend) + **Render** (backend) + **Neon** (PostgreSQL) + **Upstash** (Redis)

---

## Architecture

```
GitHub (push)
    ↓
GitHub Actions — build, test, Docker image validation
    ↓
┌─────────────────┬─────────────────┐
│ Vercel          │ Render          │
│ React frontend  │ Spring Boot API │
└────────┬────────┴────────┬────────┘
         │                 │
         │    ┌────────────┼────────────┐
         │    ↓            ↓            │
         │  Neon PG    Upstash Redis    │
         └──────── (HTTPS API + WS) ────┘
```

**User-facing URL:** your Vercel domain (e.g. `https://order-track.vercel.app`)

---

## 1. GitHub repository

```bash
cd order-tracking-system
git init
git add .
git commit -m "Order tracking system - cloud deployment ready"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/order-tracking-system.git
git push -u origin main
```

Every push to `main` / `develop` runs CI (build + test + Docker validation).

---

## 2. Neon (PostgreSQL)

1. Sign up at [neon.tech](https://neon.tech).
2. **New Project** → name `order-tracking`.
3. Copy connection details:
   - Host, database, user, password
   - Or full connection string
4. JDBC URL format:

```text
jdbc:postgresql://ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## 3. Upstash (Redis)

1. Sign up at [upstash.com](https://upstash.com).
2. **Create Database** → Redis → region near your Render region.
3. Copy from console:
   - **Endpoint** (host)
   - **Port** (usually `6379`)
   - **Password** (token)
4. Enable TLS (Upstash uses `rediss://`).

---

## 4. Render (Spring Boot backend)

1. [render.com](https://render.com) → **New** → **Blueprint** (or Web Service).
2. Connect GitHub repo.
3. Use root `render.yaml` or manual **Web Service**:
   - **Root Directory:** `backend`
   - **Runtime:** Docker
   - **Dockerfile:** `backend/Dockerfile`
   - **Health Check Path:** `/health`

### Environment variables (Render dashboard)

| Key | Value |
|-----|--------|
| `SPRING_DATASOURCE_URL` | Neon JDBC URL (`?sslmode=require`) |
| `SPRING_DATASOURCE_USERNAME` | Neon user |
| `SPRING_DATASOURCE_PASSWORD` | Neon password |
| `SPRING_DATA_REDIS_HOST` | Upstash endpoint host |
| `SPRING_DATA_REDIS_PORT` | `6379` |
| `SPRING_DATA_REDIS_PASSWORD` | Upstash token |
| `SPRING_DATA_REDIS_SSL` | `true` |
| `JWT_SECRET` | Long random string (32+ chars) |
| `JWT_EXPIRATION` | `86400000` |
| `SPRING_JPA_DDL_AUTO` | `update` (first deploy) |
| `SPRING_MVC_CORS_ALLOWED_ORIGINS` | `https://YOUR-APP.vercel.app,http://localhost:3000` |

4. Deploy → note URL: `https://order-tracking-backend.onrender.com`

---

## 5. Vercel (React frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. **Root Directory:** `frontend`
3. Framework: **Create React App** (auto-detected).
4. **Environment Variables** (Production):

| Key | Value |
|-----|--------|
| `REACT_APP_API_BASE_URL` | `https://YOUR-BACKEND.onrender.com/api` |
| `REACT_APP_WS_URL` | `https://YOUR-BACKEND.onrender.com/ws` |

5. Deploy → note URL: `https://your-app.vercel.app`

6. **Update Render CORS** with your final Vercel URL:

```text
SPRING_MVC_CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

Redeploy Render after changing CORS.

---

## 6. Verify production

1. Open Vercel URL → Register / Login.
2. Create an order → check dashboard.
3. Open two tabs → confirm WebSocket live updates.
4. Public track: `/track` with tracking number.

---

## 7. Local development

### Option A — Docker Compose (PostgreSQL + Redis)

```bash
cp .env.example .env
# Edit passwords in .env
docker compose up -d --build
```

- Frontend: http://localhost (port 80) or run CRA separately on :3000
- Backend: http://localhost:8080

### Option B — Manual

```bash
# Terminal 1 — Postgres + Redis via Docker
docker compose up -d postgres redis

# Terminal 2 — Backend
cd backend
mvn spring-boot:run

# Terminal 3 — Frontend
cd frontend
cp .env.example .env.local
npm start
```

---

## 8. CI/CD summary

| Trigger | Action |
|---------|--------|
| PR / push | Build backend (Maven), frontend (npm), run tests |
| All branches | Validate Docker images build |
| Push `main` | Vercel + Render auto-deploy (if GitHub connected) |

### GitHub secrets (optional)

Only needed if you extend workflow to push Docker images:

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

Render/Vercel use their own GitHub integration — no extra secrets required for basic deploy.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error on login | Add exact Vercel URL to `SPRING_MVC_CORS_ALLOWED_ORIGINS` on Render |
| WebSocket failed | Use `https://` for `REACT_APP_WS_URL`; ensure Render service is awake |
| DB connection failed | Check Neon `sslmode=require` in JDBC URL |
| Redis connection failed | Set `SPRING_DATA_REDIS_SSL=true` and Upstash password |
| 401 on API | Token expired — login again |

---

## Files reference

| File | Purpose |
|------|---------|
| `render.yaml` | Render Blueprint |
| `frontend/vercel.json` | Vercel SPA routing |
| `frontend/.env.example` | Frontend env template |
| `.env.example` | Full stack env template |
| `.github/workflows/ci-cd.yml` | GitHub Actions pipeline |
