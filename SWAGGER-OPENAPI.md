# CRM API documentation (Swagger / OpenAPI)

## Scope

This change adds discoverable OpenAPI 3 documentation for the **existing** Contact, Authentication and Admin User endpoints. No Deal/Task controller, refresh-token endpoint, or new business behavior is added.

## Enable (local Docker Compose)

In your local `.env` file set:

```dotenv
CRM_OPENAPI_ENABLED=true
```

Then rebuild / restart the backend:

```powershell
docker compose up -d --build tesotter_crm_erick caddy
```

URLs through ForgeR/Caddy:

- Swagger entry point: **http://localhost/api/swagger-ui.html** (redirects to static Swagger UI assets under `/swagger-ui/`).
- OpenAPI JSON: **http://localhost/api/v3/api-docs**
- OpenAPI YAML: **http://localhost/api/v3/api-docs.yaml** (if served by springdoc).

The Caddyfile explicitly proxies `/swagger-ui/*` to Spring Boot because Springdoc uses that path for static Swagger UI assets. `/api/*` routing remains unchanged.

## JWT in Swagger

1. Log in via `POST /api/v1/auth/login`, using an existing test account.
2. Copy `accessToken` from the response.
3. Click **Authorize** in Swagger and paste the token (without `Bearer ` prefix).
4. Try secured endpoints; API rules remain enforced by Spring Security.

The Swagger definition marks the Contact and Admin User endpoints, plus `GET /auth/me`, as Bearer protected. `POST /auth/login` is public.

## Security / deployment

OpenAPI documentation is **disabled by default** (`CRM_OPENAPI_ENABLED=false`). Enable only in a trusted development environment. `permitAll()` of Swagger paths does not enable disabled pages, but allows access to the documentation when explicitly enabled. Before deployment, consider network/access restrictions for developer documentation. Swagger UI is not a substitute for tests.

## Check

```powershell
curl.exe -i http://localhost/api/v3/api-docs
curl.exe -I http://localhost/api/swagger-ui.html
```

An enabled OpenAPI endpoint should return a JSON document containing `openapi`, `paths` and `components.securitySchemes.bearerAuth`. The Swagger URL may redirect to `/swagger-ui/index.html`.

## Build

```powershell
cd tesotter_crm_erick
.\mvnw.cmd clean verify
```

This archive has not been validated by a running Maven build; execute these checks before committing.
