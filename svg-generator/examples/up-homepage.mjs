// 例子：UP 主个人主页（移动端，含 视频 / 图片 / 粉丝 / 关注）
// 左 UI 图 + 右需求说明
//
// 运行：
//   cd svg-generator
//   node examples/up-homepage.mjs
//   → ~/Desktop/原型/up-homepage.svg

import { writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { txt, rect, colors as C, svgHeader, svgFooter, measureText } from '../lib/primitives.mjs';
import { PHONE_W, PHONE_H, phoneFrame, statusBar, homeIndicator, pill } from '../lib/phone.mjs';
import { specPanel } from '../lib/spec-panel.mjs';

// ---------- 布局 ----------
const PAD_X = 48;
const PAD_TOP = 72;
const GUTTER = 56;
const SPEC_W = 480;
const TOTAL_W = PAD_X * 2 + PHONE_W + GUTTER + SPEC_W;
const TOTAL_H = PAD_TOP + PHONE_H + 60;

const out = [];
const push = (s) => out.push(s);

push(svgHeader(TOTAL_W, TOTAL_H));
push(`<rect width="100%" height="100%" fill="${C.canvas}"/>`);

// 文档标题
push(txt(PAD_X, 24, 'UP 主个人主页 · 移动端', { size: 18, weight: 700, fill: C.navy }));
push(txt(PAD_X, 48, '左：UI 设计　右：需求说明　·　375×812　·　含 视频 / 图片 / 粉丝 / 关注', { size: 12, fill: C.gray }));

// ---------- 手机页 ----------
const ox = PAD_X;
const oy = PAD_TOP;
const frame = phoneFrame(ox, oy, 'UP 主主页');
push(frame.begin);
push(statusBar());

// === Banner 头图（深蓝纯色 + 顶部一条更深的渐变感叠层）===
push(`  ${rect(0, 44, PHONE_W, 120, '#2563EB')}`);
push(`  ${rect(0, 44, PHONE_W, 120, '#1E3A8A', { /* 叠一层做层次 */ })}`.replace('fill="#1E3A8A"', 'fill="#1E3A8A" opacity="0.25"'));
// banner 上的返回箭头（白）
push(`  <path d="M 24 78 L 16 86 L 24 94" stroke="${C.white}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
// banner 右上 更多 "..."
push(`  <circle cx="${PHONE_W - 52}" cy="86" r="2" fill="${C.white}"/>`);
push(`  <circle cx="${PHONE_W - 44}" cy="86" r="2" fill="${C.white}"/>`);
push(`  <circle cx="${PHONE_W - 36}" cy="86" r="2" fill="${C.white}"/>`);

// === 头像（白边圆形，骑在 banner 下沿）===
const avCx = 58, avCy = 164, avR = 36;
push(`  <circle cx="${avCx}" cy="${avCy}" r="${avR + 3}" fill="${C.white}"/>`);
push(`  <circle cx="${avCx}" cy="${avCy}" r="${avR}" fill="${C.primaryBg}"/>`);
push(`  ${txt(avCx, avCy - 13, '阿', { size: 26, weight: 700, fill: C.primary, anchor: 'middle' })}`);

// === 昵称 + 认证 ===
push(`  ${txt(16, 210, '阿星说科技', { size: 20, weight: 700, fill: C.navy })}`);
// 认证小勾（蓝圆 + 白勾）
const nameW = measureText('阿星说科技', 20);
const badgeX = 16 + nameW + 10;
push(`  <circle cx="${badgeX + 9}" cy="222" r="9" fill="${C.primary}"/>`);
push(`  <path d="M ${badgeX + 5} 222 L ${badgeX + 8} 225 L ${badgeX + 13} 219" stroke="${C.white}" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);

// 等级 pill + UID
push(`  ${pill(16, 238, 44, 20, '#FB7185')}`);
push(`  ${txt(38, 242, 'LV6', { size: 11, weight: 700, fill: C.white, anchor: 'middle' })}`);
push(`  ${txt(70, 240, 'UID: 1024388', { size: 12, fill: C.light })}`);

// 签名
push(`  ${txt(16, 268, '签名：分享数码好物与科技资讯，每周三更新～', { size: 13, fill: C.gray })}`);

// === 数据栏：关注 / 粉丝 / 获赞 ===
const stats = [
  { num: '286', label: '关注' },
  { num: '45.6万', label: '粉丝' },
  { num: '892.3万', label: '获赞' },
];
const colW = 343 / 3;
stats.forEach((s, i) => {
  const cxc = 16 + colW * i + colW / 2;
  push(`  ${txt(cxc, 300, s.num, { size: 18, weight: 700, fill: C.navy, anchor: 'middle' })}`);
  push(`  ${txt(cxc, 326, s.label, { size: 12, fill: C.light, anchor: 'middle' })}`);
});

// === 操作按钮：关注 + 私信 ===
push(`  ${rect(16, 356, 236, 40, C.primary, { rx: 20 })}`);
push(`  ${txt(16 + 118, 367, '+ 关注', { size: 15, weight: 700, fill: C.white, anchor: 'middle' })}`);
push(`  ${rect(262, 356, 97, 40, C.card, { stroke: C.border, rx: 20 })}`);
push(`  ${txt(262 + 48, 367, '私信', { size: 15, weight: 500, fill: C.gray, anchor: 'middle' })}`);

// === Tab 栏：视频 / 图片 / 动态 ===
push(`  ${rect(0, 416, PHONE_W, 44, C.card, { stroke: C.border })}`);
const tabs = ['视频', '图片', '动态'];
tabs.forEach((t, i) => {
  const cxc = colW * i + colW / 2 + 16 - 16; // 三等分
  const tx = PHONE_W / 3 * i + PHONE_W / 6;
  const active = i === 0;
  push(`  ${txt(tx, 430, t, { size: 14, weight: active ? 700 : 400, fill: active ? C.primary : C.gray, anchor: 'middle' })}`);
});
push(`  ${rect(PHONE_W / 6 - 16, 454, 32, 3, C.primary, { rx: 2 })}`);

// === 视频卡片 ×2（封面图 + 标题 + 播放数据）===
function videoCard(y, title1, title2, play, danmu, dur) {
  // 封面 128×72
  push(`  ${rect(16, y, 128, 72, '#374151', { rx: 6 })}`);
  // 播放三角
  push(`  <circle cx="${16 + 64}" cy="${y + 36}" r="14" fill="#000" opacity="0.35"/>`);
  push(`  <path d="M ${16 + 60} ${y + 29} L ${16 + 60} ${y + 43} L ${16 + 72} ${y + 36} Z" fill="${C.white}"/>`);
  // 时长（右下角黑底）
  push(`  ${rect(16 + 128 - 42, y + 72 - 18, 38, 14, '#000', { rx: 3 })}`.replace('fill="#000"', 'fill="#000" opacity="0.6"'));
  push(`  ${txt(16 + 128 - 42 + 19, y + 72 - 16, dur, { size: 10, fill: C.white, anchor: 'middle' })}`);
  // 标题 2 行
  push(`  ${txt(156, y + 2, title1, { size: 14, weight: 500, fill: C.navy })}`);
  push(`  ${txt(156, y + 24, title2, { size: 14, weight: 500, fill: C.navy })}`);
  // 播放数据
  push(`  ${txt(156, y + 54, `▶ ${play}　💬 ${danmu}`, { size: 11, fill: C.light })}`);
}
videoCard(476, '2024 旗舰手机横评：拍照', '到底谁是真王者？', '12.3万', '1024', '10:24');
videoCard(564, '百元蓝牙耳机还能这么卷', '？实测 5 款给你答案', '8.7万', '536', '08:15');

// === TA 的图片（九宫格预览 3 张 + 查看全部）===
push(`  ${txt(16, 656, 'TA 的图片', { size: 14, weight: 700, fill: C.navy })}`);
push(`  ${txt(PHONE_W - 16, 658, '查看全部 ›', { size: 12, fill: C.light, anchor: 'end' })}`);
for (let i = 0; i < 3; i++) {
  const ix = 16 + i * 113;
  push(`  ${rect(ix, 680, 105, 105, C.inputBg, { stroke: C.border, rx: 6 })}`);
  // 山+太阳图片占位
  push(`  <g transform="translate(${ix + 18}, ${680 + 30})" stroke="${C.light}" stroke-width="1.5" fill="none">`);
  push(`    <circle cx="50" cy="10" r="6" fill="${C.light}" stroke="none"/>`);
  push(`    <path d="M 0 45 L 22 20 L 40 38 L 60 16 L 70 26 L 70 45 Z" fill="${C.light}" stroke="none"/>`);
  push(`  </g>`);
}

push(homeIndicator());
push(frame.end);

// ---------- 右侧需求说明 ----------
const specX = PAD_X + PHONE_W + GUTTER;
push(specPanel(specX, oy, 1, 'UP 主个人主页', [
  {
    heading: '功能目标',
    items: ['集中展示 UP 主的身份、影响力数据与内容作品，承接粉丝的关注、浏览、私信等核心行为。'],
  },
  {
    heading: '页面元素',
    items: [
      '• 头图 Banner：可点击更换，叠加返回 / 更多按钮',
      '• 头像：圆形带认证标识（蓝勾），骑在 Banner 下沿',
      '• 昵称 + 认证 + 等级（LV）+ UID',
      '• 个性签名：单行截断，点击展开',
      '• 数据栏：关注数 / 粉丝数 / 获赞数（万级缩写）',
      '• 操作区：关注（主按钮）+ 私信（次按钮）',
      '• Tab：视频 / 图片 / 动态（默认视频）',
      '• 视频卡片：封面 + 时长 + 标题 + 播放量 + 弹幕数',
      '• 图片区：九宫格缩略 + 查看全部入口',
    ],
  },
  {
    heading: '关键交互',
    items: [
      '• 点关注 → 按钮变"已关注"，粉丝数 +1',
      '• 点私信 → 进入与 UP 主的会话页',
      '• 点视频卡片 → 进播放页',
      '• 点图片缩略 → 全屏图片浏览，左右滑切换',
      '• Tab 切换 → 内容区切换，不刷新头部',
      '• 数字达千/万自动缩写（45.6万 / 892.3万）',
    ],
  },
  {
    heading: '字段 & 数据',
    items: [
      '- up_id：UP 主唯一标识',
      '- nickname / avatar / banner / signature',
      '- level：1-6，决定等级 pill 颜色',
      '- verified：是否认证（控制蓝勾显隐）',
      '- following_count / follower_count / like_count',
      '- is_followed：当前用户是否已关注（控制按钮态）',
    ],
  },
  {
    heading: '空状态 & 异常',
    items: [
      '• 无视频：视频 Tab 显示"还没有投稿"',
      '• 无图片：隐藏图片区或显示占位',
      '• 看自己主页：关注/私信替换为"编辑资料"',
    ],
  },
]));

push(svgFooter);

// ---------- 写文件 ----------
const svg = out.join('\n');
const PROTO_DIR = `${homedir()}/Desktop/原型`;
mkdirSync(PROTO_DIR, { recursive: true });
const outPath = `${PROTO_DIR}/up-homepage.svg`;
writeFileSync(outPath, svg, 'utf8');

console.log('✅ Wrote SVG:', outPath);
console.log('   Dimensions:', TOTAL_W, 'x', TOTAL_H);
console.log('   Chars:', svg.length);
