import json
from pathlib import Path
from forger.models import Manifest
Path('docs/forger.schema.json').write_text(json.dumps(Manifest.model_json_schema(),indent=2)+'\n')
