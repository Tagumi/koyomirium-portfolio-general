const fs = require('fs');
const { readPsd } = require('ag-psd');
const file = process.argv[2];
if (!file) throw new Error('PSD path required');
const psd = readPsd(fs.readFileSync(file), { skipLayerImageData: true, skipCompositeImageData: true });
function walk(layers, depth = 0) {
  for (const layer of layers || []) {
    console.log(`${'  '.repeat(depth)}${layer.name} visible=${layer.hidden !== true} bounds=${layer.left ?? ''},${layer.top ?? ''},${layer.right ?? ''},${layer.bottom ?? ''}`);
    walk(layer.children, depth + 1);
  }
}
console.log(`PSD ${psd.width}x${psd.height}`);
walk(psd.children);
