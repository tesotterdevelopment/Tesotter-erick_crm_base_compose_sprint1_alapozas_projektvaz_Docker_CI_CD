# Changelog

## [0.2.0](https://github.com/tesotterdevelopment/Tesotter-erick_crm_base_compose_sprint1_alapozas_projektvaz_Docker_CI_CD/compare/forger-v0.1.0...forger-v0.2.0) (2026-10-10)


### Features

* initial ForgeR v0.1.0 implementation ([63b5eed](https://github.com/tesotterdevelopment/Tesotter-erick_crm_base_compose_sprint1_alapozas_projektvaz_Docker_CI_CD/commit/63b5eed5e4089f36f7ac19873b5b0cc8ba259855))

## 0.1.0 (reworked initial release)

- `forger init` and `forger new` with Spring Boot, Next.js, generic Dockerfile detection.
- Caddy hostname-independent localhost configuration (`SITE_ADDRESS=:80`).
- Route-specific, validated prefix stripping: preserve `/api/hello`, expose demo Actuator at `/api/actuator/health`.
- Official MongoDB JavaScript first-run bootstrap for the `app` user.
- MongoDB readiness checks authenticate as the **app user**, rather than using an unauthenticated ping.
- Unit/regression tests and shell/PowerShell end-to-end smoke scripts.
- Compose, docs, CI, release tooling and installable wheel.
