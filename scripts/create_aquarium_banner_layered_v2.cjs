const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/moony/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const { writePsd, readPsd } = require('C:/Users/moony/Claude/Projects/unipaws_lp/node_modules/ag-psd');
const { PNG } = require('C:/Users/moony/Claude/Projects/unipaws_lp/node_modules/pngjs');

const W = 1200, H = 628;
const project = path.resolve(__dirname, '..');
const assetRoot = path.join(project, 'portfolio-assets', 'photoshop', 'banner-source-assets');
const outRoot = path.join(project, 'portfolio-assets', 'photoshop');
const attached = {
  logo: 'C:/Users/moony/AppData/Local/Temp/codex-clipboard-4ae6668d-074f-4cbf-b01e-cba1cf106eb1.png',
  keeper: 'C:/Users/moony/AppData/Local/Temp/codex-clipboard-e8953774-a122-4d18-91c4-d7157f972c95.png',
  dolphin: 'C:/Users/moony/AppData/Local/Temp/codex-clipboard-77fac490-91ed-4a92-93d6-9db669dca4fd.png',
  background: path.join(assetRoot, '01-aquarium-background-three-tanks-fish-fixed-v5.png'),
};

const icon = name => path.join(assetRoot, 'mini-icons', name);
const escapeXml = s => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
const svg = body => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`);
const svgPng = body => sharp(svg(body)).png().toBuffer();
const toImageData = buffer => { const p = PNG.sync.read(buffer); return { width:p.width, height:p.height, data:new Uint8ClampedArray(p.data) }; };

async function removeMagenta(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject:true });
  for (let i=0; i<data.length; i+=4) {
    const r=data[i], g=data[i+1], b=data[i+2];
    if (r > 205 && b > 145 && g < 115 && r > g*2.1 && b > g*1.7) data[i+3]=0;
  }
  return sharp(data, { raw:info }).png().toBuffer();
}

async function place(input, width, height, left, top, fit='contain') {
  const resized = await sharp(input).resize(width, height, { fit, kernel:'nearest', background:{r:0,g:0,b:0,alpha:0} }).png().toBuffer();
  return sharp({ create:{ width:W, height:H, channels:4, background:{r:0,g:0,b:0,alpha:0} } })
    .composite([{ input:resized, left, top }]).png().toBuffer();
}

async function main() {
  fs.mkdirSync(outRoot, { recursive:true });
  for (const [key,file] of Object.entries(attached)) if (!fs.existsSync(file)) throw new Error(`Missing ${key}: ${file}`);

  const bg = await sharp(attached.background).resize(W,H,{fit:'cover',position:'centre',kernel:'nearest'}).png().toBuffer();
  const logoCut = await removeMagenta(attached.logo);
  const keeperCut = await removeMagenta(attached.keeper);
  const dolphinCut = await removeMagenta(attached.dolphin);

  const logo = await place(logoCut, 500, 330, 42, 55);
  const keeper = await place(keeperCut, 205, 205, 950, 383);
  const dolphin = await place(dolphinCut, 250, 250, 785, 88);

  const leftShade = await svgPng(`
    <defs><linearGradient id="g"><stop stop-color="#020a21" stop-opacity=".78"/><stop offset=".73" stop-color="#061632" stop-opacity=".25"/><stop offset="1" stop-color="#061632" stop-opacity="0"/></linearGradient></defs>
    <rect width="650" height="628" fill="url(#g)"/>
  `);

  const copy = await svgPng(`
    <text x="67" y="402" font-family="Yu Gothic, Meiryo, sans-serif" font-size="22" font-weight="700" fill="#d9fbff">小さな水族館を、人気スポットに育てよう。</text>
  `);
  const badge = await svgPng(`
    <rect x="65" y="36" width="154" height="35" rx="17" fill="#20d6e6"/>
    <text x="142" y="60" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" font-weight="900" letter-spacing="2" fill="#07182f">NEW GAME</text>
  `);
  const ribbon = await svgPng(`
    <path d="M50 442 L468 442 L496 476 L468 510 L50 510 L75 476 Z" fill="#582513" opacity=".58" transform="translate(5 6)"/>
    <path d="M50 436 L468 436 L496 470 L468 504 L50 504 L75 470 Z" fill="#ffc13c"/>
    <text x="274" y="482" text-anchor="middle" font-family="Yu Gothic, Meiryo, sans-serif" font-size="29" font-weight="900" fill="#392009">本日グランドオープン！</text>
  `);
  const cta = await svgPng(`
    <rect x="65" y="535" width="218" height="56" rx="12" fill="#031a37" opacity=".55" transform="translate(5 6)"/>
    <rect x="65" y="535" width="218" height="56" rx="12" fill="#ffdc45" stroke="#fff4a3" stroke-width="3"/>
    <text x="164" y="571" text-anchor="middle" font-family="Yu Gothic, Meiryo, sans-serif" font-size="23" font-weight="900" fill="#08234b">今すぐ遊ぶ</text>
    <path d="M248 553 l13 10 -13 10z" fill="#08234b"/>
  `);

  const coral = await place(await removeMagenta(icon('01-coral.png')), 58,58, 1110,548);
  const starfish = await place(await removeMagenta(icon('02-starfish.png')), 52,52, 720,458);
  const shell = await place(await removeMagenta(icon('03-shell.png')), 42,42, 1118,52);
  const fish = await place(await removeMagenta(icon('04-tropical-fish.png')), 50,50, 730,386);
  const bubbles = await place(await removeMagenta(icon('05-bubbles.png')), 82,82, 690,92);
  const sparkles = await place(await removeMagenta(icon('06-sparkles.png')), 70,70, 1040,325);

  const layerGroups = [
    { name:'01_BACKGROUND', children:[
      {name:'01_Aquarium_Background_Attached', buffer:bg},
      {name:'02_Left_Readability_Gradient', buffer:leftShade},
    ]},
    { name:'02_CHARACTERS', children:[
      {name:'01_Dolphin_Attached_Masked', buffer:dolphin},
      {name:'02_Keeper_Attached_Masked', buffer:keeper},
    ]},
    { name:'03_TITLE_LOGO', children:[
      {name:'01_Koyomirium_Title_Attached_Masked', buffer:logo},
    ]},
    { name:'04_MINI_ICONS', children:[
      {name:'01_Bubbles', buffer:bubbles}, {name:'02_Tropical_Fish', buffer:fish},
      {name:'03_Starfish', buffer:starfish}, {name:'04_Sparkles', buffer:sparkles},
      {name:'05_Shell', buffer:shell}, {name:'06_Coral', buffer:coral},
    ]},
    { name:'05_TEXT_AND_UI', children:[
      {name:'01_NEW_GAME_Badge', buffer:badge}, {name:'02_Sub_Copy', buffer:copy},
      {name:'03_Grand_Open_Ribbon', buffer:ribbon}, {name:'04_CTA_Button', buffer:cta},
    ]},
  ];

  const ordered = layerGroups.flatMap(g=>g.children.map(l=>({input:l.buffer,blend:'over'})));
  const composite = await sharp({create:{width:W,height:H,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite(ordered).png().toBuffer();
  const preview = path.join(outRoot,'aquarium-release-banner-layered-v6-fish-fixed-preview.png');
  const psdFile = path.join(outRoot,'aquarium-release-banner-layered-v6-fish-fixed.psd');
  fs.writeFileSync(preview, composite);
  const psd = {width:W,height:H,imageData:toImageData(composite),children:layerGroups.map(g=>({name:g.name,opened:true,children:g.children.map(l=>({name:l.name,imageData:toImageData(l.buffer)}))}))};
  fs.writeFileSync(psdFile, Buffer.from(writePsd(psd)));
  const check=readPsd(fs.readFileSync(psdFile),{skipLayerImageData:true,skipCompositeImageData:true,skipThumbnail:true});
  console.log(JSON.stringify({psdFile,preview,width:check.width,height:check.height,groups:check.children.map(g=>({name:g.name,layers:g.children.length}))},null,2));
}

main().catch(e=>{console.error(e);process.exit(1)});
