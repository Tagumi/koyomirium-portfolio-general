const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/moony/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const { writePsd, readPsd } = require('C:/Users/moony/Claude/Projects/unipaws_lp/node_modules/ag-psd');
const { PNG } = require('C:/Users/moony/Claude/Projects/unipaws_lp/node_modules/pngjs');

const W = 1200;
const H = 628;
const root = path.resolve(__dirname, '..');
const outputDir = path.join(root, 'portfolio-assets', 'photoshop');
const source = path.join(outputDir, 'aquarium-release-key-art.png');
const psdPath = path.join(outputDir, 'aquarium-release-banner-complete.psd');
const previewPath = path.join(outputDir, 'aquarium-release-banner-complete.png');

fs.mkdirSync(outputDir, { recursive: true });

const escapeXml = (s) => s.replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' }[c]));

function svgLayer(body) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
}

async function pngFromSvg(body) {
  return sharp(svgLayer(body)).png().toBuffer();
}

function imageData(buffer) {
  const png = PNG.sync.read(buffer);
  return { width: png.width, height: png.height, data: new Uint8ClampedArray(png.data) };
}

async function main() {
  if (!fs.existsSync(source)) throw new Error(`Missing source: ${source}`);

  const art = await sharp(source).resize(W, H, { fit: 'cover', position: 'centre' }).png().toBuffer();

  const backgroundTone = await pngFromSvg(`
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#020b26" stop-opacity="0.96"/>
        <stop offset="0.42" stop-color="#073b75" stop-opacity="0.88"/>
        <stop offset="0.62" stop-color="#087ba1" stop-opacity="0.18"/>
        <stop offset="1" stop-color="#00152f" stop-opacity="0.04"/>
      </linearGradient>
      <radialGradient id="v"><stop offset="0.55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.48"/></radialGradient>
    </defs>
    <rect width="1200" height="628" fill="url(#g)"/>
    <rect width="1200" height="628" fill="url(#v)"/>
  `);

  const bubbles = await pngFromSvg(`
    <g fill="none" stroke="#7feeff" stroke-width="3" opacity="0.42">
      <circle cx="92" cy="102" r="9"/><circle cx="142" cy="171" r="5"/><circle cx="68" cy="424" r="6"/>
      <circle cx="504" cy="78" r="7"/><circle cx="548" cy="522" r="10"/><circle cx="462" cy="562" r="4"/>
    </g>
    <g fill="#d7fbff" opacity="0.65"><circle cx="106" cy="118" r="2"/><circle cx="531" cy="98" r="2"/><circle cx="488" cy="544" r="2"/></g>
  `);

  const newGame = await pngFromSvg(`
    <rect x="64" y="58" width="162" height="38" rx="19" fill="#17d9e8"/>
    <text x="145" y="84" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" font-weight="800" letter-spacing="2" fill="#02142f">NEW GAME</text>
  `);

  const title = await pngFromSvg(`
    <defs><filter id="shadow"><feDropShadow dx="4" dy="5" stdDeviation="0" flood-color="#00132e" flood-opacity="1"/></filter></defs>
    <g filter="url(#shadow)" font-family="Yu Gothic, Meiryo, sans-serif" font-weight="900" fill="#ffffff" stroke="#0786b7" stroke-width="7" paint-order="stroke">
      <text x="62" y="176" font-size="58">海辺の水族館</text>
      <text x="62" y="244" font-size="58">ものがたり</text>
    </g>
  `);

  const subtitle = await pngFromSvg(`
    <text x="66" y="302" font-family="Yu Gothic, Meiryo, sans-serif" font-size="24" font-weight="700" fill="#d9fbff">小さな水族館を、</text>
    <text x="66" y="338" font-family="Yu Gothic, Meiryo, sans-serif" font-size="24" font-weight="700" fill="#d9fbff">人気スポットに育てよう。</text>
  `);

  const launch = await pngFromSvg(`
    <defs><linearGradient id="gold" x1="0" x2="1"><stop stop-color="#ffb72d"/><stop offset="0.5" stop-color="#ffe56a"/><stop offset="1" stop-color="#ff9f1c"/></linearGradient></defs>
    <path d="M52 385 L480 385 L510 418 L480 451 L52 451 L76 418 Z" fill="#71351d" opacity="0.65" transform="translate(5 6)"/>
    <path d="M52 379 L480 379 L510 412 L480 445 L52 445 L76 412 Z" fill="url(#gold)"/>
    <text x="282" y="424" text-anchor="middle" font-family="Yu Gothic, Meiryo, sans-serif" font-size="31" font-weight="900" fill="#392009">本日グランドオープン！</text>
  `);

  const cta = await pngFromSvg(`
    <rect x="64" y="490" width="246" height="62" rx="12" fill="#00172f" opacity="0.55" transform="translate(5 6)"/>
    <rect x="64" y="490" width="246" height="62" rx="12" fill="#ffda3e" stroke="#fff3a0" stroke-width="3"/>
    <text x="176" y="530" text-anchor="middle" font-family="Yu Gothic, Meiryo, sans-serif" font-size="25" font-weight="900" fill="#08234b">今すぐ遊ぶ</text>
    <path d="M275 512 l14 9 -14 9z" fill="#08234b"/>
  `);

  const footer = await pngFromSvg(`
    <text x="66" y="594" font-family="Yu Gothic, Meiryo, sans-serif" font-size="14" font-weight="600" fill="#8fdce9" letter-spacing="1">ORIGINAL FICTIONAL GAME / PORTFOLIO WORK</text>
  `);

  const layerDefs = [
    { name: '01_BACKGROUND', children: [
      { name: '01_Key_Art_SmartObject_Source', buffer: art },
      { name: '02_Left_Navy_Gradient', buffer: backgroundTone },
    ]},
    { name: '02_EFFECT', children: [
      { name: '01_Bubbles_and_Sparkles', buffer: bubbles },
    ]},
    { name: '03_TEXT', children: [
      { name: '01_NEW_GAME_Badge', buffer: newGame },
      { name: '02_Title_Logo', buffer: title },
      { name: '03_Sub_Copy', buffer: subtitle },
      { name: '04_Grand_Open_Ribbon', buffer: launch },
      { name: '05_CTA_Button', buffer: cta },
      { name: '06_Portfolio_Footer', buffer: footer },
    ]},
  ];

  const flat = layerDefs.flatMap(g => g.children.map(x => ({ input: x.buffer, blend: 'over' })));
  const composite = await sharp({ create: { width: W, height: H, channels: 4, background: { r:0,g:0,b:0,alpha:0 } } }).composite(flat).png().toBuffer();
  fs.writeFileSync(previewPath, composite);

  const children = layerDefs.map(group => ({
    name: group.name,
    opened: true,
    children: group.children.map(layer => ({ name: layer.name, imageData: imageData(layer.buffer) })),
  }));
  const psd = { width: W, height: H, imageData: imageData(composite), children };
  fs.writeFileSync(psdPath, Buffer.from(writePsd(psd)));

  const verify = readPsd(fs.readFileSync(psdPath), { skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true });
  console.log(JSON.stringify({ psdPath, previewPath, width: verify.width, height: verify.height, groups: verify.children.map(x => ({ name:x.name, layers:(x.children||[]).length })) }, null, 2));
}

main().catch(err => { console.error(err); process.exit(1); });
