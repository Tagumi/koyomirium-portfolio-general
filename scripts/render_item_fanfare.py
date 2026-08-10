from pathlib import Path
from PIL import Image, ImageDraw
import math

OUT = Path(__file__).resolve().parents[1] / "public" / "item-fanfare-bg-v2.png"
W, H = 90, 70
CX, CY = W // 2, H // 2 - 5
COLORS = ["#d62d72", "#ee6a42", "#f3c84d", "#28a9c5", "#79346f", "#f08c3e"]
im = Image.new("RGB", (W, H), "#06162f")
d = ImageDraw.Draw(im)
radius = 150
segments = 12
for i in range(segments):
    a0 = (i / segments) * math.tau
    a1 = ((i + 1) / segments) * math.tau
    p0 = (CX + int(math.cos(a0) * radius), CY + int(math.sin(a0) * radius))
    p1 = (CX + int(math.cos(a1) * radius), CY + int(math.sin(a1) * radius))
    d.polygon([(CX, CY), p0, p1], fill=COLORS[i % len(COLORS)])

im.resize((W*8, H*8), Image.Resampling.NEAREST).save(OUT)
