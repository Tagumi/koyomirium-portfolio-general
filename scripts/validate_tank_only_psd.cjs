const fs = require('fs');
const path = require('path');
const { readPsd } = require('ag-psd');

const fileName = process.argv[2] || 'GAME_UI_TANK_ONLY_WITH_MINI_ICONS.psd';
const file = path.resolve(__dirname, '..', 'portfolio-assets', 'photoshop', fileName);
const psd = readPsd(fs.readFileSync(file), {
  skipLayerImageData: true,
  skipCompositeImageData: true,
});
const group = psd.children.find(layer => layer.name === 'MINI_ICONS_INDEPENDENT');
const background = psd.children.find(layer => layer.name === 'AQUARIUM_BACKGROUND_FULL_TANK');
if (!group || group.children.length !== 8 || !background) throw new Error('Required layer structure missing');
const forbidden = ['keeper', 'dolphin', 'jellyfish', '飼育員', 'イルカ', 'クラゲ'];
const names = JSON.stringify(psd.children).toLowerCase();
if (forbidden.some(word => names.includes(word.toLowerCase()))) throw new Error('Forbidden character layer found');
console.log(JSON.stringify({
  file,
  size: `${psd.width}x${psd.height}`,
  background: background.name,
  iconLayers: group.children.map(layer => layer.name),
  bytes: fs.statSync(file).size,
}, null, 2));
