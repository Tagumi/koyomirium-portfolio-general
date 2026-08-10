from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[1]
out = root / "public" / "works-text" / "ec-rakuten.png"
font = ImageFont.truetype(r"C:\Windows\Fonts\msgothic.ttc", 12)
text = "EC画像（楽天用）"
pad = 5
probe = Image.new("RGBA", (8, 8))
box = ImageDraw.Draw(probe).textbbox((0, 0), text, font=font)
w = int(box[2] - box[0]) + pad * 2 + 3
h = int(box[3] - box[1]) + pad * 2 + 3
image = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw = ImageDraw.Draw(image)
x, y = w // 2, pad - box[1]
draw.text((x + 2, y + 2), text, font=font, fill=(0, 62, 102, 255), anchor="ma")
draw.text((x, y), text, font=font, fill=(255, 255, 255, 255), anchor="ma")
image.resize((w * 3, h * 3), Image.Resampling.NEAREST).save(out)
