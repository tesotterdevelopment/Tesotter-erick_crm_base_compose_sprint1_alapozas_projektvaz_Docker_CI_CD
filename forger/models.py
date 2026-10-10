from typing import Literal
from pydantic import BaseModel, Field, model_validator

class DockerfileConfig(BaseModel):
    strategy: Literal["generate-if-missing", "preserve", "generate"] = "generate-if-missing"
    file: str = "Dockerfile"

class AppConfig(BaseModel):
    adapter: Literal["spring-boot-maven", "nextjs", "generic-docker"]
    source: Literal["existing", "scaffold"] = "existing"
    path: str
    port: int = Field(gt=0, le=65535)
    dockerfile: DockerfileConfig = Field(default_factory=DockerfileConfig)
    networks: list[str] = Field(default_factory=lambda: ["app"])
    requires: list[str] = Field(default_factory=list)
    profiles: list[str] = Field(default_factory=list)
    health_path: str | None = None

class MongoConfig(BaseModel):
    enabled: bool = True
    mode: Literal["bundled", "external"] = "bundled"
    version: str = "7"

class ProxyConfig(BaseModel):
    enabled: bool = True
    domain: str | None = None
    tls: Literal["auto", "off"] = "auto"
    routes: dict[str,str] = Field(default_factory=lambda: {"/api": "api", "/": "web"})
    strip_prefix: dict[str,str] = Field(default_factory=dict)

class NetworkConfig(BaseModel):
    internal: bool = False

class SecurityConfig(BaseModel):
    hardened_containers: bool = True
    secrets_provider: Literal["files"] = "files"

class GenerationConfig(BaseModel):
    overwrite: Literal["ask", "skip", "replace"] = "ask"

class ProjectConfig(BaseModel):
    name: str = Field(min_length=1, pattern=r"^[a-zA-Z0-9][a-zA-Z0-9_-]*$")

class Manifest(BaseModel):
    schemaVersion: Literal[1] = 1
    project: ProjectConfig
    applications: dict[str, AppConfig] = Field(default_factory=dict)
    mongodb: MongoConfig = Field(default_factory=MongoConfig)
    proxy: ProxyConfig = Field(default_factory=ProxyConfig)
    networks: dict[str, NetworkConfig] = Field(default_factory=lambda: {"app": NetworkConfig(), "database": NetworkConfig(internal=True)})
    profiles: dict[str, str] = Field(default_factory=dict)
    security: SecurityConfig = Field(default_factory=SecurityConfig)
    generation: GenerationConfig = Field(default_factory=GenerationConfig)

    @model_validator(mode="after")
    def ensure_names(self):
        if len(set(self.applications).intersection({"mongo", "caddy"})):
            raise ValueError("Application names mongo and caddy are reserved")
        return self
