# GatewayHub: Complete Project Documentation

A comprehensive guide to building a microservices application with an API gateway.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
5. [Key Features](#key-features)
6. [How to Run](#how-to-run)
7. [Common Issues](#common-issues)

---

## Project Overview

GatewayHub is a complete web application that demonstrates modern microservices architecture. It shows how real companies like Netflix, Amazon, and Uber build their systems.

### What It Does
- **User Management**: Users can register and log in securely
- **Order Management**: Users can create, view, update, and delete orders
- **Smart Predictions**: Analyzes text to determine if it's positive or negative (sentiment analysis)

### Why It Matters
This project teaches you how to:
- Build secure, scalable systems
- Handle failures gracefully
- Protect against abuse
- Deploy applications with Docker
- Work with modern technologies used by top companies

---

## Architecture

```
┌─────────────┐
│   React     │  (Frontend - What users see)
│  Frontend   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  API Gateway    │  (Security Guard - Protects and routes)
│  (Spring Cloud) │
└──────┬──────────┘
       │
  ┌────┴────┬─────────┬──────────┐
  ▼         ▼         ▼          ▼
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐
│ User │ │Order │ │  ML  │ │      │
│Serv  │ │Serv  │ │Serv  │ │      │
└───┬──┘ └───┬──┘ └───┬──┘ │ MySQL │
    │        │        │   └───┬──┘
    └────────┴────────┴─────┘ (Database)
```

### How It Works
1. **Frontend**: Users interact with a website built with React
2. **Gateway**: All requests go through a security gateway that:
   - Checks if you're logged in
   - Limits how many requests you can make
   - Routes requests to the right service
   - Handles failures gracefully
3. **Services**: Different services handle specific tasks
4. **Database**: All data is stored securely

---

## Technology Stack

| Component | Technology | Why It's Used |
|-----------|-----------|---------------|
| **Frontend** | React 19 + Tailwind CSS | Modern, fast, easy to use |
| **Gateway** | Spring Cloud Gateway | Industry standard for microservices |
| **User Service** | Django + DRF | Secure, reliable, used by Instagram |
| **Order Service** | Spring Boot | Robust, scalable, enterprise-grade |
| **ML Service** | FastAPI + scikit-learn | Fast, great for AI/ML |
| **Database** | MySQL 8 | Reliable, widely used |
| **Containerization** | Docker + Compose | Easy deployment |
| **Authentication** | JWT (JSON Web Tokens) | Stateless, secure |

---

## Phase-by-Phase Implementation

### Phase 1: Project Setup ✅

**Goal**: Set up the project structure, tools, and version control.

**What We Did**:
- Created folder structure for all services
- Set up Git with proper .gitignore
- Created documentation files (STATUS.md, NOTES.md, README.md)
- Verified all required tools (Java, Python, Node.js, MySQL, Docker)

**Key Decisions**:
- **Monorepo**: All services in one repository for easy management
- **Database per service**: Each service has its own database (real microservices practice)
- **Environment variables**: Secrets never committed to Git

**Files Created**:
- `.gitignore` - Excludes sensitive files
- `docs/STATUS.md` - Tracks project progress
- `docs/NOTES.md` - This documentation file
- `README.md` - Project overview

---

### Phase 2: Backend Services ✅

**Goal**: Build three backend services that work independently.

#### 2.1 User Service (Django) - Port 8001

**Purpose**: Handle user registration and login, issue JWT tokens.

**Functionality**:
- `POST /register` - Create new user account
- `POST /login` - Verify credentials and return JWT token

**Key Features**:
- Passwords are hashed (never stored in plain text)
- JWT tokens for secure authentication
- Environment variables for configuration
- MySQL database for user data

**Implementation Details**:
- Django framework with Django REST Framework
- MySQL database (`users_db`)
- JWT token with user ID and username
- Token expires after configurable time (default 60 minutes)

**Security Note**: The service issues tokens but doesn't protect its own routes yet. Security moves to the gateway in Phase 4.

#### 2.2 Order Service (Spring Boot) - Port 8002

**Purpose**: Manage orders (create, read, update, delete).

**Functionality**:
- `POST /orders` - Create new order
- `GET /orders` - List all orders (or filter by user ID)
- `GET /orders/{id}` - Get specific order
- `PUT /orders/{id}` - Update order
- `DELETE /orders/{id}` - Delete order

**Key Features**:
- Complete CRUD operations
- Input validation (product name required, quantity > 0, price > 0)
- MySQL database (`orders_db`)
- Each order belongs to a user (enforced in Phase 4)

**Implementation Details**:
- Spring Boot with Spring Data JPA
- Lombok for reduced boilerplate code
- DTO pattern for request validation
- Repository pattern for database operations

**Security Note**: Initially accepts any user ID from request body. This is fixed in Phase 4 when gateway provides trusted user ID.

#### 2.3 ML Service (FastAPI) - Port 8003

**Purpose**: Analyze text sentiment (positive or negative).

**Functionality**:
- `GET /health` - Check if service is running
- `POST /predict` - Analyze text and return sentiment

**Key Features**:
- Machine learning model (Logistic Regression)
- TF-IDF vectorization for text processing
- Confidence score for predictions
- Health check endpoint

**Implementation Details**:
- FastAPI framework (fast, modern)
- scikit-learn for machine learning
- Model trained on sample data (24 sentences)
- Model loaded once at startup (not per request)

**How It Works**:
1. `train.py` trains a model and saves it as `model.pkl`
2. `main.py` loads the model when service starts
3. When prediction request comes, it analyzes text and returns sentiment

**Note**: This is a simple demo model. Real production models need much more training data.

---

### Phase 3: Gateway Routing ✅

**Goal**: Create a single entry point that routes requests to the right service.

**What We Built**:
- Spring Cloud Gateway application
- Routes that forward requests based on URL paths
- URL prefix stripping for clean service URLs

**How Routing Works**:
```
http://localhost:8080/api/users/login  →  Django   :8001/login
http://localhost:8080/api/orders       →  Spring   :8002/orders
http://localhost:8080/api/predict      →  FastAPI  :8003/predict
```

**Key Features**:
- Single URL for all services (localhost:8080)
- Path-based routing
- URL prefix stripping (removes `/api/users` before forwarding)
- Environment variables for service URLs

**Configuration**:
```yaml
routes:
  - id: user-service
    uri: http://localhost:8001
    predicates:
      - Path=/api/users/**
    filters:
      - StripPrefix=1
```

**Why This Matters**:
- Clients only need to know one URL
- Easy to change service locations
- Central point for cross-cutting concerns (security, logging, etc.)

---

### Phase 4: JWT Authentication ✅

**Goal**: Add security - only logged-in users can access protected endpoints.

**What We Built**:
- JWT authentication filter in the gateway
- Token validation before routing to services
- Trusted headers for user identity
- Public endpoints for login/register

**How It Works**:
```
Request without token  →  Gateway returns 401 (Unauthorized)
Request with valid token  →  Gateway adds user headers, forwards to service
Login/Register  →  Public (no token needed)
```

**Key Features**:
- JWT token validation (signature and expiry)
- Public paths: `/api/users/register`, `/api/users/login`, `/actuator/health`
- Trusted headers: `X-User-Id`, `X-Username`
- Removes client-supplied identity headers (prevents spoofing)

**Security Flow**:
1. User logs in → gets JWT token
2. User sends requests with `Authorization: Bearer <token>` header
3. Gateway validates token
4. Gateway extracts user ID from token
5. Gateway adds `X-User-Id` header to request
6. Service uses `X-User-Id` (trusts gateway)

**Order Service Changes**:
- Removed `userId` from request body (can't fake it anymore)
- Reads `X-User-Id` from header instead
- Only returns user's own orders
- Ownership checks on get/update/delete

**Why This Is Secure**:
- Token issued by Django, verified by gateway (same secret)
- Services trust gateway (private network in Phase 8)
- Identity comes from verified token, not request body
- Clients can't spoof user identity

---

### Phase 5: Rate Limiting & Logging ✅

**Goal**: Protect against abuse and track requests for debugging.

**What We Built**:
- Rate limiting filter (max requests per minute)
- Request ID logging (correlation IDs)
- Standard HTTP headers for rate limits

**How It Works**:
```
Request
  → RequestIdLoggingFilter (adds unique ID, logs request/response)
  → RateLimitFilter (counts requests per IP, blocks if over limit)
  → JwtAuthFilter (validates token)
  → Service
```

**Rate Limiting Features**:
- Fixed-window counter algorithm
- Per-IP rate limiting
- Returns 429 (Too Many Requests) when exceeded
- Adds headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`
- Configurable limit (10 per minute for demo, 100 for dev)

**Request ID Features**:
- Generates unique UUID for each request
- Adds `X-Request-Id` header to request and response
- Logs request start and end with status and timing
- Client can quote ID when reporting issues

**Configuration**:
```yaml
ratelimit:
  max-requests: 100
  window-seconds: 60
```

**Why This Matters**:
- Prevents abuse and DDoS attacks
- Makes debugging easier (trace requests across services)
- Standard HTTP headers for rate limits
- Protects services from overload

**Limitations** (for production):
- In-memory counters (reset on restart)
- Per-IP limiting (not per-user)
- Better approach: Redis-backed rate limiting

---

### Phase 6: Circuit Breaker ✅

**Goal**: Handle service failures gracefully without crashing the whole system.

**What We Built**:
- Circuit breaker for each service
- Timeouts for connections and responses
- Fallback endpoint for errors
- Health checks

**How Circuit Breaker Works**:
```
CLOSED (normal) 
  → too many failures 
  → OPEN (fail fast, return 503) 
  → wait 10 seconds 
  → HALF-OPEN (test calls) 
  → if success → CLOSED
```

**Key Features**:
- Timeouts: 2s connect, 5s response
- Circuit breaker opens after 50% failure rate
- Fallback returns "Service temporarily unavailable"
- One breaker per service (isolated failures)

**Configuration**:
```yaml
resilience4j:
  circuitbreaker:
    configs:
      default:
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
```

**Fallback Controller**:
- Endpoint: `/fallback/{service}`
- Returns 503 with friendly message
- Prevents cascading failures

**Why This Matters**:
- One failing service doesn't crash everything
- Users get fast errors instead of hanging
- System remains partially functional
- Real-world resilience pattern

**Example**:
- ML service crashes
- Circuit breaker opens
- Users see "ML service temporarily unavailable"
- Order service still works
- After 10 seconds, breaker tries ML service again

---

### Phase 7A: React Frontend ✅

**Goal**: Build a user-friendly web interface.

**What We Built**:
- React application with Tailwind CSS
- Login and registration pages
- Protected routes (require login)
- API helper for backend calls

**Pages**:
- **Login/Register**: Toggle between login and registration forms
- **Orders Placeholder**: Temporary page (replaced in Phase 7B)

**Key Features**:
- Token storage in localStorage
- Automatic redirect to login if not authenticated
- Error handling for 401, 429, network errors
- One API helper for all backend calls

**API Helper (`api.js`)**:
- Adds `Authorization: Bearer <token>` header
- Handles 401 (clears token, redirects to login)
- Handles 429 (rate limit exceeded)
- Handles network errors
- Centralized error messages

**CORS Configuration**:
- Browser blocks cross-origin requests by default
- Gateway adds CORS headers
- Allows frontend to call gateway
- Preflight requests handled correctly

**Why React**:
- Modern, component-based
- Large community and job market
- Fast development with hot reload
- Great for single-page applications

---

### Phase 7B: Orders & Predict Pages ✅

**Goal**: Complete the frontend with full functionality.

**What We Built**:
- Orders page with full CRUD
- Predict page for sentiment analysis
- Navigation bar with logout
- Protected layout for all private pages

**Orders Page Features**:
- Create new orders (product, quantity, price)
- List all orders (filtered by logged-in user)
- Edit existing orders
- Delete orders
- Real-time updates with React state
- Form validation

**Predict Page Features**:
- Text input for sentiment analysis
- Shows POSITIVE (green) or NEGATIVE (red)
- Displays confidence percentage
- Error handling for ML service failures

**Navigation Bar**:
- Links to Orders and Predict pages
- Logout button (clears token, redirects to login)
- Active state indication

**Protected Layout**:
- Checks for token on all private pages
- Redirects to login if not authenticated
- Renders navbar and page content
- DRY principle (Don't Repeat Yourself)

**Key Learnings**:
- Frontend never sends user ID (gateway derives from token)
- One API helper keeps code clean
- Circuit breaker errors shown in UI
- Server-side authorization (ownership checks)

---

### Phase 8A: Docker Backend ✅

**Goal**: Run all backend services with Docker Compose.

**What We Built**:
- Dockerfile for each service
- Docker Compose configuration
- MySQL initialization script
- Environment variable configuration

**How Docker Works**:
```
Your machine → Docker → Containers (MySQL, User, Order, ML, Gateway)
                      Private network (services talk to each other)
                      Only gateway exposed to your machine
```

**Dockerfile Features**:
- **Java services**: Two-stage build (Maven compile → JRE run)
- **Python services**: Install dependencies, run migrations
- **ML service**: Train model during build
- Small final images (only what's needed)

**Docker Compose Features**:
- All services defined in one file
- Service dependencies (wait for MySQL)
- Health checks
- Named volumes for data persistence
- Environment variable injection

**Security Improvement**:
- Only gateway exposed to host (port 8080)
- Other services on private network
- Can't call services directly (fixes Phase 4 security gap)
- Real microservices security

**Commands**:
```bash
docker compose up --build      # Build and start all services
docker compose ps              # See running containers
docker compose logs -f <name>  # Follow logs
docker compose down            # Stop (data kept)
docker compose down -v         # Stop and delete data
```

**Why Docker**:
- Consistent environment (works same everywhere)
- Easy deployment (one command)
- Isolation (services don't conflict)
- Scalability (easy to add more instances)

---

### Phase 8B: Frontend Container & Dev/Prod Profiles ✅

**Goal**: Containerize frontend and support dev/prod environments.

**What We Built**:
- Frontend Dockerfile (multi-stage build)
- nginx configuration for serving React
- Dev environment file (.env.dev)
- Prod environment file (.env.prod.example)
- Configurable rate limits and settings

**Frontend Container**:
- Stage 1: Node build (npm ci, npm run build)
- Stage 2: nginx serves static files
- SPA fallback (React Router works on refresh)
- Build argument for API URL

**Dev vs Prod Differences**:

| Setting | Dev | Prod |
|---------|-----|------|
| Secrets | Simple (local only) | Strong, random |
| JWT expiry | 60 minutes | 15 minutes |
| Django DEBUG | True | False |
| DDL_AUTO | update | validate |
| Rate limit | 100/min | 60/min |
| CORS origin | localhost:3000 | your-domain.com |
| Frontend port | 3000 | 80 |

**Environment Files**:
- `.env.dev` - Development configuration
- `.env.prod.example` - Production template (committed)
- `.env.prod` - Actual production secrets (not committed)
- `.gitignore` - Excludes all .env files except examples

**Commands**:
```bash
# Development
docker compose --env-file .env.dev up --build

# Production
cp .env.prod.example .env.prod  # Edit secrets
docker compose --env-file .env.prod up --build
```

**Why This Matters**:
- Same code, different configuration
- Production-ready security settings
- Easy to switch environments
- Secrets never committed to Git

---

## Key Features Summary

### 1. Single Entry Point
- All requests go through the gateway
- Services are on private network
- Easier to secure and manage

### 2. Centralized Authentication
- JWT validation at the gateway
- Services trust gateway for user identity
- No repeated auth logic in services

### 3. Rate Limiting
- Protects against abuse
- Configurable limits per environment
- Standard HTTP headers

### 4. Request Tracing
- Unique ID for each request
- Logs flow through all services
- Easy debugging

### 5. Circuit Breaker
- Graceful failure handling
- Prevents cascading failures
- Fast fail, slow recovery

### 6. CORS Support
- Frontend can call gateway
- Configurable origins
- Works in dev and prod

### 7. Environment Profiles
- Dev: relaxed settings, debugging
- Prod: strict security, minimal logging
- Same code, different config

### 8. Docker Support
- One-command deployment
- Consistent environments
- Easy to scale

---

## How to Run

### Prerequisites
- Docker Desktop installed and running
- Git
- (Optional) JDK 17, Python 3.12, Node.js for local development

### Development Mode (Docker)
```bash
cd gatewayhub
docker compose --env-file .env.dev up --build
```
Access at: http://localhost:3000

### Production Mode (Docker)
```bash
cd gatewayhub
cp .env.prod.example .env.prod
# Edit .env.prod with your actual secrets
docker compose --env-file .env.prod up --build
```

### Local Development (Without Docker)
See README.md for detailed instructions on running each service locally.

### Stop Services
```bash
docker compose down
```

---

## Common Issues

### Issue: Docker Desktop not running
**Solution**: Start Docker Desktop from Windows Start menu

### Issue: Port already in use
**Solution**: Stop the service using the port or change the port in docker-compose.yml

### Issue: "ModuleNotFoundError" in Python
**Solution**: You're in the wrong virtual environment. Deactivate and activate the correct one.

### Issue: MySQL connection refused
**Solution**: Make sure MySQL is running and credentials are correct in .env file

### Issue: CORS errors in browser
**Solution**: Check CORS_ORIGIN in environment file matches your frontend URL exactly

### Issue: Circuit breaker always open
**Solution**: Check if the service is actually running. Stop/start the service to reset the breaker.

---

## What I Learned

### Technical Skills
1. Microservices architecture
2. API Gateway pattern
3. JWT authentication
4. Rate limiting strategies
5. Circuit breaker pattern
6. Docker containerization
7. Environment management
8. React with modern tools
9. Database design
10. Machine learning integration

### Soft Skills
1. System design thinking
2. Security-first mindset
3. Problem decomposition
4. Documentation skills
5. Testing methodology

---

## Future Enhancements

1. **Payment Integration**: Add real payment processing
2. **More ML Features**: Multi-language sentiment analysis
3. **User Profiles**: Profile pictures, preferences
4. **Email Notifications**: Order updates via email
5. **Admin Dashboard**: User and order management
6. **Analytics**: User behavior tracking
7. **Mobile App**: React Native or Flutter
8. **Cloud Deployment**: AWS, GCP, or Azure
9. **Redis**: For rate limiting and caching
10. **Monitoring**: Prometheus, Grafana

---

## Conclusion

GatewayHub demonstrates modern software engineering practices. It shows how to build secure, scalable, and maintainable systems using industry-standard technologies. The project covers the full software development lifecycle from design to deployment, making it an excellent showcase of technical skills and problem-solving abilities.

This project is production-ready and can be extended with additional features as needed.
