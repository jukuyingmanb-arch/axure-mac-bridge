// 右侧需求说明面板
// 适合"左 UI 图 + 右说明文案"的设计稿排版
//
// sections 格式：
//   [
//     { heading: '功能目标', items: ['一段描述'] },
//     { heading: '页面元素', items: ['• 顶栏 ...', '• 内容 ...'] },
//     { heading: '字段', items: ['- field1', '- field2'] },  // - 开头 = 二级缩进
//   ]

import { txt, txtBlock, rect, colors as C } from './primitives.mjs';
import { PHONE_H } from './phone.mjs';

export const SPEC_W_DEFAULT = 480;

/**
 * 渲染一个 spec panel
 * @param ox       面板左上 x
 * @param oy       面板左上 y
 * @param pageNum  顶部小编号（如 1 → "P1"）
 * @param title    页面标题
 * @param sections 需求段
 * @param opts     { specW, height }
 */
export function specPanel(ox, oy, pageNum, title, sections, opts = {}) {
  const SPEC_W = opts.specW ?? SPEC_W_DEFAULT;
  const height = opts.height ?? PHONE_H;

  const lines = [];
  lines.push(`<g transform="translate(${ox}, ${oy})">`);
  // 卡片
  lines.push(`  <rect width="${SPEC_W}" height="${height}" fill="${C.card}" rx="12"/>`);
  // 顶部编号 + 标题
  lines.push(`  ${txt(24, 28, `P${pageNum}`, { size: 11, weight: 700, fill: C.primary })}`);
  lines.push(`  ${txt(50, 28, '·', { size: 11, fill: C.light })}`);
  lines.push(`  ${txt(62, 28, title, { size: 18, weight: 700, fill: C.navy })}`);
  // 分割线
  lines.push(`  ${rect(24, 64, SPEC_W - 48, 1, C.border)}`);

  // 段落游标
  let cursorY = 88;

  for (const sec of sections) {
    // 小段标题
    lines.push(`  ${txt(24, cursorY, sec.heading, { size: 13, weight: 700, fill: C.primary })}`);
    cursorY += 24;

    // 段内容
    for (const line of sec.items) {
      if (line.startsWith('•')) {
        // 项目符号（一级）
        lines.push(`  ${txt(24, cursorY + 3, '•', { size: 12, fill: C.primary })}`);
        const block = txtBlock(40, cursorY, line.slice(1).trim(), {
          size: 13,
          fill: C.navy,
          maxWidth: SPEC_W - 72,
        });
        lines.push('  ' + block.svg);
        cursorY += block.height + 6;
      } else if (line.startsWith('-')) {
        // 二级缩进（小点）
        lines.push(`  ${txt(48, cursorY + 3, '·', { size: 12, fill: C.light })}`);
        const block = txtBlock(60, cursorY, line.slice(1).trim(), {
          size: 12,
          fill: C.gray,
          maxWidth: SPEC_W - 92,
        });
        lines.push('  ' + block.svg);
        cursorY += block.height + 4;
      } else {
        // 纯文本段
        const block = txtBlock(24, cursorY, line, {
          size: 13,
          fill: C.navy,
          maxWidth: SPEC_W - 48,
        });
        lines.push('  ' + block.svg);
        cursorY += block.height + 6;
      }
    }
    cursorY += 16; // 段间距
  }

  lines.push(`</g>`);
  return lines.join('\n');
}
