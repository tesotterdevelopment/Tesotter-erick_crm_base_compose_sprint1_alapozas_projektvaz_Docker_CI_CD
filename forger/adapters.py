from dataclasses import dataclass
from pathlib import Path

@dataclass(frozen=True)
class Adapter:
    id: str
    label: str
    markers: tuple[str,...]
    dockerfile_template: str | None
    dockerignore: str | None
    def detect(self, path: Path) -> bool:
        return all((path / marker).exists() for marker in self.markers)

REGISTRY = {
    a.id: a for a in [
        Adapter("spring-boot-maven", "Spring Boot / Maven", ("pom.xml",), "spring.Dockerfile", "spring.dockerignore"),
        Adapter("nextjs", "Next.js", ("package.json", "next.config.js"), "next.Dockerfile", "node.dockerignore"),
        Adapter("generic-docker", "Existing Dockerfile", ("Dockerfile",), None, None),
    ]
}

def detect(path: Path) -> str | None:
    if (path / "pom.xml").exists():
        return "spring-boot-maven"
    if (path / "package.json").exists():
        import json
        try:
            package=json.loads((path / "package.json").read_text(encoding="utf8"))
            deps={**package.get("dependencies",{}),**package.get("devDependencies",{})}
            if "next" in deps: return "nextjs"
        except (ValueError, OSError): pass
    if (path / "Dockerfile").exists(): return "generic-docker"
    return None

def discover(root: Path) -> list[tuple[str,str]]:
    found=[]
    candidates=[root]+[p for p in root.iterdir() if p.is_dir() and not p.name.startswith(".") and p.name not in {"node_modules","target","venv",".venv"}]
    for path in candidates:
        adapter=detect(path)
        if adapter: found.append(("." if path==root else path.name, adapter))
    return found
