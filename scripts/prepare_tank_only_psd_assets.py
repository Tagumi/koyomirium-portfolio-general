from pathlib import Path
import json
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "portfolio-assets" / "photoshop" / "banner-source-assets"
WORK = ROOT / "tmp" / "tank-only-psd"
WORK.mkdir(parents=True, exist_ok=True)

WIDTH, HEIGHT = 1200, 628

background = Image.open(ASSETS / "01-aquarium-background-three-tanks-fish-fixed-v5.png").convert("RGBA")
background = background.resize((WIDTH, HEIGHT), Image.Resampling.NEAREST)
background.save(WORK / "background-preview.png")
(WORK / "background.rgba").write_bytes(background.tobytes())

specs = [
    ("01_Shark_Large", "15-shark-right-coarse-transparent.png", (170, 150), (28, 90)),
    ("02_Stingray_Large", "16-stingray-left-coarse-transparent.png", (170, 150), (220, 90)),
    ("03_Hammer", "17-hammer-coarse-transparent-v2.png", (64, 64), (20, 285)),
    ("04_Calendar", "18-calendar-coarse-transparent.png", (64, 64), (90, 285)),
    ("05_Plus", "19-plus-coarse-transparent.png", (64, 64), (160, 285)),
    ("06_Star", "20-star-coarse-transparent.png", (64, 64), (230, 285)),
    ("07_Water_Drop", "21-water-drop-coarse-transparent.png", (64, 64), (300, 285)),
    ("08_Fish", "22-fish-coarse-transparent.png", (64, 64), (370, 285)),
]

composite = background.copy()
manifest = []
for name, filename, box, position in specs:
    image = Image.open(ASSETS / filename).convert("RGBA")
    bbox = image.getchannel("A").getbbox()
    if not bbox:
        raise RuntimeError(f"No visible pixels: {filename}")
    image = image.crop(bbox)
    image.thumbnail(box, Image.Resampling.NEAREST)
    layer = Image.new("RGBA", box, (0, 0, 0, 0))
    offset = ((box[0] - image.width) // 2, (box[1] - image.height) // 2)
    layer.alpha_composite(image, offset)
    raw = WORK / f"{name}.rgba"
    raw.write_bytes(layer.tobytes())
    composite.alpha_composite(layer, position)
    manifest.append({
        "name": name,
        "raw": str(raw),
        "width": box[0],
        "height": box[1],
        "left": position[0],
        "top": position[1],
    })

composite.save(ROOT / "portfolio-assets" / "photoshop" / "GAME_UI_TANK_ONLY_WITH_MINI_ICONS_PREVIEW.png")
(WORK / "composite.rgba").write_bytes(composite.tobytes())
(WORK / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
print(WORK / "manifest.json")
