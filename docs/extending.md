# Extending forger: add a component

1. Decide whether the component is an **application adapter** or **infrastructure service**. The former is registered in `forger/adapters.py`; current infra MongoDB/Caddy rendering is in `forger/generator.py` and should be extracted into a provider registry for future releases.
2. Implement a unique adapter ID, detector, Dockerfile template, and `.dockerignore`. Detect using project metadata, never destructive modifications.
3. Add the adapter ID to `AppConfig.adapter` in `forger/models.py`, with any validated adapter-specific fields.
4. Add its template under `forger/templates/` and use internal ports, not host-published ports.
5. Define required networks and dependencies; ensure dependency profiles overlap or are unprofiled.
6. Create fixture projects and tests: detection, idempotence, existing Dockerfile preservation, invalid manifest, generated YAML.
7. Regenerate `docs/forger.schema.json` via `python scripts/export_schema.py`, update `docs/components.md`, and record breaking changes as Conventional Commits.

## Adapter contract

`Adapter(id, label, markers, dockerfile_template, dockerignore)`, `detect(path)` and a renderer. For v0.1, adapter behavior is intentionally simple; **third-party runtime plugins are not supported yet**. Future plugin APIs should be versioned and isolated from CLI internals.
