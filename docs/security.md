# Security model and current limitations

- Default bind address is `127.0.0.1`; do not bind to `0.0.0.0` without valid domain, TLS and host-level firewall.
- Caddy manages certificates automatically for eligible domains; persistent Caddy volumes store certificate material.
- Application and database networks are separate. MongoDB has no published host ports.
- MongoDB uses root and app user credentials passed through local `.env` substitution. **v0.1 does not yet implement real Docker secrets; despite the manifest declaration, environment-based secrets remain visible to Docker administrators and process inspection.** This must be addressed before production use.
- MongoDB init scripts run only on first initialization of an empty database volume. Password rotation is a separate operational procedure.
- `no-new-privileges`, `cap_drop` and bounded logging apply to application containers. These settings do not turn arbitrary imported Dockerfiles into safe artifacts.
- The current API healthcheck checks that Java starts, not the HTTP endpoint or DB readiness. Add application-specific health probes before production.
- Existing Next.js projects should configure `output: 'standalone'` for the provided Dockerfile. A lockfile and public directory are needed.
- No automated backup/restore, monitoring, full edge rate limiting, host hardening or ACME live test is shipped.
- Do not treat this prototype as a production security certification.
