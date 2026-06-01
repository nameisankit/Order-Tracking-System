# Cloud Deployment Guide

**Stack Options:**
- **Option 1:** GitHub → GitHub Actions → **Vercel** (frontend) + **Northflank** (backend) + **Neon** (PostgreSQL) + **Upstash** (Redis)
- **Option 2:** GitHub → **Render** (backend with built-in PostgreSQL + Redis) + **Vercel** (frontend)

---

## Architecture

```
GitHub (push)
    ↓
GitHub Actions — build, test, Docker image validation
    ↓
┌─────────────────┬─────────────────────┐
│ Vercel          │ Northflank          │
│ React frontend  │ Spring Boot API     │
└────────┬────────┴──────────┬──────────┘
         │                   │
         │    ┌──────────────┼──────────────┐
         │    ↓              ↓              │
         │  Neon PG      Upstash Redis      │
         └──────── (HTTPS API + WS) ──────────┘
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
3. Copy connection details (host, database, user, password).
4. JDBC URL format:

```text
jdbc:postgresql://ep-xxxx.region.aws.neon.tech/neondb?sslmode=require
```

---

## 3. Upstash (Redis)

1. Sign up at [upstash.com](https://upstash.com).
2. **Create Database** → Redis → pick a region close to your Northflank region.
3. Copy:
   - **Endpoint** (host)
   - **Port** (usually `6379`)
   - **Password** (token)
4. Use TLS: set `SPRING_DATA_REDIS_SSL=true` on Northflank.

---

## 4. Northflank (Spring Boot backend only)

Guide: [Deploy Spring Boot on Northflank](https://northflank.com/guides/deploy-spring-boot-with-postgresql-on-northflank)

### 4.1 Create project & service

1. Sign up at [northflank.com](https://northflank.com).
2. **Create project** → e.g. `order-tracking`.
3. **Create new** → **Service** → **Combined service** (build + run in one).
4. Name: `order-tracking-backend`.

### 4.2 Connect GitHub

1. **Repository** → connect GitHub → select your repo.
2. **Branch:** `main` (or your deploy branch).
3. Enable **Build on push** if you want automatic redeploys.

### 4.3 Build configuration

| Setting | Value |
|---------|--------|
| Build type | **Dockerfile** |
| Dockerfile path | `backend/Dockerfile` |
| Build context | `backend` |
| Port | `8080` |

The repo Dockerfile already has `EXPOSE 8080` and builds the Spring Boot JAR.

### 4.4 Networking & health check

1. **Ports** → add port `8080` (HTTP).
2. **Health check** → HTTP GET `/health` on port `8080`.
3. After deploy, copy your public URL (e.g. `https://order-tracking-backend--xxx.code.run`).

### 4.5 Environment variables

Add all variables from **[northflank/BACKEND-ENV.md](./northflank/BACKEND-ENV.md)** in the Northflank dashboard.

Minimum set:

| Key | Value |
|-----|--------|
| `SPRING_DATASOURCE_URL` | Neon JDBC URL with `?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Neon user |
| `SPRING_DATASOURCE_PASSWORD` | Neon password |
| `SPRING_DATA_REDIS_HOST` | Upstash host |
| `SPRING_DATA_REDIS_PORT` | `6379` |
| `SPRING_DATA_REDIS_PASSWORD` | Upstash token |
| `SPRING_DATA_REDIS_SSL` | `true` |
| `JWT_SECRET` | Long random string (32+ chars) |
| `SPRING_MVC_CORS_ALLOWED_ORIGINS` | `https://YOUR-APP.vercel.app,http://localhost:3000` |

### 4.6 Deploy

1. Click **Create service** / **Deploy**.
2. Wait for build + health check to pass.
3. Open `https://YOUR-NORTHFLANK-URL/health` → should return `{"status":"UP"}`.

---

## 5. Vercel (React frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import GitHub repo.
2. **Root Directory:** `frontend`
3. Framework: **Create React App** (auto-detected).
4. **Environment Variables** (Production):

| Key | Value |
|-----|--------|
| `REACT_APP_API_BASE_URL` | `https://YOUR-NORTHFLANK-URL/api` |
| `REACT_APP_WS_URL` | `https://YOUR-NORTHFLANK-URL/ws` |

5. Deploy → note URL: `https://your-app.vercel.app`

6. **Update Northflank CORS** with your final Vercel URL:

```text
SPRING_MVC_CORS_ALLOWED_ORIGINS=https://your-app.vercel.app,http://localhost:3000
```

Redeploy the Northflank service after changing CORS.

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

- Frontend: http://localhost (port 80) or run CRA on :3000
- Backend: http://localhost:8080

### Option B — Manual

```bash
docker compose up -d postgres redis
cd backend && mvn spring-boot:run
cd frontend && cp .env.example .env.local && npm start
```

---

## 8. CI/CD summary

| Trigger | Action |
|---------|--------|
| PR / push | Build backend (Maven), frontend (npm), run tests |
| All branches | Validate Docker images build |
| Push `main` | Vercel auto-deploy; Northflank auto-build (if enabled) |

GitHub Actions validates Docker builds; **Northflank** and **Vercel** deploy via their GitHub integrations.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| CORS error on login | Add exact Vercel URL to `SPRING_MVC_CORS_ALLOWED_ORIGINS` on Northflank |
| WebSocket failed | Use `https://` for `REACT_APP_WS_URL`; check Northflank port 8080 is public |
| Build failed on Northflank | Confirm Dockerfile path `backend/Dockerfile` and context `backend` |
| Health check failing | Ensure `/health` is reachable; check logs for DB/Redis connection errors |
| DB connection failed | Neon URL must include `sslmode=require` |
| Redis connection failed | `SPRING_DATA_REDIS_SSL=true` + correct Upstash password |

---

## Files reference

| File | Purpose |
|------|---------|
| `backend/Dockerfile` | Northflank Docker build |
| `northflank/BACKEND-ENV.md` | Env var checklist for Northflank |
| `frontend/vercel.json` | Vercel SPA routing |
| `frontend/.env.example` | Frontend env template |
| `.env.example` | Full stack env template |
| `.github/workflows/ci-cd.yml` | GitHub Actions pipeline |
| `render.yaml` | Render deployment configuration |

---

## Render Deployment (Alternative to Northflank)

### Architecture

```
GitHub (push)
    ↓
Render (Backend + PostgreSQL + Redis)
    ↓
Vercel (Frontend)
```

### 1. Deploy Backend on Render

1. Sign up at [render.com](https://render.com).
2. **New** → **Web Service** → connect your GitHub repository.
3. Configure:
   - **Name:** `order-tracking-backend`
   - **Environment:** Java
   - **Build Command:** `./mvnw clean package -DskipTests`
   - **Start Command:** `java -jar target/OrderTrackingApplication.jar`
   - **Root Directory:** `backend`

4. **Add Database:**
   - In the Render dashboard, go to your web service
   - Click **Databases** → **New Database**
   - Choose **PostgreSQL**
   - Name: `order-tracking-db`
   - Render will automatically set environment variables:
     - `SPRING_DATASOURCE_URL`
     - `SPRING_DATASOURCE_USERNAME`
     - `SPRING_DATASOURCE_PASSWORD`

5. **Add Redis:**
   - Click **Databases** → **New Database**
   - Choose **Redis**
   - Name: `order-tracking-redis`
   - Render will automatically set environment variables:
     - `SPRING_DATA_REDIS_HOST`
     - `SPRING_DATA_REDIS_PORT`

6. **Add Environment Variables:**
   - `JWT_SECRET`: Generate a long random string (32+ characters)
   - `JWT_EXPIRATION`: `86400000` (24 hours in milliseconds)
   - `SPRING_MVC_CORS_ALLOWED_ORIGINS`: `https://YOUR-APP.vercel.app,http://localhost:3000`

7. Click **Deploy Web Service**.

### 2. Deploy Frontend on Vercel

Same as Section 5 above, but use your Render backend URL:

| Key | Value |
|-----|--------|
| `REACT_APP_API_BASE_URL` | `https://YOUR-RENDER-URL.onrender.com/api` |
| `REACT_APP_WS_URL` | `https://YOUR-RENDER-URL.onrender.com/ws` |

### 3. Verify

1. Open Render backend URL → `/health` → should return `{"status":"UP"}`
2. Open Vercel URL → Register / Login
3. Create an order → check dashboard
4. Test WebSocket live updates

### Render vs Northflank

| Feature | Render | Northflank |
|---------|-------|-----------|
| PostgreSQL | Built-in (free tier) | External (Neon) |
| Redis | Built-in (free tier) | External (Upstash) |
| Deployment | Simple YAML config | Docker-based |
| Free Tier | Yes (with limits) | Yes (with limits) |
| Complexity | Lower | Higher |

### Troubleshooting (Render)

| Issue | Fix |
|-------|-----|
| Backend not starting | Check Render logs; ensure `PORT` variable is set (Render provides it automatically) |
| DB connection failed | Render auto-sets DB env vars; verify they're present in service settings |
| Redis connection failed | Render auto-sets Redis env vars; verify they're present |
| CORS error | Add exact Vercel URL to `SPRING_MVC_CORS_ALLOWED_ORIGINS` |
| WebSocket failed | Use `https://` for `REACT_APP_WS_URL` |
