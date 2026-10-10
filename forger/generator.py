import secrets
from importlib.resources import files
from pathlib import Path
from jinja2 import Template
import yaml
from .models import Manifest
from .adapters import REGISTRY
from .scaffold import scaffold

class GenerationError(ValueError): pass

def verify(manifest: Manifest, root: Path, files_required: bool=True) -> list[str]:
    errors=[]
    names=set(manifest.applications)|({"mongo"} if manifest.mongodb.enabled and manifest.mongodb.mode=="bundled" else set())
    for name,app in manifest.applications.items():
        path=(root/app.path).resolve()
        if not path.is_relative_to(root.resolve()): errors.append(f"{name}: path escapes project root")
        elif files_required and app.source=="existing" and not path.is_dir(): errors.append(f"{name}: missing directory {app.path}")
        for network in app.networks:
            if network not in manifest.networks: errors.append(f"{name}: unknown network {network}")
        for dep in app.requires:
            if dep not in names: errors.append(f"{name}: unknown dependency {dep}")
            elif dep in manifest.applications and set(app.profiles).isdisjoint(manifest.applications[dep].profiles) and manifest.applications[dep].profiles:
                errors.append(f"{name}: dependency {dep} has an incompatible profile")
        if len(app.profiles)!=len(set(app.profiles)):errors.append(f"{name}: duplicate profiles")
        for profile in app.profiles:
            if profile not in manifest.profiles: errors.append(f"{name}: undeclared profile {profile}")
    if manifest.mongodb.enabled and manifest.mongodb.mode=="bundled" and "database" not in manifest.networks:
        errors.append("bundled MongoDB needs database network")
    if manifest.proxy.enabled:
        for route,prefix in manifest.proxy.strip_prefix.items():
            if route not in manifest.proxy.routes: errors.append(f"strip_prefix: unknown route {route}")
            if route == "/" or not prefix.startswith("/") or not (route == prefix or route.startswith(prefix + "/")):
                errors.append(f"strip_prefix: invalid prefix {prefix} for {route}")
        for route,target in manifest.proxy.routes.items():
            if target not in manifest.applications: errors.append(f"proxy route {route}: unknown target {target}")
            elif "app" not in manifest.applications[target].networks: errors.append(f"proxy route {route}: target lacks app network")
        if manifest.proxy.domain and manifest.proxy.tls=="off": errors.append("public domain requires TLS")
    if manifest.security.hardened_containers is False: errors.append("container hardening cannot be disabled in v0.1")
    return errors

def compose_data(m: Manifest):
    services={}
    for name,app in m.applications.items():
        spec={"build":{"context":app.path,"dockerfile":app.dockerfile.file},"restart":"unless-stopped","expose":[str(app.port)],"networks":app.networks,"security_opt":["no-new-privileges:true"],"cap_drop":["ALL"],"pids_limit":256,"logging":{"driver":"json-file","options":{"max-size":"10m","max-file":"3"}}}
        if app.profiles: spec["profiles"]=app.profiles
        if app.requires:spec["depends_on"]={x:{"condition":"service_started"} for x in app.requires}
        if app.adapter=="spring-boot-maven":
            spec["environment"]={"SPRING_DATA_MONGODB_URI":"${MONGO_URI:-mongodb://localhost:27017/app}"}
            if m.mongodb.enabled and m.mongodb.mode=="bundled":
                spec["environment"]["SPRING_DATA_MONGODB_URI"]="mongodb://app:${MONGO_APP_PASSWORD}@mongo:27017/app?authSource=app"
                spec["depends_on"]={**spec.get("depends_on",{}),"mongo":{"condition":"service_healthy"}}
            spec["healthcheck"]={"test":["CMD-SHELL","bash -c 'echo > /dev/tcp/127.0.0.1/8080'"],"interval":"30s","timeout":"5s","retries":3}
        services[name]=spec
    if m.mongodb.enabled and m.mongodb.mode=="bundled":
        services["mongo"]={"image":f"mongo:{m.mongodb.version}","restart":"unless-stopped","networks":["database"],"volumes":["mongo_data:/data/db","./infra/mongo/init-app.js:/docker-entrypoint-initdb.d/init-app.js:ro"],"environment":{"MONGO_INITDB_ROOT_USERNAME":"root","MONGO_INITDB_ROOT_PASSWORD":"${MONGO_ROOT_PASSWORD:?Set MONGO_ROOT_PASSWORD in .env}","MONGO_APP_PASSWORD":"${MONGO_APP_PASSWORD:?Set MONGO_APP_PASSWORD in .env}"},"healthcheck":{"test":["CMD-SHELL","mongosh --quiet --username app --password \"$$MONGO_APP_PASSWORD\" --authenticationDatabase app app --eval 'db.runCommand({ping:1}).ok' >/dev/null"],"interval":"15s","timeout":"5s","retries":5},"security_opt":["no-new-privileges:true"],"logging":{"driver":"json-file","options":{"max-size":"10m","max-file":"3"}}}
    if m.proxy.enabled:
        services["caddy"]={"image":"caddy:2","restart":"unless-stopped","ports":["${PUBLIC_BIND_IP:-127.0.0.1}:80:80","${PUBLIC_BIND_IP:-127.0.0.1}:443:443"],"environment":{"SITE_ADDRESS":"${SITE_ADDRESS:-:80}"},"networks":["app"],"volumes":["./infra/caddy/Caddyfile:/etc/caddy/Caddyfile:ro","caddy_data:/data","caddy_config:/config"],"security_opt":["no-new-privileges:true"],"logging":{"driver":"json-file","options":{"max-size":"10m","max-file":"3"}}}
    networks={k:{"driver":"bridge",**({"internal":True} if v.internal else {})} for k,v in m.networks.items()}
    volumes={"mongo_data":None} if "mongo" in services else {}
    if m.proxy.enabled: volumes.update(caddy_data=None,caddy_config=None)
    return {"name":m.project.name,"services":services,"networks":networks,"volumes":volumes}

def caddyfile(m: Manifest):
    parts=['{$SITE_ADDRESS::80} {', '    encode zstd gzip']
    for route,target in sorted(m.proxy.routes.items(),key=lambda x:len(x[0]),reverse=True):
        if route=="/": continue
        matcher='route_' + str(len(parts))
        parts += [f'    @{matcher} path {route} {route}/*',f'    handle @{matcher} {{']
        if route in m.proxy.strip_prefix:parts.append(f'        uri strip_prefix {m.proxy.strip_prefix[route]}')
        parts += [f'        reverse_proxy {target}:{m.applications[target].port}','    }']
    target=m.proxy.routes.get("/")
    if target: parts += ["    handle {",f"        reverse_proxy {target}:{m.applications[target].port}","    }"]
    parts += ['    header {','        X-Content-Type-Options "nosniff"','        Referrer-Policy "strict-origin-when-cross-origin"','    }','    log {','        output stdout','        format json','    }','}']
    return '\n'.join(parts)+'\n'

def generate(m:Manifest,root:Path, overwrite:str="skip",dry_run:bool=False):
    root=root.resolve()
    problems=verify(m,root)
    if problems:raise GenerationError("; ".join(problems))
    outputs={}
    def add(path:str, content:str):
        dest=root/path
        if not dest.resolve().is_relative_to(root):raise GenerationError(f"Unsafe output: {path}")
        outputs[dest]=content
    if m.proxy.enabled:add("infra/caddy/Caddyfile",caddyfile(m))
    if m.mongodb.enabled and m.mongodb.mode=="bundled":
        add("infra/mongo/init-app.js",'''// Runs only on first initialization of an empty MongoDB data directory.
// The official mongo entrypoint runs .js scripts via mongosh.
const target = db.getSiblingDB('app');
const password = process.env.MONGO_APP_PASSWORD;
if (!password) throw new Error('Missing MONGO_APP_PASSWORD');
if (!target.getUser('app')) {
  target.createUser({user: 'app', pwd: password, roles: [{role: 'readWrite', db: 'app'}]});
}
''')
    add("compose.yaml",yaml.safe_dump(compose_data(m),sort_keys=False,allow_unicode=True))
    site=m.proxy.domain or ":80"
    bind="0.0.0.0" if m.proxy.domain else "127.0.0.1"
    add(".env.example",f"# Domain mode requires DNS plus ports 80/443.\nSITE_ADDRESS={site}\nPUBLIC_BIND_IP={bind}\nMONGO_URI=\nMONGO_ROOT_PASSWORD=REPLACE_WITH_RANDOM_SECRET\nMONGO_APP_PASSWORD=REPLACE_WITH_RANDOM_SECRET\n")
    # Local private credentials are created once, never overwritten or shown in output.
    env=root/".env"
    if not dry_run and not env.exists():
        env.write_text(f"SITE_ADDRESS={site}\nPUBLIC_BIND_IP={bind}\nMONGO_ROOT_PASSWORD={secrets.token_urlsafe(32)}\nMONGO_APP_PASSWORD={secrets.token_urlsafe(32)}\n",encoding="utf8")
        try:env.chmod(0o600)
        except OSError:pass
    add(".gitignore",".env\n.env.*\n!.env.example\ninfra/secrets/\n.forger/cache/\n")
    for name,app in m.applications.items():
        adapter=REGISTRY[app.adapter]
        path=root/app.path
        if app.source=="scaffold" and not dry_run:
            scaffold(path,app.adapter,name)
        dockerpath=path/app.dockerfile.file
        if adapter.dockerfile_template and (app.dockerfile.strategy=="generate" or (app.dockerfile.strategy=="generate-if-missing" and not dockerpath.exists())):
            rel=dockerpath.relative_to(root).as_posix()
            add(rel,Template(files("forger").joinpath("templates",adapter.dockerfile_template).read_text()).render(port=app.port))
            dockerignore=path/".dockerignore"
            if not dockerignore.exists() and adapter.dockerignore:
                add(dockerignore.relative_to(root).as_posix(),files("forger").joinpath("templates",adapter.dockerignore).read_text())
    decisions=[]
    for dest,content in outputs.items():
        if dest.exists() and dest.read_text(encoding="utf8")==content:
            decisions.append(("unchanged",str(dest.relative_to(root))))
            continue
        if dest.exists() and overwrite=="skip":
            decisions.append(("skipped",str(dest.relative_to(root))))
            continue
        decisions.append(("updated" if dest.exists() else "created",str(dest.relative_to(root))))
        if not dry_run:
            dest.parent.mkdir(parents=True,exist_ok=True)
            dest.write_text(content,encoding="utf8")
    return decisions
