# Changelog

## 0.1.0 (reworked initial release)

- `forger init` and `forger new` with Spring Boot, Next.js, generic Dockerfile detection.
- Caddy hostname-independent localhost configuration (`SITE_ADDRESS=:80`).
- Route-specific, validated prefix stripping: preserve `/api/hello`, expose demo Actuator at `/api/actuator/health`.
- Official MongoDB JavaScript first-run bootstrap for the `app` user.
- MongoDB readiness checks authenticate as the **app user**, rather than using an unauthenticated ping.
- Unit/regression tests and shell/PowerShell end-to-end smoke scripts.
- Compose, docs, CI, release tooling and installable wheel.
