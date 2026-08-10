const fs = require('fs');
const path = require('path');
const { readPsd } = require(path.resolve(__dirname, '../node_modules/.pnpm/ag-psd@31.0.2/node_modules/ag-psd'));

const input = path.resolve(__dirname, '../portfolio-assets/photoshop/STATUS.psd');
const psd = readPsd(fs.readFileSync(input), { skipLayerImageData: true, skipCompositeImageData: true });

function walk(children, depth = 0) {
  for (const child of children || []) {
    const bounds = [child.left, child.top, child.right, child.bottom].map(v => v ?? '-').join(',');
    console.log(`${'  '.repeat(depth)}- ${child.name || '(unnamed)'} | ${child.children ? 'group' : 'layer'} | visible=${child.hidden !== true} | bounds=${bounds}${child.text ? ' | text=' + JSON.stringify(child.text.text) : ''}`);
    walk(child.children, depth + 1);
  }
}

console.log(`canvas=${psd.width}x${psd.height}, colorMode=${psd.colorMode}, bits=${psd.bitsPerChannel}`);
walk(psd.children);
