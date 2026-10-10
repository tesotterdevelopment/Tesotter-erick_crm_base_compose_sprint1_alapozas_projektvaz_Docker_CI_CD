# Backend foundation patch (Sprint 1 / 2)

Includes initial Mongo document models (`Contact`, `Deal`, `CrmTask`, `CrmUser`), Mongo repositories, JWT access token authentication and role-based route authorization. Existing contact API preserved.

## Required configuration

- Supply a random `CRM_JWT_SECRET` of at least 32 UTF-8 bytes in `.env` before Compose startup. Never commit real secrets.
- For initial admin, set `CRM_BOOTSTRAP_EMAIL` and `CRM_BOOTSTRAP_PASSWORD` (12+ chars), start the backend once and then remove these variables. Provisioning skips existing users.
- Login: `POST /api/v1/auth/login` with `{ "email": "...", "password": "..." }` returns access token. Send `Authorization: Bearer <token>` with subsequent API requests.
- Admin creates users at `POST /api/v1/admin/users`.
- Read Contacts: USER/MANAGER/ADMIN. Change Contacts: MANAGER/ADMIN.

## Tests

`mvn clean verify` executes unit and Spring-backed tests. CI uses a MongoDB 7 service on localhost. If testing locally, start MongoDB 7 or use the CI compose service, and use `SPRING_PROFILES_ACTIVE=ci`.

## Before production

This is a foundation, not a complete security product: add token refresh/revocation, account lockouts/rate limiting, resource ownership checks, method-level policies, key rotation, account lifecycle and end-to-end tests before production. `Deal` and `CrmTask` currently have persistence models only, not business services or controllers. Caddy must terminate TLS on public deployments.

Spring Data REST is intentionally disabled to prevent automatic exposure of repositories outside the audited controller access rules.
