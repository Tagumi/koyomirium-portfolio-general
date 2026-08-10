from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "portfolio-assets" / "photoshop" / "banner-source-assets"
WORK = ROOT / "tmp" / "ui-icon-layers"
WORK.mkdir(parents=True, exist_ok=True)

icons = [
    ("01_Hammer", "17-hammer-coarse-transparent-v2.png"),
    ("02_Calendar", "18-calendar-coarse-transparent.png"),
    ("03_Plus", "19-plus-coarse-transparent.png"),
    ("04_Star", "20-star-coarse-transparent.png"),
    ("05_Water_Drop", "21-water-drop-coarse-transparent.png"),
    ("06_Fish", "22-fish-coarse-transparent.png"),
]

manifest = []
for name, filename in icons:
    image = Image.open(ASSETS / filename).convert("RGBA")
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError(f"No visible pixels: {filename}")
    image = image.crop(bbox)
    image.thumbnail((82, 82), Image.Resampling.NEAREST)
    canvas = Image.new("RGBA", (88, 88), (0, 0, 0, 0))
    x = (88 - image.width) // 2
    y = (88 - image.height) // 2
    canvas.alpha_composite(image, (x, y))
    raw_path = WORK / f"{name}.rgba"
    raw_path.write_bytes(canvas.tobytes())
    manifest.append({"name": name, "width": 88, "height": 88, "raw": str(raw_path)})

(WORK / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(WORK / "manifest.json")

