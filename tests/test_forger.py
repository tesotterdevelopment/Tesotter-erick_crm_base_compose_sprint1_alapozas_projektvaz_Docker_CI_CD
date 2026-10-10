from pathlib import Path
from typer.testing import CliRunner
import yaml
from forger.cli import app
from forger.models import Manifest,ProjectConfig,AppConfig
from forger.generator import generate,verify,compose_data

runner=CliRunner()
def test_empty_init(tmp_path):
    result=runner.invoke(app,['init',str(tmp_path),'--yes'])
    assert result.exit_code==0, result.output
    assert (tmp_path/'forger.yaml').exists()

def test_existing_discovery_and_generation(tmp_path):
    api=tmp_path/'api';api.mkdir();(api/'pom.xml').write_text('<project/>')
    web=tmp_path/'web';web.mkdir();(web/'package.json').write_text('{"dependencies":{"next":"15"}}')
    (web/'Dockerfile').write_text('FROM node:22-alpine\n')
    assert runner.invoke(app,['init',str(tmp_path),'--yes']).exit_code==0
    m=Manifest.model_validate(yaml.safe_load((tmp_path/'forger.yaml').read_text()))
    assert set(m.applications)=={'api','web'}
    assert not verify(m,tmp_path)
    generate(m,tmp_path)
    assert (api/'Dockerfile').exists()
    assert (web/'Dockerfile').read_text()=='FROM node:22-alpine\n'
    assert 'mongo' in compose_data(m)['services']
    assert 'caddy' in compose_data(m)['services']

def test_network_validation(tmp_path):
    m=Manifest(project=ProjectConfig(name='test'),applications={'api':AppConfig(adapter='generic-docker',path='.',port=8080,networks=['missing'])})
    assert any('unknown network' in x for x in verify(m,tmp_path))

def test_new_scaffold(tmp_path):
    result=runner.invoke(app,['new','sample','--parent',str(tmp_path),'--yes'])
    assert result.exit_code==0,result.output
    root=tmp_path/'sample'
    assert (root/'api'/'pom.xml').exists()
    assert (root/'web'/'package.json').exists()
    assert (root/'web'/'Dockerfile').exists()
    assert (root/'compose.yaml').exists()

def test_profiles(tmp_path):
    m=Manifest(project=ProjectConfig(name='test'),profiles={'dev':'Development'},applications={'worker':AppConfig(adapter='generic-docker',path='.',port=7777,profiles=['dev'])},proxy={'enabled':False},mongodb={'enabled':False})
    assert not verify(m,tmp_path)
    assert compose_data(m)['services']['worker']['profiles']==['dev']

def test_no_public_app_ports(tmp_path):
    m=Manifest(project=ProjectConfig(name='test'),applications={'web':AppConfig(adapter='generic-docker',path='.',port=3000)},mongodb={'enabled':False})
    spec=compose_data(m)
    assert 'ports' not in spec['services']['web']
    assert spec['services']['caddy']['ports'][0].startswith('${PUBLIC_BIND_IP:-127.0.0.1}')
