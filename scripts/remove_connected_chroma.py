from collections import deque
from pathlib import Path
import sys

from PIL import Image


def main() -> None:
    source = Path(sys.argv[1])
    output = Path(sys.argv[2])
    image = Image.open(source).convert("RGBA")
    pixels = image.load()
    width, height = image.size

    border = []
    for x in range(width):
        border.extend((pixels[x, 0][:3], pixels[x, height - 1][:3]))
    for y in range(height):
        border.extend((pixels[0, y][:3], pixels[width - 1, y][:3]))
    key = tuple(sum(color[i] for color in border) // len(border) for i in range(3))

    def is_background(x: int, y: int) -> bool:
        r, g, b, _ = pixels[x, y]
        distance = ((r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2) ** 0.5
        return distance < 115 and r > 170 and b > 135 and g < 95

    queue = deque()
    visited = bytearray(width * height)
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))

    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if visited[index] or not is_background(x, y):
            continue
        visited[index] = 1
        r, g, b, _ = pixels[x, y]
        pixels[x, y] = (r, g, b, 0)
        if x:
            queue.append((x - 1, y))
        if x + 1 < width:
            queue.append((x + 1, y))
        if y:
            queue.append((x, y - 1))
        if y + 1 < height:
            queue.append((x, y + 1))

    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output)


if __name__ == "__main__":
    main()
