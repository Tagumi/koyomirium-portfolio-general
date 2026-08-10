from pathlib import Path
import json
import sys
from PIL import Image

raw = Path(sys.argv[1])
out = Path(sys.argv[2])
meta = json.loads(Path(str(raw) + ".json").read_text(encoding="utf-8"))
image = Image.frombytes("RGBA", (meta["width"], meta["height"]), raw.read_bytes())
image.save(out)
print(out)
