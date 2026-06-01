# 📦 Order Tracking System

A full-stack real-time Order Tracking System built with **Spring Boot**, **PostgreSQL**, **Redis**, **WebSocket**, and **React.js** — featuring JWT Authentication, Docker, CI/CD via GitHub Actions, and cloud deployment.

🌐 **Live Demo:** [order-tracking-systemm.vercel.app](https://order-tracking-systemm.vercel.app)

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🛒 Place Orders | Create orders with customer and product details |
| 🔍 Track Orders | Real-time tracking by tracking number (public, no login needed) |
| 📊 Dashboard | Stats: total orders, pending, shipped, delivered, revenue |
| 🔄 Live Updates | WebSocket (STOMP/SockJS) pushes status changes instantly |
| 📋 Order Management | Full CRUD with status pipeline |
| 🔐 JWT Auth | Secure register/login with token-based authentication |
| 🗄️ PostgreSQL | Persistent storage via JPA/Hibernate (Neon in production) |
| ⚡ Redis | Caching layer (Upstash in production) |
| 🐳 Docker | Fully containerized with Docker Compose |
| 🤖 CI/CD | Auto build, test, and deploy via GitHub Actions |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 17, Spring Boot 3.2, Spring Security |
| Database | PostgreSQL 16 (Neon in production) |
| Cache | Redis (Upstash in production) |
| Real-time | WebSocket (STOMP + SockJS) |
| Auth | JWT (io.jsonwebtoken) |
| Frontend | React 18, React Router v6, Axios |
| Styling | Custom CSS (dark theme) |
| Container | Docker, Docker Compose |
| CI/CD | GitHub Actions |
| Cloud | Vercel (frontend) + Render (backend) + Neon + Upstash |

---

## ☁️ Cloud Architecture

```
User Browser
     │
     ▼
Vercel (React Frontend)
     │  HTTPS REST + WebSocket
     ▼
Render (Spring Boot Backend)
     │              │
     ▼              ▼
Neon (PostgreSQL)  Upstash (Redis)
```

---

## ⚙️ Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.8+

---

## 🏃 Quick Start

### Option 1: Local Development

**1. Start PostgreSQL + Redis via Docker**
```bash
docker compose up -d postgres redis
```

**2. Start the Backend**
```bash
cd backend
mvn spring-boot:run
```
Backend runs at: `http://localhost:8080`

**3. Start the Frontend**
```bash
cd frontend
npm install
npm start
```
Frontend runs at: `http://localhost:3000`

### Option 2: Full Stack via Docker Compose

```bash
cp .env.example .env
# Fill in your values in .env
docker-compose up -d
```
Access at: `http://localhost`

---

## 🔐 Authentication

### Register
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "password": "password123"
  }'
```

### Using JWT Token
```bash
curl -X GET http://localhost:8080/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📡 REST API Endpoints

### Auth Endpoints (Public)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Order Endpoints (JWT Required)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Place a new order |
| GET | `/api/orders` | Get all orders |
| GET | `/api/orders/{id}` | Get order by ID |
| GET | `/api/orders/track/{tracking}` | Track order (**Public**) |
| GET | `/api/orders/customer/{email}` | Get orders by email |
| GET | `/api/orders/status/{status}` | Filter by status |
| PUT | `/api/orders/{id}` | Update order details |
| PATCH | `/api/orders/{id}/status` | Update order status |
| DELETE | `/api/orders/{id}` | Delete an order |
| GET | `/api/orders/dashboard/stats` | Dashboard statistics |

### Example — Place an Order
```bash
curl -X POST http://localhost:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "customerName": "John Doe",
    "customerEmail": "john@example.com",
    "productName": "Wireless Headphones",
    "quantity": 2,
    "price": 59.99,
    "shippingAddress": "123 Main St, New York, NY 10001"
  }'
```

---

## 🔌 WebSocket

**Endpoint:** `ws://localhost:8080/ws` (SockJS fallback)

**Subscribe Topics:**
- `/topic/orders` — All order notifications (broadcast)
- `/topic/orders/{email}` — User-specific notifications

**Notification Payload:**
```json
{
  "orderId": 1,
  "trackingNumber": "TRK1234567890",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "previousStatus": "PENDING",
  "newStatus": "SHIPPED",
  "message": "Order TRK123 status updated to: Shipped",
  "timestamp": "2025-07-15T10:30:00",
  "type": "STATUS_UPDATED"
}
```

---

## 📊 Order Status Pipeline

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → OUT_FOR_DELIVERY → DELIVERED
                                                               ↘ CANCELLED / RETURNED
```

---

## 🗂 Project Structure

```
order-tracking-system/
├── .github/workflows/ci-cd.yml   # GitHub Actions CI/CD
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/ordertracking/
│       ├── controller/           # REST API controllers
│       ├── service/              # Business logic
│       ├── model/                # JPA entities
│       ├── repository/           # Spring Data repos
│       ├── dto/                  # Request/Response DTOs
│       ├── security/             # JWT + Spring Security
│       └── config/               # CORS, Redis, WebSocket
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   └── src/
│       ├── components/           # React components
│       ├── services/             # API + Auth services
│       ├── hooks/useWebSocket.js # WebSocket hook
│       └── config/env.js         # Env var config
├── docker-compose.yml
├── render.yaml                   # Render deployment config
└── .env.example
```

---

## 🤖 CI/CD Pipeline

```
git push main
     │
     ▼
GitHub Actions
     ├── build-and-test        ← Maven build + npm build + tests
     ├── docker-build-validation ← Docker image validation
     ├── deploy-backend        ← Auto deploy to Render
     └── deploy-frontend       ← Auto deploy to Vercel
```

Every push to `main` automatically builds, tests, and deploys the full stack.

---

## 🔧 Environment Variables

### Backend (Render)

| Variable | Description |
|----------|-------------|
| `SPRING_DATASOURCE_URL` | Neon PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `SPRING_DATA_REDIS_HOST` | Upstash Redis host |
| `SPRING_DATA_REDIS_PORT` | Redis port (6379) |
| `SPRING_DATA_REDIS_PASSWORD` | Upstash Redis token |
| `SPRING_DATA_REDIS_SSL` | `true` for Upstash |
| `JWT_SECRET` | Min 32 char secret key |
| `JWT_EXPIRATION` | Token expiry in ms (86400000 = 24h) |
| `SPRING_MVC_CORS_ALLOWED_ORIGINS` | Your Vercel frontend URL |

### Frontend (Vercel)

| Variable | Description |
|----------|-------------|
| `REACT_APP_API_BASE_URL` | `https://your-render-url/api` |
| `REACT_APP_WS_URL` | `https://your-render-url/ws` |

---

## 📝 Security Notes

- JWT secret has no default — app fails to start if not set (intentional)
- All order endpoints require authentication except `/api/orders/track/{tracking}`
- CORS restricted to configured Vercel URL only
- HTTPS enforced on all cloud services
- Credentials never committed to repo — use environment variables

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'feat: add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
