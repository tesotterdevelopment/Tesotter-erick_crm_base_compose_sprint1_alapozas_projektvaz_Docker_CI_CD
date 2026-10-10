import json
import subprocess
from pathlib import Path
import typer
import yaml
from rich.console import Console
from rich.prompt import Confirm, Prompt
from rich.table import Table
from . import __version__
from .models import Manifest, ProjectConfig, AppConfig
from .adapters import discover
from .generator import generate as render, verify, GenerationError, compose_data

app=typer.Typer(help="forger — modular Compose project scaffolding",no_args_is_help=True)
console=Console()

def load(root:Path)->Manifest:
    f=root/"forger.yaml"
    if not f.exists(): raise typer.BadParameter("Missing forger.yaml. Run forger init first.")
    return Manifest.model_validate(yaml.safe_load(f.read_text(encoding="utf8")))

def save(root:Path,m:Manifest):
    (root/"forger.yaml").write_text(yaml.safe_dump(m.model_dump(exclude_none=True),sort_keys=False,allow_unicode=True),encoding="utf8")

def seed(m:Manifest, found:list[tuple[str,str]]):
    for directory,adapter in found:
        name=(directory if directory!='.' else 'app').replace('-','_')
        defaultport=8080 if adapter=='spring-boot-maven' else 3000
        networks=['app','database'] if adapter=='spring-boot-maven' else ['app']
        m.applications[name]=AppConfig(adapter=adapter,path=directory,port=defaultport,networks=networks)
    if 'api' in m.applications and 'web' in m.applications:
        m.proxy.routes={'/api':'api','/':'web'}
    elif m.applications:
        m.proxy.routes={'/':next(iter(m.applications))}
    else:m.proxy.enabled=False
    if not any(a.adapter=='spring-boot-maven' for a in m.applications.values()): m.mongodb.enabled=False

@app.command()
def version(): console.print(f"forger {__version__}")

@app.command()
def init(path:Path=typer.Argument(Path('.')),yes:bool=typer.Option(False,'--yes',help='Accept detected defaults')):
    root=path.resolve();root.mkdir(parents=True,exist_ok=True)
    if (root/'forger.yaml').exists(): raise typer.BadParameter('Manifest already exists; use configure')
    detected=discover(root)
    console.print('[bold]forger · existing project discovery[/bold]')
    for directory,adapter in detected:console.print(f'  [green]✓[/green] {directory}: {adapter}')
    if not detected and not yes: console.print('No known applications detected. Use forger new or configure afterward.')
    m=Manifest(project=ProjectConfig(name=root.name.lower().replace(' ','-')))
    seed(m,detected)
    if not yes:
        m.proxy.domain=Prompt.ask('Domain (leave empty for localhost)',default='').strip() or None
        if m.proxy.domain:console.print('[yellow]Public mode requires DNS and ports 80/443 to be reachable.[/yellow]')
    save(root,m)
    console.print(f'[green]Created[/green] {root/"forger.yaml"}')
    console.print('Next: forger configure; forger generate; forger validate')

@app.command('new')
def new_project(name:str, path:Path=typer.Option(Path('.'),'--parent'),yes:bool=typer.Option(False,'--yes')):
    root=(path/name).resolve()
    if root.exists() and any(root.iterdir()):raise typer.BadParameter('Target directory is not empty')
    root.mkdir(parents=True,exist_ok=True)
    m=Manifest(project=ProjectConfig(name=name))
    if yes:
        adapters={'api':('spring-boot-maven',8080,['app','database']),'web':('nextjs',3000,['app'])}
    else:
        choice=Prompt.ask('Project preset',choices=['crm','nextjs','spring'],default='crm')
        adapters={'api':('spring-boot-maven',8080,['app','database']),'web':('nextjs',3000,['app'])} if choice=='crm' else {'web':('nextjs',3000,['app'])} if choice=='nextjs' else {'api':('spring-boot-maven',8080,['app','database'])}
    for n,(adapter,port,networks) in adapters.items():m.applications[n]=AppConfig(adapter=adapter,path=f'./{n}',source='scaffold',port=port,networks=networks)
    m.proxy.routes={'/api/actuator':'api','/api':'api','/':'web'} if 'web' in adapters and 'api' in adapters else {'/':next(iter(adapters))}
    if 'web' in adapters and 'api' in adapters:m.proxy.strip_prefix={'/api/actuator':'/api'}
    m.mongodb.enabled='api' in adapters
    save(root,m)
    render(m,root)
    console.print(f'[green]Initialized[/green] {root}. Run: cd {name} && forger validate')

@app.command()
def configure(path:Path=typer.Option(Path('.'),'--path')):
    root=path.resolve();m=load(root)
    console.print('[bold]forger · configure[/bold]')
    while True:
        choice=Prompt.ask('What to change?',choices=['add-app','domain','profile','database','done'],default='done')
        if choice=='done':break
        if choice=='domain':m.proxy.domain=Prompt.ask('Domain (empty = localhost)',default=m.proxy.domain or '').strip() or None
        elif choice=='profile':
            name=Prompt.ask('Profile name');m.profiles[name]=Prompt.ask('Description',default=f'{name} services')
            console.print('Assign this profile to an app in forger.yaml applications.<name>.profiles')
        elif choice=='database':
            m.mongodb.enabled=Confirm.ask('Enable MongoDB?',default=m.mongodb.enabled)
            if m.mongodb.enabled:m.mongodb.mode=Prompt.ask('Mongo mode',choices=['bundled','external'],default=m.mongodb.mode)
        elif choice=='add-app':
            name=Prompt.ask('Service name');adapter=Prompt.ask('Adapter',choices=['nextjs','spring-boot-maven','generic-docker'],default='generic-docker')
            source=Prompt.ask('Source',choices=['existing','scaffold'],default='existing')
            if adapter=='generic-docker' and source=='scaffold':console.print('[red]Generic Docker requires existing Dockerfile[/red]');continue
            directory=Prompt.ask('Directory',default=f'./{name}')
            port=int(Prompt.ask('Container port',default='8080' if adapter=='spring-boot-maven' else '3000'))
            nets=['app','database'] if adapter=='spring-boot-maven' else ['app']
            m.applications[name]=AppConfig(adapter=adapter,source=source,path=directory,port=port,networks=nets)
    save(root,m);console.print('[green]Saved[/green] forger.yaml')

@app.command()
def inspect(path:Path=typer.Option(Path('.'),'--path'),graph:bool=False):
    root=path.resolve();m=load(root)
    table=Table(title=f'forger: {m.project.name}');table.add_column('Service');table.add_column('Adapter');table.add_column('Networks');table.add_column('Profiles');table.add_column('Requires')
    for n,a in m.applications.items():table.add_row(n,a.adapter,', '.join(a.networks),', '.join(a.profiles) or 'always',', '.join(a.requires) or '-')
    console.print(table)
    if graph:
        for n,a in m.applications.items():
            for dep in a.requires:console.print(f'{n} --> {dep} (depends_on)')
        for path,target in m.proxy.routes.items():console.print(f'caddy --> {target} (route {path})')

@app.command()
def generate(path:Path=typer.Option(Path('.'),'--path'),dry_run:bool=False,overwrite:bool=typer.Option(False,'--overwrite')):
    root=path.resolve();m=load(root)
    try:
        changes=render(m,root,overwrite='replace' if overwrite else 'skip',dry_run=True)
        for action,name in changes:console.print(f'{action:>10}  {name}')
        if dry_run:return
        if any(action=='updated' for action,_ in changes) and overwrite and not Confirm.ask('Overwrite existing generated files?',default=False):raise typer.Exit(1)
        if not overwrite and any(action=='skipped' for action,_ in changes):console.print('[yellow]Some changed files were preserved. Use --overwrite to regenerate.[/yellow]')
        render(m,root,overwrite='replace' if overwrite else 'skip')
        console.print('[green]Generation complete[/green]')
    except GenerationError as ex:console.print(f'[red]{ex}[/red]');raise typer.Exit(1)

@app.command()
def validate(path:Path=typer.Option(Path('.'),'--path'),build:bool=False):
    root=path.resolve();m=load(root)
    errors=verify(m,root)
    if errors:
        for e in errors:console.print(f'[red]✗ {e}[/red]')
        raise typer.Exit(1)
    console.print('[green]✓ Manifest and dependency validation passed[/green]')
    if (root/'compose.yaml').exists():
        try:
            result=subprocess.run(['docker','compose','config','-q'],cwd=root,check=False,capture_output=True,text=True)
            if result.returncode:console.print(f'[red]{result.stderr}[/red]');raise typer.Exit(1)
            console.print('[green]✓ Docker Compose config passed[/green]')
        except FileNotFoundError:console.print('[yellow]Docker unavailable: Compose validation skipped[/yellow]')
        if build:
            try:subprocess.run(['docker','compose','build'],cwd=root,check=True)
            except (subprocess.CalledProcessError,FileNotFoundError):raise typer.Exit(1)

@app.command()
def up(path:Path=typer.Option(Path('.'),'--path'),profile:list[str]=typer.Option([],'--profile')):
    root=path.resolve();load(root)
    args=['docker','compose']
    for pr in profile:args+=['--profile',pr]
    try:raise typer.Exit(subprocess.run(args+['up','-d','--build'],cwd=root,check=False).returncode)
    except FileNotFoundError:console.print('Docker Compose not installed');raise typer.Exit(1)

@app.command()
def down(path:Path=typer.Option(Path('.'),'--path')):
    root=path.resolve();load(root)
    try:raise typer.Exit(subprocess.run(['docker','compose','down'],cwd=root,check=False).returncode)
    except FileNotFoundError:console.print('Docker Compose not installed');raise typer.Exit(1)

if __name__=='__main__':app()
