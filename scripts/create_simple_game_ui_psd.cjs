const fs = require('fs');
const path = require('path');
const sharp = require('C:/Users/moony/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const agPsdPath = path.resolve(__dirname, '../node_modules/.pnpm/ag-psd@31.0.2/node_modules/ag-psd');
const { readPsd, writePsd, initializeCanvas } = require(agPsdPath);
const makeImageData = (width, height) => ({ width, height, data: new Uint8ClampedArray(width * height * 4) });
initializeCanvas(
  (width, height) => ({ width, height, getContext: () => ({ createImageData: makeImageData }) }),
  makeImageData,
);

const project = path.resolve(__dirname, '..');
const inputPath = path.join(project, 'portfolio-assets', 'photoshop', 'STATUS.psd');
const outputPath = path.join(project, 'portfolio-assets', 'photoshop', 'GAME_UI_SIMPLE.psd');
const previewPath = path.join(project, 'portfolio-assets', 'photoshop', 'GAME_UI_SIMPLE-preview.png');

const esc = value => String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[ch]));

async function imageDataFromSvg(width, height, body) {
  const source = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${body}</svg>`);
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { width: info.width, height: info.height, data: new Uint8ClampedArray(data) };
}

async function rectLayer(name, x, y, width, height, options = {}) {
  const {
    fill = '#061a3a', stroke = '#25d7ed', strokeWidth = 2, radius = 10,
    opacity = 1, shadow = false, gradient = null,
  } = options;
  const pad = shadow ? 8 : Math.ceil(strokeWidth / 2) + 1;
  const defs = gradient ? `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${gradient[0]}"/><stop offset="1" stop-color="${gradient[1]}"/></linearGradient></defs>` : '';
  const shadowSvg = shadow ? `<rect x="${pad + 4}" y="${pad + 5}" width="${width}" height="${height}" rx="${radius}" fill="#000b22" opacity=".72"/>` : '';
  const mainFill = gradient ? 'url(#g)' : fill;
  const body = `${defs}${shadowSvg}<rect x="${pad}" y="${pad}" width="${width}" height="${height}" rx="${radius}" fill="${mainFill}" fill-opacity="${opacity}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
  return { name, left: x - pad, top: y - pad, imageData: await imageDataFromSvg(width + pad * 2 + (shadow ? 5 : 0), height + pad * 2 + (shadow ? 6 : 0), body) };
}

async function shapeLayer(name, x, y, width, height, body) {
  return { name, left: x, top: y, imageData: await imageDataFromSvg(width, height, body) };
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function findTextTemplate(children) {
  for (const child of children || []) {
    if (child.text) return child.text;
    const nested = findTextTemplate(child.children);
    if (nested) return nested;
  }
}

async function textLayer(template, name, text, x, y, options = {}) {
  const {
    fontSize = 22, color = '#f4fbff', weight = 700, fontName = 'NotoSansJP-Bold',
    fontFamily = 'Noto Sans JP, Yu Gothic, Meiryo, sans-serif', tracking = 0,
    width = Math.max(120, Math.ceil([...text].length * fontSize * 1.15)), height = Math.ceil(fontSize * 1.7),
    align = 'left', outline = true,
  } = options;
  const anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
  const tx = align === 'center' ? width / 2 : align === 'right' ? width - 2 : 2;
  const stroke = outline ? 'paint-order="stroke" stroke="#00142f" stroke-width="2" stroke-linejoin="round"' : '';
  const body = `<text x="${tx}" y="${fontSize * 1.25}" text-anchor="${anchor}" font-family="${fontFamily}" font-size="${fontSize}" font-weight="${weight}" letter-spacing="${tracking / 1000 * fontSize}" fill="${color}" ${stroke}>${esc(text)}</text>`;
  const textInfo = clone(template);
  textInfo.text = text;
  textInfo.transform = [1, 0, 0, 1, x, y + fontSize * 1.25];
  textInfo.antiAlias = 'sharp';
  textInfo.style = textInfo.style || {};
  textInfo.style.font = { name: fontName, script: 1, type: 1, synthetic: 0 };
  textInfo.style.fontSize = fontSize;
  textInfo.style.tracking = tracking;
  textInfo.style.kerning = 0;
  const hex = color.replace('#', '');
  textInfo.style.fillColor = { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
  delete textInfo.styleRuns;
  textInfo.bounds = {
    top: { value: -fontSize, units: 'Points' }, left: { value: 0, units: 'Points' },
    right: { value: width, units: 'Points' }, bottom: { value: fontSize * 0.35, units: 'Points' },
  };
  textInfo.boundingBox = clone(textInfo.bounds);
  return { name, left: x, top: y, text: textInfo, imageData: await imageDataFromSvg(width, height, body) };
}

function walk(children, callback) {
  for (const child of children || []) {
    callback(child);
    walk(child.children, callback);
  }
}

function translateLayers(children, dx, dy) {
  walk(children, layer => {
    if (typeof layer.left === 'number') layer.left += dx;
    if (typeof layer.right === 'number') layer.right += dx;
    if (typeof layer.top === 'number') layer.top += dy;
    if (typeof layer.bottom === 'number') layer.bottom += dy;
    if (layer.text && Array.isArray(layer.text.transform)) {
      layer.text.transform[4] += dx;
      layer.text.transform[5] += dy;
    }
  });
}

function collectVisibleLayers(children, parentVisible = true, output = []) {
  for (const child of children || []) {
    const visible = parentVisible && child.hidden !== true;
    if (child.children) collectVisibleLayers(child.children, visible, output);
    else if (visible && child.imageData) output.push(child);
  }
  return output;
}

async function flattenPsd(psd) {
  const canvas = sharp({ create: { width: psd.width, height: psd.height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } });
  const inputs = collectVisibleLayers(psd.children).map(layer => ({
    input: Buffer.from(layer.imageData.data),
    raw: { width: layer.imageData.width, height: layer.imageData.height, channels: 4 },
    left: Math.round(layer.left || 0), top: Math.round(layer.top || 0), blend: 'over',
  })).filter(item => item.left < psd.width && item.top < psd.height && item.left + item.raw.width > 0 && item.top + item.raw.height > 0);
  const { data, info } = await canvas.composite(inputs).png().toBuffer({ resolveWithObject: true });
  fs.writeFileSync(previewPath, data);
  const raw = await sharp(data).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  psd.imageData = { width: raw.info.width, height: raw.info.height, data: new Uint8ClampedArray(raw.data) };
}

async function main() {
  const psd = readPsd(fs.readFileSync(inputPath), { useImageData: true, useRawThumbnail: true });
  const template = findTextTemplate(psd.children);
  if (!template) throw new Error('Editable text template was not found in STATUS.psd');

  // Keep all source groups in the file, but hide advertising-only elements.
  for (const group of psd.children || []) {
    if (group.name === '02_TITLE_LOGO' || group.name === '01_TEXT_AND_UI') group.hidden = true;
  }
  walk(psd.children, layer => {
    if (layer.name === '02_Left_Readability_Gradient') layer.hidden = true;
    if (layer.name === '03-keeper2-female') {
      const height = layer.imageData ? layer.imageData.height : ((layer.bottom || 0) - (layer.top || 0));
      layer.top = 350;
      layer.bottom = 350 + height;
    }
  });

  // Top status bar, kept intentionally compact.
  const topStatus = { name: '05_TOP_STATUS_EDITABLE', opened: true, children: [] };
  topStatus.children.push(await rectLayer('01_Status_Shadow_and_Base', 250, 18, 680, 60, { fill: '#051a39', stroke: '#26d9ed', strokeWidth: 3, radius: 12, shadow: true }));
  topStatus.children.push(await shapeLayer('02_Status_Dividers', 0, 0, psd.width, psd.height, '<path d="M480 28v40M704 28v40" stroke="#1e6284" stroke-width="2"/>'));
  topStatus.children.push(await shapeLayer('03_Status_Icons', 280, 32, 570, 33, `
    <g stroke="#dffaff" stroke-width="2" fill="none"><rect x="0" y="2" width="28" height="26" rx="3"/><path d="M0 10h28M7 0v7M21 0v7"/></g>
    <circle cx="246" cy="15" r="14" fill="#ffbd2e" stroke="#fff0a0" stroke-width="2"/><path d="M240 15h12M246 9v12" stroke="#8c4c00" stroke-width="3"/>
    <path d="M488 1l4 9 10 1-7 7 2 10-9-5-9 5 2-10-7-7 10-1z" fill="#ffd13d" stroke="#fff0a0" stroke-width="2"/>`));
  topStatus.children.push(await textLayer(template, '04_Date_Text_EDITABLE', '3年目  4月2週', 322, 29, { fontSize: 22, width: 150 }));
  topStatus.children.push(await textLayer(template, '05_Money_Text_EDITABLE', '128,500G', 540, 29, { fontSize: 23, width: 135 }));
  topStatus.children.push(await textLayer(template, '06_Popularity_Text_EDITABLE', '人気 742', 800, 29, { fontSize: 23, width: 120 }));

  // Right selected-tank panel.
  const tankPanel = { name: '06_TANK_PANEL_EDITABLE', opened: true, children: [] };
  tankPanel.children.push(await rectLayer('01_Panel_Shadow_and_Base', 895, 104, 276, 454, { fill: '#041a38', stroke: '#26d9ed', strokeWidth: 3, radius: 12, opacity: 0.96, shadow: true }));
  tankPanel.children.push(await rectLayer('02_Header_Base', 913, 121, 240, 58, { gradient: ['#19a7d2', '#087aa9'], stroke: '#57eff7', strokeWidth: 2, radius: 8 }));
  tankPanel.children.push(await rectLayer('03_Close_Button', 1127, 115, 34, 34, { fill: '#09264d', stroke: '#6cf4ff', strokeWidth: 2, radius: 5, shadow: true }));
  tankPanel.children.push(await textLayer(template, '04_Close_Text_EDITABLE', '×', 1133, 115, { fontSize: 27, width: 24, height: 38, align: 'center' }));
  tankPanel.children.push(await textLayer(template, '05_Header_Text_EDITABLE', '大水槽 Lv.3', 928, 133, { fontSize: 25, width: 205, align: 'center' }));
  tankPanel.children.push(await shapeLayer('06_Metric_Icons', 916, 215, 32, 230, `
    <path d="M16 1C12 12 5 18 5 26a11 11 0 0022 0c0-8-7-14-11-25z" fill="#35d9ee" stroke="#dffaff" stroke-width="2"/>
    <path d="M16 87l5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2z" fill="#ffd13d" stroke="#fff0a0" stroke-width="2"/>
    <path d="M2 184c8-9 18-9 27 0-9 9-19 9-27 0zm27 0l7-6v12z" fill="#eefaff" stroke="#77cce0" stroke-width="2"/><circle cx="11" cy="181" r="1.5" fill="#09264d"/>`));
  tankPanel.children.push(await textLayer(template, '07_Clean_Label_EDITABLE', '清潔度', 956, 211, { fontSize: 22, width: 95 }));
  tankPanel.children.push(await textLayer(template, '08_Clean_Value_EDITABLE', '82%', 1080, 211, { fontSize: 22, width: 68, align: 'right' }));
  tankPanel.children.push(await rectLayer('09_Clean_Gauge_Track', 929, 255, 215, 22, { fill: '#001126', stroke: '#6da4b4', strokeWidth: 2, radius: 5 }));
  tankPanel.children.push(await rectLayer('10_Clean_Gauge_Fill', 934, 260, 168, 12, { gradient: ['#6cf4ff', '#22cce5'], stroke: '#9ffaff', strokeWidth: 1, radius: 3 }));
  tankPanel.children.push(await textLayer(template, '11_Appeal_Label_EDITABLE', '魅力度', 956, 315, { fontSize: 22, width: 95 }));
  tankPanel.children.push(await textLayer(template, '12_Appeal_Value_EDITABLE', '74%', 1080, 315, { fontSize: 22, width: 68, align: 'right' }));
  tankPanel.children.push(await rectLayer('13_Appeal_Gauge_Track', 929, 359, 215, 22, { fill: '#001126', stroke: '#6da4b4', strokeWidth: 2, radius: 5 }));
  tankPanel.children.push(await rectLayer('14_Appeal_Gauge_Fill', 934, 364, 151, 12, { gradient: ['#ffe66a', '#ffc32c'], stroke: '#fff0a0', strokeWidth: 1, radius: 3 }));
  tankPanel.children.push(await textLayer(template, '15_Count_Label_EDITABLE', '飼育数', 956, 414, { fontSize: 22, width: 95 }));
  tankPanel.children.push(await textLayer(template, '16_Count_Value_EDITABLE', '12/20', 1065, 414, { fontSize: 22, width: 83, align: 'right' }));
  tankPanel.children.push(await rectLayer('17_Upgrade_Button_Base', 927, 482, 212, 54, { gradient: ['#ffe978', '#ffc83a'], stroke: '#fff0a0', strokeWidth: 2, radius: 9, shadow: true }));
  tankPanel.children.push(await shapeLayer('18_Hammer_Icon', 946, 495, 40, 34, '<path d="M5 28l15-15 5 5-15 15z" fill="#78451e" stroke="#3c230e" stroke-width="2"/><path d="M16 5h18v10H16z" transform="rotate(35 25 10)" fill="#a86a30" stroke="#3c230e" stroke-width="2"/>'));
  tankPanel.children.push(await textLayer(template, '19_Upgrade_Text_EDITABLE', '強化する', 984, 492, { fontSize: 25, color: '#432800', width: 130, align: 'center', outline: false, fontName: 'RoundedMplus1c-Black', fontFamily: 'M PLUS Rounded 1c, Noto Sans JP, sans-serif', weight: 900 }));

  // STATUS.psd was composed with open space on the left. Put the UI there so the
  // dolphin and both keepers remain readable, making the result feel like a new screen.
  translateLayers(tankPanel.children, -850, 0);

  psd.children.push(topStatus, tankPanel);
  await flattenPsd(psd);
  fs.writeFileSync(outputPath, Buffer.from(writePsd(psd, { invalidateTextLayers: false })));

  const check = readPsd(fs.readFileSync(outputPath), { skipLayerImageData: true, skipCompositeImageData: true, skipThumbnail: true });
  const summarize = children => (children || []).map(child => ({ name: child.name, hidden: child.hidden === true, layers: child.children ? child.children.length : undefined }));
  console.log(JSON.stringify({
    outputPath, previewPath, width: check.width, height: check.height,
    rootGroups: summarize(check.children),
    editableTextLayers: (() => { let count = 0; walk(check.children, layer => { if (layer.text) count++; }); return count; })(),
  }, null, 2));
}

main().catch(error => { console.error(error); process.exit(1); });
