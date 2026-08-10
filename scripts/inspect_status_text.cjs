const fs = require('fs');
const path = require('path');
const { readPsd } = require(path.resolve(__dirname, '../node_modules/.pnpm/ag-psd@31.0.2/node_modules/ag-psd'));

const input = path.resolve(__dirname, '../portfolio-assets/photoshop/STATUS.psd');
const psd = readPsd(fs.readFileSync(input), { skipLayerImageData: true, skipCompositeImageData: true });

function find(children, name) {
  for (const child of children || []) {
    if (child.name === name && child.text) return child;
    const nested = find(child.children, name);
    if (nested) return nested;
  }
}

for (const name of ['本日グランドオープン！', 'Catch_Copy', 'NEW GAME']) {
  const layer = find(psd.children, name);
  console.log('\n### ' + name);
  console.log(JSON.stringify(layer && { left: layer.left, top: layer.top, right: layer.right, bottom: layer.bottom, text: layer.text }, null, 2));
}
