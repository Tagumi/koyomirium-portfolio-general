from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
source = ROOT / "tmp" / "imagegen" / "favicon-jelly-alpha.png"
image = Image.open(source).convert("RGBA")
alpha = image.getchannel("A")
box = alpha.getbbox()
if not box:
    raise RuntimeError("The favicon source has no visible pixels")

image = image.crop(box)
side = max(image.size)
square = Image.new("RGBA", (side, side), (0, 0, 0, 0))
square.alpha_composite(image, ((side - image.width) // 2, (side - image.height) // 2))

canvas = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
sprite = square.resize((56, 56), Image.Resampling.NEAREST)
canvas.alpha_composite(sprite, (4, 4))
canvas.save(ROOT / "app" / "icon.png")
canvas.save(ROOT / "app" / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])
