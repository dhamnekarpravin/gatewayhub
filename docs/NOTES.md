# GatewayHub: Project Notes

A mini microservices project that demonstrates how an API gateway works in a real project.

**Architecture:** React → Spring Cloud Gateway → Django (users) / Spring Boot (orders) / FastAPI (ML) → MySQL

---

## 1. Concepts

### API Gateway
A single entry point for all client requests. The client (React) knows only the gateway URL. The gateway handles:
- **Routing:** `/api/users/**`, `/api/orders/**`, `/api/predict/**` go to different services
- **Authentication:** validates the JWT once, so services don't repeat it
- **Rate limiting:** blocks abusive traffic with a `429`
- **Logging and tracing:** request IDs across services
- **Resilience:** timeouts and circuit breakers when a service is down
- **CORS and TLS** in one place

In production, backend services sit on a private network and only the gateway is public.

### Environments
| Environment | Purpose | Data |
|---|---|---|
| Dev | Developers build and test | Fake data |
| UAT | QA and business users sign off before release | Production-like (masked) |
| Prod | Live system for real users | Real data |

The code is the same everywhere; only the **configuration** changes (DB URLs, secrets, service URLs, log levels, rate limits).
Spring Boot uses `application-dev.yml` / `application-prod.yml`, Django uses separate settings or env vars, FastAPI uses `.env`.

### Microservice principles used here
- **Database per service:** each service owns its own database (`users_db`, `orders_db`). No shared tables.
- **Independent apps:** each service has its own dependencies, port, and (later) Dockerfile.
- **Secrets in environment config**, never hard-coded or committed.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Tailwind CSS |
| Gateway | Spring Cloud Gateway |
| User Service | Django + Django REST Framework |
| Order Service | Spring Boot + Spring Data JPA |
| ML Service | FastAPI + scikit-learn |
| Database | MySQL 8 |
| Auth | JWT |
| Resilience | Resilience4j |
| Containers | Docker + Docker Compose |

**Ports:** user-service `8001`, order-service `8002`, ml-service `8003`, gateway `8080` (planned)

---

## 3. Phase 1: Setup ✅

**Goal:** tools check, folder structure, Git, notes and status files.

### Tools required
JDK 17+, Maven, Python 3.10+, Node 18+, MySQL 8, Docker Desktop, Git, an IDE, Postman.

Verify with:
```bash
java -version
mvn -version
python --version
node -v
npm -v
mysql --version
docker --version
git --version
```

### Folder structure (monorepo)
```
gatewayhub/
├── api-gateway/
├── user-service/
├── order-service/
├── ml-service/
├── frontend/
└── docs/
```

### Git
- `git init`, then a `.gitignore` covering `target/`, `venv/`, `node_modules/`, `.env`, IDE files.
- **Rule:** commit `.env.example` (fake values), never `.env`.
- Commit after each phase with a clear message, for example `Phase 1: project structure, gitignore, notes and status`.

### Docs
- `docs/STATUS.md`: phase tracker (⬜ not started, 🟡 in progress, ✅ done)
- `docs/NOTES.md`: this file
- `README.md`: project overview

---

## 4. Phase 2: Backend Services 🟡 (in progress)

Services are built one at a time with no security and no gateway yet, so each one works on its own port first.

### 4.1 User Service (Django + DRF), port 8001

**Step 1: Create the database and user in MySQL**
```sql
CREATE DATABASE users_db CHARACTER SET utf8mb4;
CREATE USER 'gh_user'@'localhost' IDENTIFIED BY 'gh_pass123';
GRANT ALL PRIVILEGES ON users_db.* TO 'gh_user'@'localhost';
FLUSH PRIVILEGES;
```
The password above is for local dev only. In real environments it comes from env config or a secrets manager.

**Step 2: Create the project**
```bash
cd user-service
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash
# source venv/bin/activate        # Mac/Linux
pip install django djangorestframework mysqlclient python-dotenv
django-admin startproject config .
python manage.py startapp accounts
```
`config` holds the project settings; `accounts` is the app for register and login.

**Step 3: Environment files**

`user-service/.env` (not committed):
```
DB_NAME=users_db
DB_USER=gh_user
DB_PASSWORD=gh_pass123
DB_HOST=localhost
DB_PORT=3306
SECRET_KEY=dev-only-change-me
DEBUG=True
```
`user-service/.env.example` (committed, same keys with blank secrets).

**Step 4: `config/settings.py` changes**
- Added `load_dotenv()` at the top
- `SECRET_KEY = os.getenv("SECRET_KEY")` and `DEBUG = os.getenv("DEBUG") == "True"`
- Added `'rest_framework'` and `'accounts'` to `INSTALLED_APPS`
- Replaced `DATABASES` with the MySQL config read from env variables

**Step 5: Run and verify**
```bash
python manage.py migrate
python manage.py runserver 8001
```
Open `http://localhost:8001`. The Django welcome page means success.

### 4.2 Order Service (Spring Boot), port 8002
(to be added)

### 4.3 ML Service (FastAPI), port 8003
(to be added)

---

## 5. Remaining Phases
- Phase 3: Gateway routing
- Phase 4: JWT auth at the gateway
- Phase 5: Rate limiting and logging
- Phase 6: Circuit breaker and error handling
- Phase 7: React frontend
- Phase 8: Docker Compose and dev/prod profiles
- Phase 9: Testing and wrap-up

---

## 6. Issues Faced and Fixes

| Issue | Cause | Fix |
|---|---|---|
| `mysqlclient` fails to install on Windows | Needs C build tools and MySQL headers | Use `PyMySQL` instead (`pip install pymysql`, then `import pymysql; pymysql.install_as_MySQLdb()` in `config/__init__.py`) |
| `.env` shows up in `git status` | `.gitignore` missing or added after the first commit | Add `.env` to `.gitignore`; if already tracked, run `git rm --cached user-service/.env` |
| `mysql` command not found | MySQL bin folder not on PATH | Add the MySQL `bin` directory to PATH, or use MySQL Workbench |
| (add your own issues here as we go) | | |

---

## 7. Decisions Log

| Decision | Reason |
|---|---|
| Monorepo | Easy to run and review one project at a time |
| Database per service | Real microservice practice; services stay independent |
| Gateway is the only public entry | Security and a single place for cross-cutting concerns |
| Spring Cloud Gateway | Common in Java projects; teaches concepts in code |
| Secrets via `.env` | Same code works in dev and prod with different config |

=====================

### 4.1 User Service (Django + DRF), port 8001 ✅

#### Setup (Steps 2.1 to 2.5)

**Create the database and user in MySQL**
```sql
CREATE DATABASE users_db CHARACTER SET utf8mb4;
CREATE USER 'gh_user'@'localhost' IDENTIFIED BY 'gh_pass123';
GRANT ALL PRIVILEGES ON users_db.* TO 'gh_user'@'localhost';
FLUSH PRIVILEGES;
```
The password is for local dev only. In real environments it comes from env config or a secrets manager.

**Create the project**
```bash
cd user-service
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash
# source venv/bin/activate        # Mac/Linux
pip install django djangorestframework mysqlclient python-dotenv
django-admin startproject config .
python manage.py startapp accounts
```

**`config/settings.py` changes**
- `load_dotenv()` at the top
- `SECRET_KEY` and `DEBUG` read from env
- `'rest_framework'` and `'accounts'` added to `INSTALLED_APPS`
- `DATABASES` replaced with MySQL config read from env

**Run and verify**
```bash
python manage.py migrate
python manage.py runserver 8001
```

#### Register and Login with JWT (Steps 2.6 to 2.12)

**What we built**
| Endpoint | Method | Purpose | Success | Failure |
|---|---|---|---|---|
| `/register` | POST | Create a user | `201` with id, username, email | `400` on validation errors |
| `/login` | POST | Verify credentials, return JWT | `200` with `access_token` | `401` on wrong credentials |

**Install**
```bash
pip install PyJWT
```

**New env variables** (in `.env`; same keys with blank values in `.env.example`)
```
JWT_SECRET=dev-jwt-secret-must-be-at-least-32-characters-long
JWT_EXPIRY_MINUTES=60
```

**Files added or changed**
| File | Purpose |
|---|---|
| `accounts/serializers.py` | `RegisterSerializer` (validates input, hashes password via `create_user`) and `LoginSerializer` |
| `accounts/views.py` | `RegisterView` and `LoginView` (builds and signs the JWT) |
| `accounts/urls.py` | Routes `register` and `login` |
| `config/urls.py` | Includes `accounts.urls` at the root |

**Token payload**
| Claim | Meaning |
|---|---|
| `sub` | User id (the standard "subject" claim) |
| `username` | Username, so downstream services can show or log it |
| `iat` | Issued-at time |
| `exp` | Expiry time (now + `JWT_EXPIRY_MINUTES`) |

Signed with **HS256** using `JWT_SECRET`.

**Test commands**
```bash
# Register
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"username":"rahul","email":"rahul@test.com","password":"pass1234"}'

# Login
curl -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"username":"rahul","password":"pass1234"}'
```
Paste the token into https://jwt.io to inspect the payload.

**Key learnings**
- Passwords are **hashed** by Django's `create_user`; never stored in plain text.
- The service **issues** the token but does not protect its own routes yet. Validation moves to the gateway in Phase 4.
- The gateway must use the **same `JWT_SECRET`** to verify tokens. HS256 is a shared-secret scheme: whoever can verify can also forge, so the secret must stay out of Git and out of the frontend.
- Routes live at `/register` and `/login` (no `/api/users` prefix). In Phase 3 the gateway will strip the prefix, so `/api/users/login` becomes `/login`.
- Java's JWT libraries reject HS256 keys shorter than 32 characters, which is why the dev secret is long.
- A JWT is **signed, not encrypted**. Anyone can read the payload, so never put passwords or sensitive data in it.

=======================

### 4.2 Order Service (Spring Boot), port 8002 ✅

**What it does:** create, view, update and delete orders, stored in MySQL (`orders_db`). No security yet; the gateway will add that later.

#### Setup

**Create the database**
```sql
CREATE DATABASE orders_db CHARACTER SET utf8mb4;
GRANT ALL PRIVILEGES ON orders_db.* TO 'gh_user'@'localhost';
FLUSH PRIVILEGES;
```
Each service owns its own database. The same local user `gh_user` is reused only to keep dev simple.

**Generate the project** at https://start.spring.io

| Field | Value |
|---|---|
| Project / Language | Maven / Java |
| Spring Boot | Latest stable 3.x (not SNAPSHOT) |
| Group / Artifact | `com.gatewayhub` / `order-service` |
| Packaging / Java | Jar / 17 |
| Dependencies | Spring Web, Spring Data JPA, MySQL Driver, Validation, Lombok |

Unzip and copy the **contents** into `gatewayhub/order-service/` so `pom.xml` sits directly inside it.

**Configuration** (`src/main/resources/application.yml`; delete `application.properties`)
```yaml
server:
  port: 8002

spring:
  application:
    name: order-service
  datasource:
    url: jdbc:mysql://localhost:3306/orders_db
    username: gh_user
    password: gh_pass123
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```
`ddl-auto: update` auto-creates the table. Fine for dev; in prod use `validate` plus Flyway migrations.

#### Code structure

Base package: `com.gatewayhub.order_service` (note the underscore, see Issues below).

| File | Role |
|---|---|
| `model/Order.java` | Entity mapped to the `orders` table (id, userId, productName, quantity, price, status, createdAt) |
| `repository/OrderRepository.java` | Extends `JpaRepository`; Spring generates the SQL. Adds `findByUserId` |
| `dto/OrderRequest.java` | Request body with validation rules (`@NotBlank`, `@Min(1)`, `@DecimalMin`) |
| `controller/OrderController.java` | REST endpoints under `/orders` |

#### Endpoints

| Method | URL | Purpose | Success | Failure |
|---|---|---|---|---|
| POST | `/orders` | Create an order | `201` | `400` validation error |
| GET | `/orders` | List all (optional `?userId=`) | `200` | |
| GET | `/orders/{id}` | Get one | `200` | `404` |
| PUT | `/orders/{id}` | Update | `200` | `400` / `404` |
| DELETE | `/orders/{id}` | Delete | `204` | `404` |

#### Run and test
```bash
cd order-service
mvn spring-boot:run
```
Look for `Tomcat started on port 8002` and `Started OrderServiceApplication`. Tested in **Insomnia** with a `GatewayHub` collection and an `Order Service` folder.

Sample create body:
```json
{ "userId": "1", "productName": "Laptop", "quantity": 1, "price": 55000.00 }
```

#### Key learnings
- **Table is named `orders`** because `order` is a reserved SQL word.
- **DTO instead of entity** in the request, so clients cannot set `id` or `status`.
- **`userId` in the body is temporary.** In Phase 4 the gateway will pass it from the JWT as a header, and we will remove it from the request.
- **Routes have no `/api` prefix** (`/orders`). The gateway will map `/api/orders/**` to this in Phase 3.
- **Spring only scans the main class's package and below.** A controller in a different package is invisible to Spring.
- **Services are independent.** The Order Service does not need Django running; it only needs MySQL.
- A Spring Boot error JSON (`timestamp`, `status`, `error`, `path`) tells you the app is running but the route was not found.

=====================

### 4.3 ML Service (FastAPI), port 8003 ✅

**What it does:** takes a sentence and returns `POSITIVE` or `NEGATIVE` with a confidence score. It is a small scikit-learn model; the point of the project is the gateway, but the serving pattern is the same one used for larger models. No database needed.

#### Setup
```bash
cd ml-service
python -m venv venv
source venv/Scripts/activate      # Windows Git Bash
# source venv/bin/activate        # Mac/Linux
pip install fastapi "uvicorn[standard]" scikit-learn joblib
pip freeze > requirements.txt
```
`requirements.txt` records dependencies; Docker uses it in Phase 8.

#### Files

| File | Role |
|---|---|
| `train.py` | Trains a TF-IDF + Logistic Regression pipeline on 24 example sentences and saves it as `model.pkl`. Run once. |
| `main.py` | FastAPI app. Loads `model.pkl` at startup and serves predictions. |
| `model.pkl` | The trained model (generated, not hand-written) |
| `requirements.txt` | Pinned dependencies |

#### How it works
1. `train.py` builds a pipeline: **TfidfVectorizer** (turns text into numbers) then **LogisticRegression** (classifies).
2. `joblib.dump` saves the whole pipeline to `model.pkl`.
3. On startup, `main.py` loads the file once, so each request only runs `predict_proba`.
4. The response includes the label with the highest probability and its confidence.

#### Endpoints

| Method | URL | Purpose | Success | Failure |
|---|---|---|---|---|
| GET | `/health` | Liveness check | `200` `{"status":"UP"}` | |
| POST | `/predict` | Predict sentiment | `200` | `422` validation error, `503` model not loaded |

Request: `{ "text": "I love this, it works great" }`
Response: `{ "text": "...", "sentiment": "POSITIVE", "confidence": 0.8 }`

#### Run and test
```bash
python train.py                           # once, creates model.pkl
uvicorn main:app --port 8003 --reload
```
- Interactive docs (auto-generated): `http://localhost:8003/docs`
- Tested in Insomnia: health, positive, negative, and empty-text validation.

#### Key learnings
- **Train and serve are separate steps.** Training happens offline; the API only loads the saved model.
- **Load the model once at startup**, not on every request.
- **Pydantic validation is automatic.** `Field(min_length=1)` rejects empty text with `422`.
- **FastAPI uses `422`** for validation errors where Spring uses `400`. Both mean the input broke the rules.
- **`/health` endpoint:** the gateway and Docker can use it later to check the service is alive.
- **Routes have no `/api` prefix** (`/predict`), consistent with the other services. The gateway will map `/api/predict/**` here.
- **Toy dataset:** 24 sentences is only for the demo, so confidence scores will be modest. Real models need far more data.
- **Security note:** only load `.pkl` files you trained yourself. Pickle files can execute code when loaded.


==============================

## 5. Phase 3: Gateway Routing ✅

**Goal:** one URL (`http://localhost:8080`) that forwards requests to the right service. Routing only, no security yet.

### How it works
```
http://localhost:8080/api/users/login  →  Django   :8001/login
http://localhost:8080/api/orders       →  Spring   :8002/orders
http://localhost:8080/api/predict      →  FastAPI  :8003/predict
```
The gateway matches the path, **strips the prefix**, and forwards the request. That is why the services have no `/api` in their own routes.

### Setup
Generate at https://start.spring.io

| Field | Value |
|---|---|
| Project / Language | Maven / Java |
| Spring Boot | Latest stable (ours: 4.1.1) |
| Group / Artifact | `com.gatewayhub` / `api-gateway` |
| Packaging / Java | Jar / 17 |
| Dependencies | **Reactive Gateway** (`spring-cloud-starter-gateway-server-webflux`) and **Actuator** |

Copy the **contents** of the unzipped folder into `gatewayhub/api-gateway/` so `pom.xml` sits directly inside it. Delete `application.properties`.

### Configuration (`src/main/resources/application.yml`)
```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      server:
        webflux:
          routes:
            - id: user-service
              uri: ${USER_SERVICE_URL:http://localhost:8001}
              predicates:
                - Path=/api/users/**
              filters:
                - StripPrefix=2
            - id: order-service
              uri: ${ORDER_SERVICE_URL:http://localhost:8002}
              predicates:
                - Path=/api/orders/**
              filters:
                - StripPrefix=1
            - id: ml-service
              uri: ${ML_SERVICE_URL:http://localhost:8003}
              predicates:
                - Path=/api/predict/**
              filters:
                - StripPrefix=1

management:
  endpoints:
    web:
      exposure:
        include: health,gateway
```

### How to read a route
| Part | Meaning |
|---|---|
| `id` | Name of the route |
| `uri` | Where to forward the request |
| `Path=/api/users/**` | Match any URL starting with this |
| `StripPrefix=N` | Remove the first N path segments before forwarding |
| `${USER_SERVICE_URL:http://localhost:8001}` | Use the env variable if set, else localhost (dev vs prod idea; Docker will set it in Phase 8) |

### Endpoints tested through the gateway
| Method | URL | Result |
|---|---|---|
| POST | `/api/users/register` | `201` |
| POST | `/api/users/login` | `200` + token |
| POST | `/api/orders` | `201` |
| GET | `/api/orders` | `200` |
| POST | `/api/predict` | `200` |

### Run order
Start MySQL, then User (8001), Order (8002), ML (8003), and the Gateway (8080) in four terminals. The gateway log should say **`Netty started on port 8080`**.

### Key learnings
- **Spring Cloud Gateway is reactive** (WebFlux, Netty), not servlet-based (Tomcat).
- **Never add both** `gateway-server-webflux` and `gateway-server-webmvc`. The webmvc one switches the app to servlet mode and the reactive gateway stops working.
- **YAML prefix

=====================

## 6. Phase 4: JWT Authentication at the Gateway ✅

**Goal:** the gateway validates the token once. No valid token means `401`. Valid requests carry the user's identity to the services in trusted headers.

### How it works
```
No token / bad token  →  Gateway returns 401 (service never sees the request)
Valid token           →  Gateway adds X-User-Id and X-Username, forwards to service
Register / login      →  Public (needed to get a token)
```

Public paths: `/api/users/register`, `/api/users/login`, `/actuator/health`. Everything else is protected.

### Gateway changes

**1. Dependencies (`pom.xml`):** JJWT `0.12.6` (`jjwt-api`, plus `jjwt-impl` and `jjwt-jackson` at runtime scope). Never add `spring-boot-starter-web` or webmvc, since it breaks the reactive gateway.

**2. Config (`application.yml`):**
```yaml
jwt:
  secret: ${JWT_SECRET:dev-jwt-secret-must-be-at-least-32-characters-long}
```
Must match `JWT_SECRET` in `user-service/.env`, otherwise every token is rejected.

**3. Filter:** `filter/JwtAuthFilter.java` is a `GlobalFilter` with order `-1`, so it runs before routing.

| Step in the filter | Purpose |
|---|---|
| Skip `PUBLIC_PATHS` | Login and register need no token |
| Read `Authorization: Bearer <token>` | Standard header format |
| `Jwts.parser().verifyWith(key)` | Checks signature and expiry |
| Remove client `X-User-Id` / `X-Username` | Stops identity spoofing |
| Add `X-User-Id` (from `sub`) and `X-Username` | Trusted identity for services |
| On failure, return JSON `401` | Clean error, request stops here |

### Order Service changes
- Removed `userId` from `OrderRequest`, so clients can no longer choose who an order belongs to.
- Controller reads `@RequestHeader("X-User-Id")`.
- List returns only the caller's orders (`findByUserId`).
- Get, update and delete check ownership; another user's order returns `404`.

### Tests (Insomnia, Auth tab, Bearer Token)

| Test | Expected |
|---|---|
| GET `/api/orders` with no token | `401` |
| Login | `200` + token |
| Fake token `abc.def.ghi` | `401` |
| Valid token | `200` |
| POST with fake `X-User-Id: 999` header | `201`, saved with the real id from the token |
| Other user requests your order id | `404` |
| Call Order Service directly (8002) without the header | `400` |

### Key learnings
- **Authentication at the edge:** the gateway verifies the token once; services trust the headers.
- **Strip, then set:** always remove client-supplied identity headers before adding trusted ones.
- **Never trust the request body for identity.** Take the user id from the verified token.
- **Authorization is still needed in services:** the gateway proves who you are, the Order Service decides what you may touch (ownership check). Returning `404` instead of `403` avoids revealing that another user's order exists.
- **Shared secret (HS256):** the same secret signs in Django and verifies in the gateway. Keep it in environment config, never in Git.
- **Security gap to remember:** services on 8001 to 8003 still accept direct calls with a fake `X-User-Id`. In Phase 8 (Docker) they will sit on a private network so only the gateway can reach them.
- **Token expiry:** `exp` is checked automatically; an expired token gives `401`.

### Interview points
- "Authentication is centralized in a global filter; services receive identity via trusted headers."
- "The filter strips inbound identity headers to prevent spoofing."
- "JWT is stateless, so the gateway needs no session store or database call."
- "Gateway handles authentication; services handle authorization."

============================

## 7. Phase 5: Rate Limiting, Logging and Request IDs ✅

**Goal:** protect services from too many requests (`429`) and tag every request with an ID so it can be traced through the logs.

### How it works
```
Request
  → RequestIdLoggingFilter (-3)  adds X-Request-Id, logs request and response
  → RateLimitFilter (-2)         counts requests per client IP, returns 429 if over limit
  → JwtAuthFilter (-1)           validates the token
  → route to service
```
Lowest order number runs first.

### Config (`application.yml`)
```yaml
ratelimit:
  max-requests: 10
  window-seconds: 60

logging:
  level:
    com.gatewayhub.api_gateway: INFO
```
10 per minute is deliberately low so it is easy to trigger while testing. Prod config will use a higher value.

### Files added (`com.gatewayhub.api_gateway.filter`)

| File | Role |
|---|---|
| `RequestIdLoggingFilter.java` | Generates a UUID per request, sets `X-Request-Id` on the request and the response, logs `-->` on entry and `<--` with status and time on exit |
| `RateLimitFilter.java` | Fixed-window counter per client IP in a `ConcurrentHashMap`; adds `X-RateLimit-Limit`, `X-RateLimit-Remaining`; returns `429` with `Retry-After` when exceeded |

### Order Service change (optional tracing)
- `OrderController.create` accepts the optional `X-Request-Id` header and logs it, so the same `[uuid]` appears in the gateway log and the Order Service log. This is distributed tracing in its simplest form.

### Tests

| Test | Expected |
|---|---|
| GET `/api/orders` with token | `200`; headers show `X-Request-Id`, `X-RateLimit-Limit: 10`, `X-RateLimit-Remaining` |
| Gateway terminal | `[uuid] --> GET /api/orders` and `[uuid] <-- ... status=200 time=..ms` |
| Send about 12 requests quickly | First 10 pass, then `429` with `Retry-After` |
| Wait 60 seconds | Works again |
| Create an order | Same `[uuid]` in gateway and Order Service logs |

### Key learnings
- **Rate limiting runs before the JWT check**, so junk or missing tokens are rejected cheaply before any token parsing.
- **Request ID filter runs first**, so even rejected requests (`401`, `429`) get an ID and a log line.
- **Return the request ID to the client** so they can quote it when reporting a problem.
- **Fixed window algorithm:** simple, but a client can burst up to 2x the limit at a window boundary. Alternatives: sliding window, token bucket, leaky bucket.
- **The limit is per IP across all paths**, so login and other test calls count too.
- **Standard headers:** `429` plus `Retry-After` tells clients when to try again.

### Limitations (interview points)
- Counts live in memory: they reset on restart and are not shared between gateway instances.
- Old entries are never cleaned up (a memory leak risk over time).
- Keying by IP is weak: many users behind one NAT share a limit, and behind a proxy all requests may look like one IP. Production would use `X-Forwarded-For` handling or key by user id or API key.
- **Production approach:** Spring Cloud Gateway's built-in `RequestRateLimiter` backed by **Redis**, so all gateway instances share counters.

### Interview points
- "I implemented rate limiting as a global filter with a fixed-window counter, returning 429 and Retry-After."
- "Every request gets a correlation ID at the edge, propagated to services via a header, which makes cross-service debugging possible."
- "Filter ordering matters: ID, then rate limit, then auth, then routing."
- "In production I would move the counters to Redis and key by user or API key."


===============

## 8. Phase 6: Resilience (Timeouts, Circuit Breaker, Clean Errors) ✅

**Goal:** when a service is slow or down, the gateway returns a clean `503` JSON quickly, instead of a raw error or a hanging request.

### Circuit breaker in simple words
Like a fuse box. If a service keeps failing, the breaker **opens** and the gateway answers immediately with a friendly message instead of calling the broken service. After a wait, it lets a few test calls through. If they succeed, it **closes** again.

```
CLOSED (normal) → too many failures → OPEN (fail fast, 503) → wait → HALF-OPEN (test calls) → CLOSED
```

This protects the user (no long waiting) and the failing service (no flood of requests while it recovers).

### Changes

**1. Dependency (`pom.xml`):**
```xml
<dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-starter-circuitbreaker-reactor-resilience4j</artifactId>
</dependency>
```
Version comes from the Spring Cloud BOM. Still no webmvc.

**2. `controller/FallbackController.java`:** maps `/fallback/{service}` with `@RequestMapping` (all HTTP methods) and returns `503` with a JSON message.

**3. `application.yml`:**
- Each route gets a `CircuitBreaker` filter with a name and a `fallbackUri: forward:/fallback/<service>`
- `httpclient` timeouts: `connect-timeout: 2000`, `response-timeout: 5s`
- `resilience4j.circuitbreaker` and `resilience4j.timelimiter` settings per service

**4. `JwtAuthFilter`:** added `/fallback/` to `PUBLIC_PATHS`, so the internal forward is not rejected with a confusing `401`.

### Settings explained

| Setting | Value | Meaning |
|---|---|---|
| `connect-timeout` | 2000 ms | Give up connecting after 2 seconds |
| `response-timeout` | 5s | Give up waiting for a reply after 5 seconds |
| `timeout-duration` | 6s | Circuit breaker's own limit, slightly above the response timeout |
| `sliding-window-size` | 6 | Judge the last 6 calls |
| `minimum-number-of-calls` | 3 | Don't judge before 3 calls |
| `failure-rate-threshold` | 50 | Open if 50% or more failed |
| `wait-duration-in-open-state` | 10s | Stay open 10 seconds, then try again |
| `permitted-number-of-calls-in-half-open-state` | 2 | Allow 2 test calls before deciding |

Values are small on purpose, so the breaker is easy to see opening and closing during testing.

### Tests

| Test | Expected |
|---|---|
| All services up, GET `/api/orders` | `200` |
| Stop ML service, POST `/api/predict` | `503`, "ml-service is temporarily unavailable" |
| Users and orders while ML is down | Still `200` |
| Restart ML, wait about 10 seconds, POST `/api/predict` | `200` again |
| Stop Order service, GET `/api/orders` | `503`, "order-service is temporarily unavailable" |

### Key learnings
- **One failing service does not take down the others.** This is failure isolation.
- **Fail fast:** an open breaker answers instantly instead of making users wait for a timeout.
- **Timeouts come first.** Without them a hanging service ties up gateway resources; the circuit breaker needs timeouts to detect failures.
- **Fallback is a forward**, so it passes through the gateway filters again. That is why `/fallback/` had to be made public in the JWT filter.
- **One breaker per service**, so a failure in ML does not open the breaker for orders.
- **Connection refused fails immediately**, so the first call with a service down usually returns `503` right away; the breaker opens after enough failures.
- **Status code choice:** `503 Service Unavailable` tells clients the problem is temporary and on the server side.

### Limitations
- `/fallback/x` can also be called directly by a client. It only returns a harmless message, so it is acceptable here.
- Retries are not configured. Retrying is only safe for idempotent calls (GET), never blindly for POST.
- Breaker thresholds here are for demonstration; prod values would use larger windows.

### Interview points
- "I used Resilience4j circuit breakers per route, with timeouts and a fallback endpoint returning a structured 503."
- "The three states are closed, open and half-open; half-open probes the service before resuming full traffic."
- "Timeouts, circuit breakers and fallbacks together prevent cascading failures."
- "Breakers are per service so failures stay isolated."

==========================

## 9. Phase 7A: React Frontend Setup, CORS, Login ✅

**Goal:** a React app that talks only to the gateway (`http://localhost:8080`), with register, login and a protected route.

### Setup
```bash
cd frontend
npm create vite@latest . -- --template react
npm install
npm install tailwindcss @tailwindcss/vite react-router-dom
```
- `vite.config.js`: plugins `react()` and `tailwindcss()`, port 5173
- `src/index.css`: single line `@import "tailwindcss";`
- `frontend/.env`: `VITE_API_URL=http://localhost:8080` (only `VITE_` variables are exposed; never put secrets here)

### Files
| File | Role |
|---|---|
| `src/api.js` | One helper for all backend calls: adds the Bearer token, handles `401` (clears token, redirects to login), `429`, and network errors |
| `src/pages/Login.jsx` | Login and register form (toggle), stores the token, redirects |
| `src/App.jsx` | Routes and `ProtectedRoute` (no token means redirect to `/login`) |
| `src/main.jsx` | Wraps the app in `BrowserRouter` |

### CORS at the gateway
The browser treats `localhost:5173` and `localhost:8080` as different origins, so it sends a preflight `OPTIONS` request and blocks the call unless the response has `Access-Control-Allow-Origin`.

Fix: `config/CorsConfig.java` with a `CorsWebFilter` bean at `HIGHEST_PRECEDENCE`.
- Answers preflight before the rate limiter and JWT filter see it
- Adds CORS headers to `401` and `429` responses too, so React can read the messages
- Allowed origin comes from `CORS_ORIGIN` (default `http://localhost:5173`)
- Rate limit raised to 100 per minute for dev

### Key learnings
- **CORS is enforced by the browser**, not the server; curl and Insomnia never hit it.
- **Gateway is the right place for CORS** because it is the single entry point.
- **Preflight requests carry no token**, so CORS must run before the JWT filter.
- **Token in `localStorage`** is simple for learning; production apps often prefer httpOnly cookies because localStorage is readable by any script on the page (XSS risk).
- **The circuit breaker fallback hides the real error.** Check the service's own terminal when you see a `503` fallback.
- **Each service has its own venv.** Verify with `where python` before starting.

### Interview points
- "CORS is handled once at the gateway with a reactive CorsWebFilter, ahead of auth and rate limiting."
- "The frontend knows one base URL from an environment variable, and one API helper centralizes auth headers and error handling."


====================


## 10. Phase 7B: Orders and Predict Pages ✅

**Goal:** protected pages for orders CRUD and sentiment prediction, all through the gateway.

### Files
| File | Role |
|---|---|
| `components/Navbar.jsx` | Links to Orders and Predict, plus logout |
| `pages/Orders.jsx` | Add, list, edit, delete orders (React state, controlled form) |
| `pages/Predict.jsx` | Sends text to `/api/predict`, shows green POSITIVE or red NEGATIVE with confidence |
| `App.jsx` | `ProtectedLayout` checks the token and renders the navbar with `<Outlet />` |

### Key learnings
- **One `api()` helper** attaches the token and handles `401`/`429`/network errors, so pages stay small.
- **The frontend never sends a user id.** The gateway derives it from the token, so a second user sees only their own orders.
- **Circuit breaker shows up in the UI:** with the ML service stopped, the page shows "ml-service is temporarily unavailable" and the rest of the app keeps working.
- **Layout route pattern:** one `ProtectedLayout` guards all private pages instead of repeating the check.

### Interview points
- "Auth state lives in one place (the API helper and a protected layout), and ownership is enforced server-side, not in the UI."

### Issues
| Issue | Fix |
|---|---|
| `can't open file '...ml-service\manage.py'` | `manage.py` exists only in `user-service`; start ML with `uvicorn main:app --port 8003` |
| `ModuleNotFoundError: rest_framework`, traceback shows another service's venv | Wrong venv active; `deactivate`, activate the right one, check with `where python` |

=====================

## 11. Phase 8A: Dockerize the Backend ✅

**Goal:** run MySQL and all four backend services with one command (`docker compose up --build`), with only the gateway reachable from outside.

### How it works
```
Your machine ──8080──► api-gateway ──► user-service, order-service, ml-service ──► mysql
                      (all other containers are private)
```
Compose puts all containers on a private network. Inside it, services find each other by **service name** (`http://user-service:8001`). Only `api-gateway` has a `ports:` entry, so only it is reachable from the host. This closes the Phase 4 security gap: nobody can call a service directly with a fake `X-User-Id`.

### Changes to existing services
| Service | Change | Why |
|---|---|---|
| user-service | `ALLOWED_HOSTS` read from env | Gateway calls Django with host `user-service`, which Django must allow |
| order-service | `application.yml` uses `${DB_URL}`, `${DB_USER}`, `${DB_PASSWORD}`, `${DDL_AUTO}` with local defaults | Same code runs locally and in Docker |
| api-gateway | No change | URLs, `JWT_SECRET` and `CORS_ORIGIN` already came from env variables |

### Files added
| File | Purpose |
|---|---|
| `*/Dockerfile` (4) | Build one image per service |
| `*/.dockerignore` (4) | Keep `venv`, `target`, `.env`, `model.pkl` out of images |
| `user-service/requirements.txt`, `ml-service/requirements.txt` | Hand-written, unpinned, so they work with Python 3.12 in Docker |
| `docker/mysql/init.sql` | Creates `users_db` and `orders_db` and grants access on first start |
| `.env` / `.env.example` (root) | Compose variables: DB credentials, `JWT_SECRET`, Django secret |
| `docker-compose.yml` | Defines mysql, user-service, order-service, ml-service, api-gateway |

### Dockerfile notes
- **Java services:** two-stage build. Stage 1 (Maven image) compiles; stage 2 (JRE image) ships only the jar, so the final image is small.
- **ML service:** runs `python train.py` during the build, so `model.pkl` always exists.
- **User service:** runs `migrate` then starts `gunicorn` (a production server, instead of `runserver`).
- Copy `pom.xml` / `requirements.txt` first, then the source, so Docker caches the dependency layer and rebuilds are fast.

### Compose notes
- **`depends_on` with `condition: service_healthy`** waits for MySQL's healthcheck, not just container start.
- **`init.sql` runs only once**, when the MySQL volume is first created.
- **Named volume `mysql_data`** keeps data across `docker compose down`; `down -v` deletes it.
- The Docker database is separate from your local MySQL, so users must be registered again.

### Commands
```bash
docker compose up --build            # build and start everything
docker compose ps                    # what is running
docker compose logs -f api-gateway   # follow one service's log
docker compose stop ml-service       # simulate a failure
docker compose down                  # stop (data kept)
docker compose down -v               # stop and delete the DB volume
```

### Tests
| Test | Expected |
|---|---|
| Register, add order, predict via `localhost:5173` | Works |
| `curl localhost:8001`, `8002`, `8003` | Connection refused |
| `docker compose stop ml-service`, then Predict | Clean `503` |
| `docker compose start ml-service`, wait about 10 s | Predict works again |
| `docker compose down`, then `up` | Data still present |

### Key learnings
- **Private network = real security.** Gateway-only exposure is what makes trusted headers safe.
- **`localhost` inside a container means the container itself.** Use service names (`mysql`, `user-service`) instead.
- **Same image, different config.** Only environment variables change between dev and prod.
- **Never bake secrets into images.** They come from `.env` / environment at runtime.
- **Don't use `pip freeze` across Python versions** (your 3.14 vs Docker's 3.12); keep requirements simple.

### Interview points
- "I containerized each service with multi-stage builds and orchestrated them with Docker Compose; only the gateway publishes a port."
- "Services discover each other by DNS name on the Compose network, and configuration is injected through environment variables."
- "Healthchecks and `depends_on: service_healthy` avoid startup race conditions with the database."


=================

## 12. Phase 8B: Frontend Container and Dev/Prod Profiles ✅

**Goal:** serve React from a container and make dev and prod configuration explicit, so one command starts the whole system in either mode.

### How it works
```
Browser ──► frontend (nginx, static files) ──calls──► api-gateway :8080 ──► private services ──► mysql
```
In production there is no Vite dev server. We **build** static files and serve them with nginx. Configuration is chosen at start time by passing an env file.

### Frontend container
| File | Purpose |
|---|---|
| `frontend/Dockerfile` | Stage 1 (Node): `npm ci` and `npm run build`. Stage 2 (nginx): serves `dist/` |
| `frontend/nginx.conf` | `try_files $uri /index.html` so React Router paths like `/orders` survive a refresh |
| `frontend/.dockerignore` | Keeps `node_modules`, `dist`, `.env` out of the image |

`VITE_API_URL` is passed as a **build argument**, because Vite bakes it into the JavaScript at build time. Changing the API URL means rebuilding the image.

### Dev vs prod profiles

| Setting | Dev (`.env.dev`) | Prod (`.env.prod`) |
|---|---|---|
| Secrets and passwords | Simple, local only | Strong, random, never committed |
| `JWT_EXPIRY_MINUTES` | 60 | 15 |
| `DEBUG` (Django) | True | False |
| `DDL_AUTO` (Hibernate) | update | validate |
| `RATE_LIMIT` per minute | 100 | 60 |
| `CORS_ORIGIN` | `http://localhost:3000` | `https://your-domain.com` |
| `API_URL` | `http://localhost:8080` | `https://api.your-domain.com` |
| `FRONTEND_PORT` | 3000 | 80 |

Only `.env.example` and `.env.prod.example` are committed. `.gitignore` has `.env.*` with exceptions for the two example files.

### Gateway change
```yaml
ratelimit:
  max-requests: ${RATE_LIMIT:100}
  window-seconds: 60
```

### Commands
```bash
# Dev
docker compose --env-file .env.dev up --build        # open http://localhost:3000

# Prod-style rehearsal
cp .env.prod.example .env.prod                        # edit the CHANGE_ME values
docker compose --env-file .env.prod up --build
```

### Tests
| Test | Expected |
|---|---|
| Dev: register, add order, predict at `localhost:3000` | Works |
| Refresh on `/orders` | Page loads (nginx fallback) |
| Network tab | Calls go to `localhost:8080` only |
| `curl localhost:8001`, `8002`, `8003` | Refused |
| Prod: token lifetime and rate limit | 15 minutes, 60 per minute |
| Prod: Django bad request | No debug page |
| `docker compose down`, then `up` | Data persists |

### Key learnings
- **Same code, different config.** This is the dev, UAT and prod idea from Phase 1, now implemented.
- **Frontend config is public.** Anything in `VITE_*` is visible to every user; never put secrets there.
- **Build-time vs run-time config.** Backend services read env variables at start; the frontend reads them at build.
- **`DDL_AUTO=validate` needs existing tables.** Real projects use migrations (Flyway or Liquibase). For this demo, do the first prod start with `update`.
- **Prod hardening ideas:** HTTPS (TLS termination at a reverse proxy), secrets manager instead of env files, Redis-backed rate limiting, image version tags.
- **`CORS_ORIGIN` must match the frontend URL exactly** (scheme, host and port), or the browser blocks calls.

### Interview points
- "Environment-specific values live in env files selected with `--env-file`, so the same images run in every environment."
- "The frontend is a multi-stage build served by nginx with an SPA fallback."
- "Prod uses shorter token lifetimes, `DEBUG` off, schema validation instead of auto-update, and stricter CORS."