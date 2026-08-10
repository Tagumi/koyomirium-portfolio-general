const fs = require('fs');
const path = require('path');
const { readPsd } = require('ag-psd');

const file = path.resolve(__dirname, '..', 'portfolio-assets', 'photoshop', 'GAME_UI_SIMPLE_WITH_ICONS.psd');
const psd = readPsd(fs.readFileSync(file), {
  skipLayerImageData: true,
  skipCompositeImageData: true,
});
const group = (psd.children || []).find(layer => layer.name === 'UI_ICONS_GENERATED_INDEPENDENT');
if (!group || !group.children || group.children.length !== 6) {
  throw new Error('Expected independent 6-layer icon group was not found');
}
console.log(JSON.stringify({
  file,
  width: psd.width,
  height: psd.height,
  group: group.name,
  layers: group.children.map(layer => layer.name),
  bytes: fs.statSync(file).size,
}, null, 2));
