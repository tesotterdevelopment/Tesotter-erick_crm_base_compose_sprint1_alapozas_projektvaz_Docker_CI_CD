<div align="center">

<br />

# ⚒️ ForgeR

### Forge your stack. Ship with confidence.

**A modular Docker Compose scaffolding CLI for Tesotter Mini CRM**

<p>
  <a href="#-quick-start"><img src="https://img.shields.io/badge/GET_STARTED-Quick_Start-7658F5?style=for-the-badge" alt="Quick start" /></a>
  <a href="#-testing"><img src="https://img.shields.io/badge/TESTING-Windows_%26_Ubuntu-2176AE?style=for-the-badge" alt="Testing" /></a>
  <a href="#-build--release"><img src="https://img.shields.io/badge/RELEASE-v0.1.0-19A974?style=for-the-badge" alt="Version 0.1.0" /></a>
</p>

<p>
  <img src="https://img.shields.io/badge/Python-3.11%2B-3776AB?logo=python&logoColor=white" alt="Python 3.11+" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white" alt="Docker Compose" />
  <img src="https://img.shields.io/badge/Spring_Boot-Java_21-6DB33F?logo=springboot&logoColor=white" alt="Spring Boot Java 21" />
  <img src="https://img.shields.io/badge/Next.js-Frontend-000000?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white" alt="MongoDB 7" />
  <img src="https://img.shields.io/badge/Caddy-2-1F88C0?logo=caddy&logoColor=white" alt="Caddy 2" />
</p>

**One CLI · One Compose stack · A reproducible development environment**

<sub>Developer preview · v0.1.0 · Tesotter Developer Tooling</sub>

<br /><br />

</div>

---

## ✦ Overview

ForgeR generates and manages the local infrastructure for **Tesotter Mini CRM**. Scaffold a new project or configure a supported existing monorepo, then build and start the application stack using Docker Compose.

| Layer | Technology | Responsibility |
| :-- | :-- | :-- |
| 🌐 **Web** | Next.js | Frontend UI |
| ☕ **API** | Spring Boot / Java 21 | Backend services |
| 🍃 **Database** | MongoDB 7 | Application data |
| 🔀 **Gateway** | Caddy 2 | Reverse proxy & local routing |
| 🐳 **Runtime** | Docker Compose | Container orchestration |

<details>
<summary><b>✨ What's included</b></summary>

- New-project scaffolding and discovery of supported existing applications
- Framework-specific, multi-stage Dockerfiles and Compose configuration
- Local `.env` generation with MongoDB application credentials
- MongoDB bootstrap for a fresh database volume
- Local HTTP routing for both `localhost` and `127.0.0.1`
- CLI validation, container healthchecks and cross-platform smoke tests

</details>

## ⚡ Quick start

**Prerequisites:** Python 3.11+, Docker Engine + Compose plugin (or Docker Desktop).

Install from the extracted ForgeR source directory:

```bash
python -m pip install -e '.[dev]'
forger --help
forger version
```

**Create a new demo**

```bash
forger new tesotter-demo --yes
cd tesotter-demo
forger validate
docker compose up -d --build
```

**Use an existing Tesotter repository**

```bash
cd path/to/tesotter-mini-crm
forger init
forger inspect --graph
forger generate --dry-run
forger generate
forger validate
docker compose up -d --build
```

> [!NOTE]
> The `/api/hello` endpoint is generated for the demo scaffold, not guaranteed to exist in an imported application. Review generated infrastructure before deployment.

## 🌍 Local endpoints

| Service | URL | Expected result |
| :-- | :-- | :-- |
| 🌐 Frontend | <http://localhost/> | HTML · `200 OK` |
| 🌐 Loopback frontend | <http://127.0.0.1/> | HTML · `200 OK` |
| ⚡ Demo backend | <http://localhost/api/hello> | `Hello from forger` |
| 🩺 Health | <http://localhost/api/actuator/health> | JSON · `"status":"UP"` |

## 🧪 Testing

<details open>
<summary><b>🪟 Windows · PowerShell + Docker Desktop</b></summary>

Run unit tests from the **ForgeR source directory**:

```powershell
python -m pip install -e ".[dev]"
python -m pytest -q
```

Create and launch the sample stack:

```powershell
forger new tesotter-demo --yes
cd tesotter-demo
forger validate
docker compose up -d --build
```

Run the smoke script from the **generated demo directory**:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "..\scripts\smoke.ps1"
```

`-ExecutionPolicy Bypass` applies to the newly launched PowerShell process; it does not change the machine-wide execution policy. Organizational policies may still override it.

</details>

<details>
<summary><b>🐧 Ubuntu · Bash + Docker Compose plugin</b></summary>

From the **ForgeR source directory**:

```bash
python3 -m pip install -e '.[dev]'
python3 -m pytest -q
forger new tesotter-demo --yes
cd tesotter-demo
forger validate
docker compose up -d --build
bash ../scripts/smoke.sh
```

Your Docker installation must be running and accessible to your user.

</details>

<details>
<summary><b>🔎 Manual HTTP checks · both platforms</b></summary>

**Windows**

```powershell
curl.exe -i http://localhost/
curl.exe -i http://127.0.0.1/
curl.exe -i http://localhost/api/hello
curl.exe -i http://localhost/api/actuator/health
```

**Ubuntu**

```bash
curl -i http://localhost/
curl -i http://127.0.0.1/
curl -i http://localhost/api/hello
curl -i http://localhost/api/actuator/health
```

The smoke scripts do not delete existing MongoDB volumes.

</details>

| Verification | Success criterion |
| :-- | :-- |
| ✅ Frontend | `200 OK` on both loopback hostnames |
| ✅ API | `200 OK` on `/api/hello` |
| ✅ Readiness | `200 OK` and `UP` on health endpoint |
| ✅ MongoDB | App credentials accepted and healthcheck healthy |
| ✅ Containers | `docker compose ps` reports running services |

## 🔧 CLI reference

| Command | Purpose |
| :-- | :-- |
| `forger new <name> --yes` | Scaffold a new project |
| `forger init` | Initialize the current repository |
| `forger inspect --graph` | Visualize discovered components |
| `forger configure` | Modify project configuration |
| `forger generate --dry-run` | Preview file generation |
| `forger generate` | Generate infrastructure |
| `forger validate` | Validate configuration |
| `forger up` / `forger down` | Manage stack lifecycle |
| `forger version` | Show version |

## 📦 Build & release

<div align="center">

**Current package: `tesotter-forger` · `v0.1.0` · Developer preview**

<!-- Replace OWNER and REPO with the actual GitHub owner/repository names after publishing. -->

[![CI](https://github.com/OWNER/REPO/actions/workflows/ci.yml/badge.svg?branch=tool%2Fforger)](https://github.com/OWNER/REPO/actions/workflows/ci.yml)
[![Commitlint](https://github.com/OWNER/REPO/actions/workflows/commitlint.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/commitlint.yml)
[![Build artifacts](https://github.com/OWNER/REPO/actions/workflows/artifacts.yml/badge.svg)](https://github.com/OWNER/REPO/actions/workflows/artifacts.yml)
[![Release Please](https://github.com/OWNER/REPO/actions/workflows/release.yml/badge.svg?branch=tool%2Fforger)](https://github.com/OWNER/REPO/actions/workflows/release.yml)

[![Latest release](https://img.shields.io/github/v/release/OWNER/REPO?style=flat-square&label=latest%20release&display_name=tag)](https://github.com/OWNER/REPO/releases)
[![Release date](https://img.shields.io/github/release-date/OWNER/REPO?style=flat-square)](https://github.com/OWNER/REPO/releases)

<sub>Workflow and release badges activate once the repository is published, the paths are updated, and workflows run. Badges do not assert a successful build before that.</sub>

</div>

| Pipeline | Trigger | Responsibility |
| :-- | :-- | :-- |
| 🧪 **CI** | Push / PR to `tool/forger` | Pytest, Python build, schema check |
| 📝 **Commitlint** | PR to `tool/forger` | Conventional Commit validation |
| 🚀 **Release Please** | Push / manual dispatch | Prepare version + changelog releases |
| 📦 **Artifacts** | Tag `forger-v*` | Python packages + OS-specific binaries |

**Build locally**

```bash
python -m pip install -e '.[dev]'
python -m pytest -q
python -m build
```

Output is placed in `dist/` (wheel and source distribution). The repository includes GitHub Actions workflows for release binaries on Linux, Windows, and macOS; **availability must be verified after their first successful tagged run**.

**Release convention:** `forger-v0.1.0`, `forger-v0.1.1`, … using Conventional Commits and Release Please. See [`CHANGELOG.md`](CHANGELOG.md) and [`docs/releasing.md`](docs/releasing.md).

> [!IMPORTANT]
> Publish ForgeR from its dedicated `tool/forger` branch. Do not merge the tool's orphan branch into the Mini CRM application's `main` branch.

## 🛡️ Development & security notes

<details>
<summary><b>🔐 MongoDB initialization, resets and production restrictions</b></summary>

The official MongoDB container executes `infra/mongo/init-app.js` **only for a fresh data volume**. ForgeR does not migrate existing database data or automatically rotate an existing user's password when `.env` changes.

Reset **only an expendable demo**:

```bash
docker compose down -v
docker compose up -d --build
```

> [!CAUTION]
> `docker compose down -v` permanently removes Compose-managed volumes, including MongoDB data. Do not run this against an environment containing data you need to keep.

Development Actuator health is accessible through the proxy. Restrict or remove public access before deployment. ForgeR does not install Docker, provision servers, set up DNS, or guarantee that imported Dockerfiles are secure.

</details>

---

<div align="center">

### ⚒️ ForgeR

**From repository to running stack.**

<sub>Built for Tesotter Mini CRM · v0.1.0</sub>

</div>
