const fs = require('fs');
const path = require('path');
const { writePsd, initializeCanvas } = require('ag-psd');
initializeCanvas(
  () => { throw new Error('Canvas is not used by this PSD workflow'); },
  (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) }),
);

const root = path.resolve(__dirname, '..');
const work = path.join(root, 'tmp', 'tank-only-psd');
const outputName = process.argv[2] || 'GAME_UI_TANK_ONLY_WITH_MINI_ICONS.psd';
const output = path.join(root, 'portfolio-assets', 'photoshop', outputName);
const width = 1200;
const height = 628;
const pixelData = (file, w, h) => ({
  width: w,
  height: h,
  data: new Uint8ClampedArray(fs.readFileSync(file)),
});

const manifest = JSON.parse(fs.readFileSync(path.join(work, 'manifest.json'), 'utf8'));
const iconLayers = manifest.map(item => ({
  name: item.name,
  left: item.left,
  top: item.top,
  right: item.left + item.width,
  bottom: item.top + item.height,
  imageData: pixelData(item.raw, item.width, item.height),
}));

const psd = {
  width,
  height,
  imageData: pixelData(path.join(work, 'composite.rgba'), width, height),
  children: [
    {
      name: 'MINI_ICONS_INDEPENDENT',
      opened: true,
      children: iconLayers,
    },
    {
      name: 'AQUARIUM_BACKGROUND_FULL_TANK',
      left: 0,
      top: 0,
      right: width,
      bottom: height,
      imageData: pixelData(path.join(work, 'background.rgba'), width, height),
    },
  ],
};

fs.writeFileSync(output, Buffer.from(writePsd(psd, {
  generateThumbnail: false,
  trimImageData: true,
  noBackground: true,
})));
console.log(output);
