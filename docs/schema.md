# Manifest schema v1

`forger.yaml` is parsed by the Pydantic `Manifest` model in `forger/models.py`. A generated JSON Schema is available in `docs/forger.schema.json`.

- `project.name`: Docker Compose project name.
- `applications.<name>.adapter`: `spring-boot-maven`, `nextjs`, or `generic-docker`.
- `source`: `existing` or `scaffold`.
- `path`: source and Docker build context, relative to manifest.
- `port`: **internal** container port; never host-exposed for application services.
- `dockerfile.strategy`: `preserve`, `generate-if-missing`, `generate`. Existing files are preserved by default.
- `networks`: declared networks that the service joins.
- `requires`: service names (dependency graph).
- `profiles`: list of declared Docker Compose profile names. Unprofiled services start normally.
- `mongodb.mode`: `bundled` or `external`. External mode requires manual application URI configuration.
- `proxy.domain`: null for local HTTP, domain for automated TLS (requires external DNS/ports).
- `proxy.routes`: URL prefix to application service name. `/api` routing retains the original path.
- `networks.<name>.internal`: Docker isolation flag.
- `security`: hardening and secret provider declaration.

The schema validates shape. `forger validate` additionally checks network assignments, names, dependencies, routes and paths; `docker compose config -q` is attempted if Docker exists. These checks do not constitute a security audit.

- `proxy.strip_prefix`: optional mapping from declared route to a path prefix to remove when proxying, e.g. `/api/actuator: /api`. By default paths are preserved. The generated full-stack demo preserves `/api/hello` and strips `/api` for `/api/actuator/health` only.
- Local development `SITE_ADDRESS=:80` listens independently of the HTTP Host header; the Compose host port is bound to `127.0.0.1` by default.
