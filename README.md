# Initial Infrastructure Setup — ForgeR v0.1.0

**Branch:** `TCRM-gergo-sprint1`  
**Related tasks:** TCRM-101, TCRM-102, TCRM-104

## 1. Project Discovery

Used the prebuilt **ForgeR v0.1.0 Windows executable** from the GitHub Release to initialize Docker infrastructure in the existing CRM monorepo.

```powershell
.\forger.exe version
.\forger.exe init
```

**CLI output:**

```text
forger 0.1.0

forger · existing project discovery
  ✓ tesotter_crm_erick: spring-boot-maven
  ✓ web: nextjs

Domain (leave empty for localhost) ():
Created ...\forger.yaml

Next: forger configure; forger generate; forger validate
```

ForgeR detected both existing applications without modifying their application source code.

## 2. Infrastructure Inspection

```powershell
.\forger.exe inspect --graph
```

**Initial output:**

```text
Service              Adapter             Networks        Profiles   Requires
tesotter_crm_erick   spring-boot-maven   app, database   always     -
web                  nextjs              app             always     -

caddy --> tesotter_crm_erick (route /)
```

The automatic route selection initially assigned `/` to the backend instead of the frontend.

Updated `forger.yaml`:

```yaml
proxy:
  enabled: true
  tls: auto
  routes:
    /api: tesotter_crm_erick
    /: web
  strip_prefix: {}
```

The intended routing is:

```text
/          → web:3000
/api/*     → tesotter_crm_erick:8080
```

The `/api` prefix is preserved because the existing Spring Boot controllers use it.

## 3. Infrastructure Generation

Previewed the generated files before writing them:

```powershell
.\forger.exe generate --dry-run
```

**CLI output:**

```text
created  infra\caddy\Caddyfile
created  infra\mongo\init-app.js
created  compose.yaml
created  .env.example
created  .gitignore
created  tesotter_crm_erick\Dockerfile
created  tesotter_crm_erick\.dockerignore
created  web\Dockerfile
created  web\.dockerignore
```

Generated and validated the configuration:

```powershell
.\forger.exe generate
.\forger.exe validate
```

**Generated Caddy routing:**

```caddyfile
{$SITE_ADDRESS::80} {
    encode zstd gzip

    @route_2 path /api /api/*
    handle @route_2 {
        reverse_proxy tesotter_crm_erick:8080
    }

    handle {
        reverse_proxy web:3000
    }

    header {
        X-Content-Type-Options "nosniff"
        Referrer-Policy "strict-origin-when-cross-origin"
    }

    log {
        output stdout
        format json
    }
}
```

## 4. Docker Build and Fix

Started the generated stack:

```powershell
docker compose up -d --build
```

The Spring Boot Maven build completed, and Next.js successfully compiled its application routes. However, the frontend Docker image failed during its final build stage:

```text
COPY --from=build --chown=nextjs:nextjs /app/.next/standalone ./
ERROR: "/app/.next/standalone": not found
```

**Cause:** The existing Next.js project did not enable standalone output, which the ForgeR-generated multi-stage Dockerfile requires.

**Fix — `web/next.config.ts`:**

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

After rebuilding, Docker Compose successfully started the application stack.

## 5. Outcome

The initial infrastructure commit establishes a shared Docker Compose environment consisting of:

| Service | Technology | Purpose |
|---|---|---|
| `web` | Next.js | Frontend |
| `tesotter_crm_erick` | Spring Boot / Java 21 | Backend API |
| `mongo` | MongoDB 7 | Database |
| `caddy` | Caddy 2 | Reverse proxy |

**Result:** Successful application discovery, infrastructure generation, Caddy routing configuration, Docker image builds, and container startup using ForgeR v0.1.0.

**Next step:** Application-level API/database integration verification and GitHub Actions CI (TCRM-105).