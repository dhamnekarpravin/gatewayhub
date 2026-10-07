# GatewayHub

A mini microservices system demonstrating how an API gateway works in a real project.

## Architecture

```
React Frontend (Tailwind CSS)
        │
        ▼
   API Gateway (Spring Cloud Gateway)
        │
        ├──► User Service (Django + DRF) - Register/Login, JWT issuance
        ├──► Order Service (Spring Boot) - Order CRUD
        └──► ML Service (FastAPI) - Sentiment prediction
                  │
               MySQL (users_db, orders_db)
```

## Features

- **Single Entry Point**: Frontend only knows the gateway URL
- **Centralized Auth**: JWT validation at the gateway
- **Rate Limiting**: Configurable request limits per client
- **Circuit Breaker**: Graceful fallback when services are down
- **Request Tracing**: Correlation IDs flowing through all services
- **CORS**: Configured for frontend integration
- **Docker Support**: One-command deployment with Docker Compose
- **Dev/Prod Profiles**: Environment-specific configurations

## Quick Start with Docker

### Prerequisites
- Docker Desktop installed and running
- Git

### Development Mode

```bash
# Clone the repository
git clone <your-repo-url>
cd gatewayhub

# Start all services
docker compose --env-file .env.dev up --build

# Access the application
# Frontend: http://localhost:3000
# API Gateway: http://localhost:8080
```

### Production Mode

```bash
# Copy and edit production environment file
cp .env.prod.example .env.prod
# Edit the CHANGE_ME values with your actual secrets

# Start with production configuration
docker compose --env-file .env.prod up --build
```

### Stop Services

```bash
docker compose down
```

## Local Development (Without Docker)

If you prefer to run services locally:

1. **Start MySQL** (or use Docker for just MySQL)
2. **User Service**:
   ```bash
   cd user-service
   python -m venv venv
   venv\Scripts\activate  # Windows
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py runserver 8001
   ```

3. **Order Service**:
   ```bash
   cd order-service\order-service
   ..\mvnw.cmd spring-boot:run
   ```

4. **ML Service**:
   ```bash
   cd ml-service
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python train.py
   uvicorn main:app --port 8003
   ```

5. **API Gateway**:
   ```bash
   cd api-gateway\api-gateway
   .\mvnw.cmd spring-boot:run
   ```

6. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login and get JWT token

### Orders (Requires JWT)
- `GET /api/orders` - List all orders
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}` - Get specific order
- `PUT /api/orders/{id}` - Update order
- `DELETE /api/orders/{id}` - Delete order

### ML Prediction (Requires JWT)
- `POST /api/predict` - Predict sentiment of text

## Environment Variables

See `.env.dev` for development and `.env.prod.example` for production examples.

Key variables:
- `MYSQL_ROOT_PASSWORD` - MySQL root password
- `DB_USER`, `DB_PASSWORD` - Database credentials
- `JWT_SECRET` - Secret for JWT signing (must be 32+ characters)
- `CORS_ORIGIN` - Frontend URL for CORS
- `RATE_LIMIT` - Max requests per minute

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Tailwind CSS 4, Vite |
| API Gateway | Spring Cloud Gateway, Spring Boot 4.1.1, Java 17 |
| User Service | Django 4.2, Django REST Framework, Python 3.12 |
| Order Service | Spring Boot 4.1.1, Spring Data JPA, Java 17 |
| ML Service | FastAPI, scikit-learn, Python 3.12 |
| Database | MySQL 8.4 |
| Auth | JWT (JSON Web Tokens) |
| Containerization | Docker, Docker Compose |

## Documentation

- `docs/NOTES.md` - Detailed development notes and learnings
- `docs/STATUS.md` - Project status tracking

## License

This project is for educational purposes.

## Contributing

This is a learning project. Feel free to fork and experiment!

