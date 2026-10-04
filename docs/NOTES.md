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

