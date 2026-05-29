// 移动端 mockup 组件：iPhone 状态栏 / 导航栏 / Home Indicator
// 标准尺寸 375×812（iPhone X 系列逻辑像素）

import { txt, rect, colors as C } from './primitives.mjs';

export const PHONE_W = 375;
export const PHONE_H = 812;

/**
 * 手机外框 + 阴影 + 顶部 label
 * 返回 { begin, end }，调用方在 begin 和 end 之间添加内部元素
 */
export function phoneFrame(ox, oy, label) {
  const lines = [];
  lines.push(`<g transform="translate(${ox}, ${oy})">`);
  // 阴影
  lines.push(`  <rect x="-1" y="4" width="${PHONE_W + 2}" height="${PHONE_H + 2}" fill="#000" opacity="0.06"/>`);
  // 卡片本体
  lines.push(`  <rect width="${PHONE_W}" height="${PHONE_H}" fill="${C.card}"/>`);
  // 顶部 PAGE 标签
  if (label) {
    lines.push(`  ${txt(0, -28, label, { size: 11, weight: 600, fill: C.light })}`);
  }
  return {
    begin: lines.join('\n'),
    end: '</g>',
  };
}

/**
 * 状态栏：9:41 + 信号 + 电池
 */
export function statusBar() {
  return [
    `  ${rect(0, 0, PHONE_W, 44, C.status)}`,
    `  ${txt(16, 15, '9:41', { size: 13, weight: 600, fill: C.navy })}`,
    `  <g transform="translate(${PHONE_W - 80}, 16)" fill="${C.navy}">`,
    `    <rect x="0" y="6" width="2" height="6"/><rect x="3" y="4" width="2" height="8"/><rect x="6" y="2" width="2" height="10"/><rect x="9" y="0" width="2" height="12"/>`,
    `    <rect x="22" y="2" width="20" height="10" rx="2" fill="none" stroke="${C.navy}"/>`,
    `    <rect x="24" y="4" width="14" height="6"/>`,
    `  </g>`,
  ].join('\n');
}

/**
 * 导航栏：返回箭头 + 居中标题 + 可选右侧按钮文本
 */
export function navBar(title, rightLabel = null) {
  const lines = [];
  lines.push(`  ${rect(0, 44, PHONE_W, 52, C.card, { stroke: C.border })}`);
  lines.push(`  <path d="M 22 62 L 14 70 L 22 78" stroke="${C.navy}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  lines.push(`  ${txt(PHONE_W / 2, 62, title, { size: 16, weight: 700, fill: C.navy, anchor: 'middle' })}`);
  if (rightLabel) {
    lines.push(`  ${txt(PHONE_W - 16, 66, rightLabel, { size: 13, fill: C.primary, anchor: 'end' })}`);
  }
  return lines.join('\n');
}

/**
 * Home Indicator（屏幕底部小条）
 */
export function homeIndicator() {
  return `  ${rect(PHONE_W / 2 - 67, 798, 134, 5, C.navy, { rx: 3 })}`;
}

/**
 * 圆角 pill 标签（用于 tag、chip）
 */
export function pill(x, y, w, h, fill, opts = {}) {
  return rect(x, y, w, h, fill, { ...opts, rx: Math.round(h / 2) });
}
