# GatewayHub: Notes

## Concepts learned
- **API Gateway:** single entry point; handles routing, auth, rate limiting, logging for backend services.
- **Environments:** Dev (developers), UAT (business/QA sign-off), Prod (real users). Same code, different config.

## Phase 1
- Monorepo with one folder per service.
- Secrets live in `.env` (never committed); `.env.example` is committed.

## Decisions
- Database per service (`users_db`, `orders_db`).
- Only the gateway is exposed publicly.

## Issues faced and fixes
(add here as we go)

============================

