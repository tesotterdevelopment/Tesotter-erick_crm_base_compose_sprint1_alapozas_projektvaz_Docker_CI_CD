from pathlib import Path
import subprocess
import sys
import yaml
from typer.testing import CliRunner
from forger.cli import app
from forger.generator import generate, verify, caddyfile, compose_data
from forger.models import Manifest, ProjectConfig, AppConfig

runner = CliRunner()

def create_demo(tmp_path):
    result = runner.invoke(app, ['new','demo','--parent',str(tmp_path),'--yes'])
    assert result.exit_code == 0, result.output
    root = tmp_path / 'demo'
    return root, Manifest.model_validate(yaml.safe_load((root/'forger.yaml').read_text()))

def test_new_stack_provisions_mongo_app_user(tmp_path):
    root, manifest = create_demo(tmp_path)
    init = (root/'infra/mongo/init-app.js').read_text()
    compose = yaml.safe_load((root/'compose.yaml').read_text())
    assert 'createUser' in init
    assert "db.getSiblingDB('app')" in init
    assert 'process.env.MONGO_APP_PASSWORD' in init
    assert './infra/mongo/init-app.js:/docker-entrypoint-initdb.d/init-app.js:ro' in compose['services']['mongo']['volumes']
    assert 'init-app.sh' not in str(compose)
    assert '--username app' in compose['services']['mongo']['healthcheck']['test'][1]
    assert 'service_healthy' == compose['services']['api']['depends_on']['mongo']['condition']
    assert (root/'.env').exists()
    assert 'REPLACE_WITH' not in (root/'.env').read_text()
    assert '.env' in (root/'.gitignore').read_text()

def test_caddy_localhost_and_ip_and_path_behavior(tmp_path):
    root, m = create_demo(tmp_path)
    caddy = (root/'infra/caddy/Caddyfile').read_text()
    assert '{$SITE_ADDRESS::80}' in caddy
    assert 'SITE_ADDRESS=:80' in (root/'.env').read_text()
    assert 'PUBLIC_BIND_IP=127.0.0.1' in (root/'.env').read_text()
    assert '@route_' in caddy
    assert 'uri strip_prefix /api' in caddy
    assert '/api/actuator' in caddy
    assert 'reverse_proxy api:8080' in caddy
    assert 'reverse_proxy web:3000' in caddy
    assert m.proxy.strip_prefix == {'/api/actuator': '/api'}
    assert '/api' not in m.proxy.strip_prefix  # /api/hello must survive
    assert not verify(m,root)

def test_invalid_strip_rewrite_rejected(tmp_path):
    m=Manifest(project=ProjectConfig(name='demo'), applications={'api': AppConfig(adapter='generic-docker',path='.',port=8080)}, mongodb={'enabled':False}, proxy={'routes': {'/api': 'api'}, 'strip_prefix': {'/api': '/wrong'}})
    assert any('strip_prefix' in e for e in verify(m,tmp_path))

def test_existing_files_are_preserved_after_second_generate(tmp_path):
    root, m = create_demo(tmp_path)
    env = (root/'.env').read_text()
    original = (root/'web/Dockerfile').read_text()
    result = generate(m,root)
    assert (root/'.env').read_text() == env
    assert (root/'web/Dockerfile').read_text() == original
    assert all(action in ('unchanged','skipped') for action,_ in result)

def test_generated_scaffold_keeps_api_prefix(tmp_path):
    root, m = create_demo(tmp_path)
    controller = (root/'api/src/main/java/dev/forger/app/HealthController.java').read_text()
    assert '@GetMapping("/api/hello")' in controller
    assert m.proxy.routes['/api'] == 'api'
    assert m.proxy.routes['/api/actuator'] == 'api'
