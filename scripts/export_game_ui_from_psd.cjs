const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { initializeCanvas, readPsd } = require('ag-psd');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'portfolio-assets', 'photoshop', 'FINAL', '【FINAL】ゲーム画面UI.psd');
const target = path.join(root, 'public', 'portfolio-assets', 'photoshop', 'game-ui.png');

const createImageData = (width, height) => ({
  width,
  height,
  data: new Uint8ClampedArray(width * height * 4),
});

initializeCanvas(
  (width, height) => ({
    width,
    height,
    getContext: () => ({ createImageData, putImageData: () => {} }),
  }),
  createImageData,
);

const psd = readPsd(fs.readFileSync(source), {
  skipLayerImageData: true,
  skipThumbnail: true,
  useImageData: true,
});

if (!psd.imageData?.data) throw new Error('PSD composite image data was not found');

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type, 'ascii');
  const body = Buffer.concat([name, data]);
  const out = Buffer.alloc(12 + data.length);
  out.writeUInt32BE(data.length, 0);
  body.copy(out, 4);
  out.writeUInt32BE(crc32(body), 8 + data.length);
  return out;
}

const width = psd.width;
const height = psd.height;
const rgba = Buffer.from(psd.imageData.data.buffer, psd.imageData.data.byteOffset, psd.imageData.data.byteLength);
const scanlines = Buffer.alloc((width * 4 + 1) * height);

for (let y = 0; y < height; y++) {
  const targetOffset = y * (width * 4 + 1);
  scanlines[targetOffset] = 0;
  rgba.copy(scanlines, targetOffset + 1, y * width * 4, (y + 1) * width * 4);
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(width, 0);
ihdr.writeUInt32BE(height, 4);
ihdr[8] = 8;
ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', zlib.deflateSync(scanlines, { level: 9 })),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.writeFileSync(target, png);
console.log(`Exported ${width}x${height} composite to ${target}`);
