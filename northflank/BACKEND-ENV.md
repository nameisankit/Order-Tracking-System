# Northflank — Backend environment variables

Copy these into your Northflank **Combined Service** → **Runtime** → **Environment variables**.

| Variable | Example / notes |
|----------|-----------------|
| `SERVER_PORT` | `8080` |
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://ep-xxx.neon.tech/neondb?sslmode=require` |
| `SPRING_DATASOURCE_USERNAME` | Neon user |
| `SPRING_DATASOURCE_PASSWORD` | Neon password |
| `SPRING_DATA_REDIS_HOST` | Upstash endpoint (hostname only) |
| `SPRING_DATA_REDIS_PORT` | `6379` |
| `SPRING_DATA_REDIS_PASSWORD` | Upstash token |
| `SPRING_DATA_REDIS_SSL` | `true` |
| `JWT_SECRET` | 32+ character random secret |
| `JWT_EXPIRATION` | `86400000` |
| `SPRING_JPA_DDL_AUTO` | `update` (first deploy) |
| `SPRING_MVC_CORS_ALLOWED_ORIGINS` | `https://your-app.vercel.app,http://localhost:3000` |
| `LOG_LEVEL_APP` | `INFO` |
| `LOG_LEVEL_WS` | `INFO` |

**Build settings (UI):**

- Build type: **Dockerfile**
- Dockerfile path: `backend/Dockerfile`
- Build context: `backend` (repository subdirectory)
- Port: **8080** (from `EXPOSE 8080`)
- Health check path: `/health`
