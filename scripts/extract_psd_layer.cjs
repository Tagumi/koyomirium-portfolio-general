const fs = require('fs');
const path = require('path');
const { readPsd, initializeCanvas } = require('ag-psd');
initializeCanvas(
  () => { throw new Error('Canvas is not used'); },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
);
const [file, wanted, out] = process.argv.slice(2);
const psd = readPsd(fs.readFileSync(file), { useImageData: true });
function find(layers) {
  for (const layer of layers || []) {
    if (layer.name === wanted) return layer;
    const nested = find(layer.children);
    if (nested) return nested;
  }
}
const layer = find(psd.children);
if (!layer || !layer.imageData) throw new Error(`Layer not found or has no bitmap: ${wanted}`);
fs.writeFileSync(out, Buffer.from(layer.imageData.data));
fs.writeFileSync(`${out}.json`, JSON.stringify({
  width: layer.imageData.width,
  height: layer.imageData.height,
  left: layer.left || 0,
  top: layer.top || 0,
}));
console.log(`${wanted}: ${layer.imageData.width}x${layer.imageData.height}`);
