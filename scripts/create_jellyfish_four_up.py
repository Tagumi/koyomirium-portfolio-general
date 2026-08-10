from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
source = root / "portfolio-assets" / "photoshop" / "FINAL"
target = root / "public" / "portfolio-assets" / "photoshop" / "jellyfish-expressions.png"

cell = 600
gap = 8
canvas = Image.new("RGB", (cell * 2 + gap * 3, cell * 2 + gap * 3), "#031630")
draw = ImageDraw.Draw(canvas)

for index, filename in enumerate(("1.png", "2.png", "5.png", "4.png")):
    image = Image.open(source / filename).convert("RGB")
    side = min(image.width, image.height)
    left = (image.width - side) // 2
    top = (image.height - side) // 2
    frame = image.crop((left, top, left + side, top + side)).resize(
        (cell, cell), Image.Resampling.LANCZOS
    )

    column = index % 2
    row = index // 2
    x = gap + column * (cell + gap)
    y = gap + row * (cell + gap)
    canvas.paste(frame, (x, y))
    draw.rectangle((x, y, x + cell - 1, y + cell - 1), outline="#52eff5", width=3)

target.parent.mkdir(parents=True, exist_ok=True)
canvas.save(target, quality=95)
print(target)
