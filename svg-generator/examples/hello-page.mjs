// 入门例子：最简单的单页原型
// 比 feedback-page.mjs 简单很多，新人照着这个改最快。
//
// 运行：
//   cd svg-generator
//   node examples/hello-page.mjs
//   → 输出 ~/Desktop/原型/hello-page.svg
//
// 然后：
//   open -a "$HOME/Library/Application Support/axure-bridge/AxureBridge.app" \
//        --args "$HOME/Desktop/原型/hello-page.svg"
//   再把文件拖到 Axure。

import { writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { txt, rect, colors as C, svgHeader, svgFooter } from '../lib/primitives.mjs';
import { PHONE_W, PHONE_H, phoneFrame, statusBar, navBar, homeIndicator, pill } from '../lib/phone.mjs';

// ----------------------------------------------------------------------
// 1. 算画布尺寸：一个手机 + 四周留白
// ----------------------------------------------------------------------
const PAD = 60;
const TOTAL_W = PHONE_W + PAD * 2;
const TOTAL_H = PHONE_H + PAD * 2;

const out = [];
const push = (s) => out.push(s);

// ----------------------------------------------------------------------
// 2. SVG 头 + 背景
// ----------------------------------------------------------------------
push(svgHeader(TOTAL_W, TOTAL_H));
push(`<rect width="100%" height="100%" fill="${C.canvas}"/>`);

// ----------------------------------------------------------------------
// 3. 画一个手机页面
// ----------------------------------------------------------------------
const frame = phoneFrame(PAD, PAD, 'Hello Page');
push(frame.begin);

// 状态栏 + 导航栏（lib 帮你画好了）
push(statusBar());
push(navBar('个人中心'));

// 一句标题（注意：始终用 txt()，不要直接写 <text>）
push(`  ${txt(24, 130, '你好，新同学 👋', { size: 22, weight: 700, fill: C.navy })}`);
push(`  ${txt(24, 168, '这是用代码生成的第一个原型页面', { size: 14, fill: C.gray })}`);

// 一个头像圆 + 名字
push(`  <circle cx="56" cy="240" r="32" fill="${C.primaryBg}"/>`);
push(`  ${txt(56, 230, 'A', { size: 24, weight: 700, fill: C.primary, anchor: 'middle' })}`);
push(`  ${txt(104, 224, '张三', { size: 16, weight: 700, fill: C.navy })}`);
push(`  ${txt(104, 250, '产品经理', { size: 13, fill: C.light })}`);

// 三个设置项（列表行）
const rows = ['账号设置', '通知偏好', '关于我们'];
let y = 320;
for (const label of rows) {
  push(`  ${rect(16, y, 343, 56, C.card, { stroke: C.border, rx: 10 })}`);
  push(`  ${txt(28, y + 19, label, { size: 15, fill: C.navy })}`);
  // 右侧箭头
  push(`  <path d="M 336 ${y + 22} L 342 ${y + 28} L 336 ${y + 34}" stroke="${C.light}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  y += 68;
}

// 一个主按钮
push(`  ${rect(16, 728, 343, 48, C.primary, { rx: 8 })}`);
push(`  ${txt(PHONE_W / 2, 744, '退出登录', { size: 15, weight: 700, fill: C.white, anchor: 'middle' })}`);

// Home indicator
push(homeIndicator());
push(frame.end);

// ----------------------------------------------------------------------
// 4. 收尾 + 写文件
// ----------------------------------------------------------------------
push(svgFooter);

const svg = out.join('\n');
const PROTO_DIR = `${homedir()}/Desktop/原型`;
mkdirSync(PROTO_DIR, { recursive: true });
const outPath = `${PROTO_DIR}/hello-page.svg`;
writeFileSync(outPath, svg, 'utf8');

console.log('✅ Wrote SVG:', outPath);
console.log('   Dimensions:', TOTAL_W, 'x', TOTAL_H);
console.log();
console.log('预览：  open -a Safari', outPath);
console.log('导入：  open -a "$HOME/Library/Application Support/axure-bridge/AxureBridge.app" --args', JSON.stringify(outPath));
console.log('       然后把文件从访达拖到 Axure 画布');
