# Component relationships

| Component | Networks | Incoming | Outgoing | Profile |
|---|---|---|---|---|
| Caddy | app | localhost/domain:80,443 | web and API | always |
| Next.js web | app | Caddy | API (when app calls it) | always |
| Spring Boot API | app, database | Caddy / web | MongoDB | always |
| MongoDB | database (`internal: true`) | API | none | always when bundled |
| Generic Dockerfile | configured networks | configured routing | configured dependencies | configurable |

Only the proxy publishes host ports. Port 8080/3000/27017 are internal. For the default CRM the `database` network is internal; Mongo must authenticate and have persistent storage.

`profiles` are native Compose profiles. A profiled service is omitted by default; enable with `docker compose --profile dev up -d`. Declared profile names are validated, as are basic dependency conflicts.

Two types of relationship: `networks` (connectivity), `requires` (startup dependencies). Do not infer `depends_on` merely from sharing a network.
