# Build and release

Conventional Commits: `feat:`, `fix:`, `feat!:` / `BREAKING CHANGE:`. Commitlint checks PR messages; release-please prepares a version/changelog PR based on commit history, which triggers a tag/release after merge.

The intended protected branch is `tool/forger` (or set it to `tool/stack-builder` if retaining the earlier name). Never merge the orphan branch into the CRM main branch. Create a GitHub branch ruleset with PR + required checks.

`python -m pip install -e '.[dev]'`; `pytest`; `python -m build`. Release binaries via PyInstaller on dedicated OS runners after smoke tests. Tag convention: `forger-vX.Y.Z`.

Release artifacts must not claim a deployment validation that CI has not performed. GitHub Releases and compiled cross-platform binaries require GitHub Actions in a repository; the ZIP only includes workflows.

`artifacts.yml` builds wheels, sdist and platform-native PyInstaller binaries when a `forger-v*` tag is pushed; this needs to be exercised on GitHub after publishing. Make sure GitHub Actions has permissions for creating pull requests and uploading releases.
