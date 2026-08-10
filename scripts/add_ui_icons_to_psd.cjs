const fs = require('fs');
const path = require('path');
const { readPsd, writePsd, initializeCanvas } = require('ag-psd');

// ag-psd only needs ImageData in this workflow; keep it canvas-free so the
// source PSD's existing layer bitmaps remain byte-based and editable.
initializeCanvas(
  () => { throw new Error('Canvas is not used by this PSD workflow'); },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
);

const root = path.resolve(__dirname, '..');
const input = path.join(root, 'portfolio-assets', 'photoshop', 'GAME_UI_SIMPLE.psd');
const output = path.join(root, 'portfolio-assets', 'photoshop', 'GAME_UI_SIMPLE_WITH_ICONS.psd');
const manifestPath = path.join(root, 'tmp', 'ui-icon-layers', 'manifest.json');

const psd = readPsd(fs.readFileSync(input), { useImageData: true });
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// A compact asset row near the bottom of the UI. Every icon remains its own pixel layer.
const startX = 334;
const y = psd.height - 112;
const gap = 94;
const children = manifest.map((item, index) => {
  const data = new Uint8ClampedArray(fs.readFileSync(item.raw));
  return {
    name: item.name,
    left: startX + index * gap,
    top: y,
    right: startX + index * gap + item.width,
    bottom: y + item.height,
    imageData: { width: item.width, height: item.height, data },
  };
});

psd.children = psd.children || [];
psd.children.unshift({
  name: 'UI_ICONS_GENERATED_INDEPENDENT',
  opened: true,
  children,
});

fs.writeFileSync(output, Buffer.from(writePsd(psd, { generateThumbnail: false, trimImageData: true })));
console.log(output);
