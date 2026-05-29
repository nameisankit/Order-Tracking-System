# 📦 Order Tracking System

A full-stack Order Tracking System built with **Spring Boot**, **PostgreSQL**, **Redis**, **WebSocket**, **React.js**, with **JWT Authentication**, **Docker**, **CI/CD**, and cloud deployment on **Vercel**, **Render**, **Neon**, and **Upstash**.

---

## 🚀 Features

- ✅ **Place Orders** – Create orders with customer and product details
- 🔍 **Track Orders** – Real-time tracking by tracking number
- 📊 **Dashboard** – Stats: total, pending, shipped, delivered, revenue
- 🔄 **Live Updates** – WebSocket (STOMP/SockJS) pushes status changes instantly
- 📋 **Order Management** – Full CRUD with status pipeline
- � **JWT Authentication** – Secure user authentication and authorization
- �💾 **PostgreSQL** – Persistent data storage via JPA/Hibernate (Neon in production)
- ⚡ **Redis** – Caching support
- 🌐 **REST API** – Clean endpoints documented below
- 🐳 **Docker** – Containerized deployment
- 🚀 **CI/CD** – Automated deployment with GitHub Actions
- ☁️ **Cloud Deploy** – Vercel (frontend) + Render (backend) + Neon + Upstash

---

## 🛠 Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Backend   | Java 17, Spring Boot 3.2, Spring Security |
| Database  | PostgreSQL 16 (Neon in prod)      |
| Cache     | Redis (Upstash in prod)           |
| Real-time | WebSocket (STOMP + SockJS)        |
| Auth      | JWT (io.jsonwebtoken)              |
| Frontend  | React 18, React Router v6         |
| HTTP      | Axios                             |
| Styling   | Custom CSS (dark theme)           |
| Container | Docker, Docker Compose            |
| CI/CD     | GitHub Actions                    |
| Cloud     | Vercel, Render, Neon, Upstash     |

---

## ⚙️ Prerequisites

- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven 3.8+
- GitHub account (for CI/CD)
- Vercel, Render, Neon, Upstash accounts (for cloud deployment)

---

## 🏃 Quick Start

### Option 1: Local Development

#### 1. Start PostgreSQL + Redis via Docker

```bash
docker compose up -d postgres redis
```

#### 2. Start the Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs at: **http://localhost:8080**

#### 3. Start the Frontend

```bash
cd frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**

### Option 2: Docker Compose (Full Stack)

```bash
docker-compose up -d
```

Access the application at: **http://localhost**

---

## � Authentication

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

Include the JWT token in the Authorization header for protected endpoints:

```bash
curl -X GET http://localhost:8080/api/orders \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## �📡 REST API Endpoints

### Authentication Endpoints

| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| POST   | `/api/auth/register` | Register new user |
| POST   | `/api/auth/login`    | Login user        |

### Order Endpoints (Require Authentication)

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/orders`                   | Place a new order        |
| GET    | `/api/orders`                   | Get all orders           |
| GET    | `/api/orders/{id}`              | Get order by ID          |
| GET    | `/api/orders/track/{tracking}`  | Track order by number (Public) |
| GET    | `/api/orders/customer/{email}`  | Get orders by email      |
| GET    | `/api/orders/status/{status}`   | Filter by status         |
| PUT    | `/api/orders/{id}`              | Update order details     |
| PATCH  | `/api/orders/{id}/status`       | Update order status      |
| DELETE | `/api/orders/{id}`              | Delete an order          |
| GET    | `/api/orders/dashboard/stats`   | Get dashboard statistics |

### Example – Place an Order (with JWT)

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
- `/topic/orders` – All order notifications (broadcast)
- `/topic/orders/{email}` – User-specific notifications

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
├── docker-compose.yml
├── .github/
│   └── workflows/
│       └── ci-cd.yml
├── backend/
│   ├── Dockerfile
│   ├── pom.xml
│   └── src/main/java/com/ordertracking/
│       ├── OrderTrackingApplication.java
│       ├── controller/
│       │   ├── OrderController.java
│       │   └── AuthController.java
│       ├── service/
│       │   ├── OrderService.java
│       │   └── AuthService.java
│       ├── model/
│       │   ├── Order.java
│       │   ├── OrderStatus.java
│       │   ├── User.java
│       │   └── Role.java
│       ├── repository/
│       │   ├── OrderRepository.java
│       │   └── UserRepository.java
│       ├── dto/
│       │   ├── OrderRequest.java
│       │   ├── OrderResponse.java
│       │   ├── OrderNotification.java
│       │   ├── DashboardStats.java
│       │   ├── LoginRequest.java
│       │   ├── RegisterRequest.java
│       │   └── AuthResponse.java
│       ├── security/
│       │   ├── JwtUtil.java
│       │   ├── JwtAuthenticationFilter.java
│       │   ├── SecurityConfig.java
│       │   └── CustomUserDetailsService.java
│       └── config/
│           ├── WebSocketConfig.java
│           ├── RedisConfig.java
│           ├── CorsConfig.java
│           └── GlobalExceptionHandler.java
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    └── src/
        ├── App.js
        ├── index.css
        ├── services/
        │   ├── orderService.js
        │   └── authService.js
        ├── hooks/useWebSocket.js
        └── components/
            ├── Login/
            ├── Register/
            ├── Navbar/
            ├── Dashboard/
            ├── OrderList/
            ├── OrderForm/
            ├── OrderDetail/
            └── shared/
```

---

## 🚀 CI/CD with GitHub Actions

```
GitHub → GitHub Actions → Docker Build Validation
                              ↓
              Vercel (Frontend) + Render (Backend)
                              ↓
                    Neon (PostgreSQL) + Upstash (Redis)
```

### Workflow

- **Push / PR to `main` or `develop`** – Build backend (Maven), frontend (npm), run tests
- **Docker validation** – Build backend and frontend Docker images (no push required)
- **Production deploy** – Connect repo to **Vercel** and **Render** for auto-deploy on `main`

### Full deployment guide

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for step-by-step setup:

1. Neon – PostgreSQL database  
2. Upstash – Redis  
3. Render – Spring Boot API  
4. Vercel – React frontend  
5. CORS + env vars configuration  

**Live app URL:** your Vercel domain (single link for users).

---

## 🔧 Configuration

### Backend Configuration (application.properties)

```properties
# JWT Configuration
jwt.secret=mySecretKeyForJWTTokenGenerationThatIsLongEnoughForHS256Algorithm
jwt.expiration=86400000
```

### Environment Variables

- `SPRING_DATASOURCE_URL` – PostgreSQL connection URL (Neon)
- `SPRING_DATASOURCE_USERNAME` – Database username
- `SPRING_DATASOURCE_PASSWORD` – Database password
- `SPRING_DATA_REDIS_HOST` – Redis host
- `SPRING_DATA_REDIS_PORT` – Redis port
- `JWT_SECRET` – JWT secret key
- `JWT_EXPIRATION` – JWT token expiration time (ms)

---

## 📝 Security Notes

- Change the default JWT secret in production
- Use strong passwords for database
- Enable HTTPS in production
- Set `SPRING_MVC_CORS_ALLOWED_ORIGINS` to your Vercel URL on Render
- Regularly update dependencies
- Use environment variables for sensitive data

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## 📄 License

This project is licensed under the MIT License.
