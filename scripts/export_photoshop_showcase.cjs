const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'portfolio-assets', 'photoshop', 'FINAL');
const target = path.join(root, 'public', 'portfolio-assets', 'photoshop');

fs.mkdirSync(target, { recursive: true });

const assets = [
  ['【FINAL】BANNER.png', 'release-banner.png'],
  ['【FINAL】GAME_UI.png', 'game-ui.png'],
  ['【FINAL】ゲーム画面UI.psd', 'game-ui-sample.psd'],
  ['【FINAL】配信開始バナー.psd', 'release-banner.psd'],
  ['【FINAL】クラゲ表情4差分.psd', 'jellyfish-expressions.psd'],
];

for (const [input, output] of assets) {
  fs.copyFileSync(path.join(source, input), path.join(target, output));
}

console.log('Photoshop showcase assets exported');
