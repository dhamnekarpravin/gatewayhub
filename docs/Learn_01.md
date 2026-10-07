GatewayHub: Quick Revision Notes (Phases 1 and 2)
1. Core concepts (interview essentials)

API Gateway: a single entry point for all client requests. The client knows only one URL.

Routing, authentication (JWT), rate limiting, logging, CORS, circuit breaker
Backend services stay private; only the gateway is public

Microservices rules used here

One database per service (users_db, orders_db)
Each service is independent: own port, own dependencies
Secrets live in .env, never in Git

===================

Environments

Env	Purpose	Data
Dev	Developers build and test	Fake
UAT	QA and business sign-off	Production-like (masked)
Prod	Real users	Real

====================

3. Phase 1: Setup
Monorepo: api-gateway, user-service, order-service, ml-service, frontend, docs
.gitignore excludes .env, venv, target, node_modules
Commit .env.example, never .env
docs/STATUS.md tracks progress, docs/NOTES.md stores learnings
4. Phase 2: Backend services
Service	Tech	Port	Endpoints	Key point
User	Django + DRF	8001	POST /register, POST /login	Password hashed; login returns JWT
Order	Spring Boot + JPA	8002	POST/GET/PUT/DELETE /orders	DTO + validation; table named orders
ML	FastAPI + scikit-learn	8003	GET /health, POST /predict	Model trained offline, loaded once at startup

======================


5. JWT in one minute
Structure: header.payload.signature
Our payload: sub (user id), username, iat, exp
Signed with HS256 using a shared JWT_SECRET (32+ characters)
Signed, not encrypted: anyone can read the payload, so never put passwords in it
Django issues the token; the gateway will verify it (Phase 4)

===============

6. Status codes to remember
Code	Meaning	Seen in
200	OK	GET, login
201	Created	register, create order
204	Deleted, no body	delete order
400	Validation error	Spring
401	Wrong or missing credentials	login
404	Route or resource not found	Spring package issue
415	Wrong content type	Body not JSON
422	Validation error	FastAPI
429	Too many requests	rate limiting (Phase 5)
503	Service unavailable	ML model not loaded

===================

7. Framework comparison (interview favourite)
	Django + DRF	Spring Boot	FastAPI
Language	Python	Java	Python
Validation	Serializers	@Valid + DTO	Pydantic
DB layer	Django ORM	Spring Data JPA	None here
Validation error	400	400	422

===================

9. Project talking points (interview)
"I built a microservices project with a Spring Cloud Gateway in front of Django, Spring Boot and FastAPI services."
"Each service owns its database, and secrets come from environment config."
"Auth is stateless: the user service issues a JWT, and the gateway verifies it once for all routes."
"I used DTOs and validation, kept routes prefix-free so the gateway can strip /api/..., and tested with Insomnia."
"I separated ML training from serving, loading the model once at startup."

===============

