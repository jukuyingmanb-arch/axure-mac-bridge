// SVG 基础原语 — 所有产物必须遵守 Axure for Mac 的 SVG 解析器约束
//
// 关键约束（见 docs/04-Axure-SVG-怪癖.md）：
//   1. <text> 元素必须用 <g transform="translate(x, y)"> 包裹，否则 Axure 吃掉 y 坐标
//   2. text-anchor="middle" / "end" 被 Axure 忽略，必须用 measureText() 手算偏移
//   3. baseline 偏移：text 内 x=0 y=0，外层 translate y = top + size × 0.8

export function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * 颜色护栏 — 把 Axure for Mac 解析器拒绝的「带 alpha 的 hex」拆成它能接受的形式（返回带前导空格的属性串）。
 * Axure 只认 6 位 #RRGGBB；带透明度的 8 位 / 4 位 hex 会让整份 SVG 导入失败（Invalid color）。
 *   #RRGGBBAA → name="#RRGGBB" name-opacity="a"   （拆出透明度，视觉保真）
 *   #RGBA     → name="#RRGGBB" name-opacity="a"
 *   #RGB / #RRGGBB / none / 命名色 → 原样输出（不确证有问题的不擅改，避免误伤现有调用）
 * @param name  属性名，'fill' 或 'stroke'
 * @param value 颜色值
 */
export function colorAttr(name, value) {
  if (value == null || value === '') return '';
  const v = String(value).trim();
  const m = /^#([0-9a-fA-F]+)$/.exec(v);
  if (!m) return ` ${name}="${v}"`;                 // none / 命名色 / 非 hex，原样
  const h = m[1];
  // 只处理确证被 Axure 拒绝的「带 alpha 的 hex」：8 位 #RRGGBBAA、4 位 #RGBA
  if (h.length === 8 || h.length === 4) {
    const rgb = h.length === 8 ? h.slice(0, 6) : h.slice(0, 3).replace(/./g, c => c + c);
    const aHex = h.length === 8 ? h.slice(6, 8) : h[3] + h[3];
    const a = parseInt(aHex, 16) / 255;
    const op = a < 1 ? ` ${name}-opacity="${+a.toFixed(3)}"` : '';
    return ` ${name}="#${rgb.toUpperCase()}"${op}`;
  }
  return ` ${name}="${v}"`;                          // 3 位 / 6 位 / 其它，原样
}

/**
 * 估算文字渲染宽度（用于手算 anchor 偏移）
 * 系数基于 Inter / PingFang SC 在 Axure for Mac 默认字体设置下的实测
 */
export function measureText(s, size) {
  let w = 0;
  for (const ch of String(s)) {
    if (/[一-鿿　-〿＀-￯]/.test(ch)) w += size * 1.0;       // CJK
    else if (/[A-Z]/.test(ch)) w += size * 0.62;             // 大写
    else if (/[a-z0-9]/.test(ch)) w += size * 0.55;          // 小写/数字
    else if (ch === ' ') w += size * 0.3;
    else w += size * 0.5;                                     // 标点等
  }
  return w;
}

/**
 * 文字（Axure 友好版）
 * @param x     anchor=start 时 = 左边；middle 时 = 中心 x；end 时 = 右边
 * @param top   文字"视觉顶边"的 y 坐标（不是基线！）
 * @param str   文字内容
 * @param opts  { size, weight, fill, anchor: 'start' | 'middle' | 'end' }
 */
export function txt(x, top, str, opts = {}) {
  const size = opts.size ?? 14;
  const anchor = opts.anchor ?? 'start';
  const measuredW = measureText(str, size);

  let leftX;
  if (anchor === 'middle') leftX = x - measuredW / 2;
  else if (anchor === 'end') leftX = x - measuredW;
  else leftX = x;

  // baseline = visual top + ascender height (≈ 0.8 × fontSize for 系统字)
  const translateY = top + Math.round(size * 0.8);

  const fill = colorAttr('fill', opts.fill);
  const weight = opts.weight ? ` font-weight="${opts.weight}"` : '';

  return `<g transform="translate(${leftX}, ${translateY})"><text x="0" y="0" font-size="${size}"${fill}${weight}>${escapeXml(str)}</text></g>`;
}

/**
 * 多行文字：按字符宽度自动断行
 * @returns { svg, height } — height 用于计算下一段的 cursor
 */
export function txtBlock(x, top, str, opts = {}) {
  const size = opts.size ?? 13;
  const maxW = opts.maxWidth ?? 480;
  const lineHeight = opts.lineHeight ?? Math.round(size * 1.6);

  const lines = [];
  let cur = '';
  let curW = 0;
  for (const ch of String(str)) {
    const chW = measureText(ch, size);
    if (curW + chW > maxW && cur.length > 0) {
      lines.push(cur);
      cur = ch;
      curW = chW;
    } else {
      cur += ch;
      curW += chW;
    }
  }
  if (cur) lines.push(cur);

  const svgs = lines.map((line, i) => txt(x, top + i * lineHeight, line, opts));
  return { svg: svgs.join('\n'), height: lines.length * lineHeight };
}

/**
 * 矩形（含可选圆角和描边）
 */
export function rect(x, y, w, h, fill, opts = {}) {
  const fillA = colorAttr('fill', fill);
  const stroke = opts.stroke ? `${colorAttr('stroke', opts.stroke)} stroke-width="${opts.strokeW ?? 1}"` : '';
  const rx = opts.rx ? ` rx="${opts.rx}"` : '';
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}"${fillA}${stroke}${rx}/>`;
}

/**
 * SVG 文档头
 */
export function svgHeader(totalW, totalH) {
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" font-family="-apple-system, 'PingFang SC', 'SF Pro', Inter, system-ui, sans-serif">`,
  ].join('\n');
}

export const svgFooter = '</svg>';

/**
 * 常用配色（Cool 风格）
 */
export const colors = {
  canvas: '#F5F5F7',
  card: '#FFFFFF',
  status: '#F3F4F6',
  navy: '#111827',
  gray: '#4B5563',
  light: '#9CA3AF',
  border: '#E5E7EB',
  inputBg: '#F9FAFB',
  primary: '#3B82F6',
  primaryBg: '#EFF6FF',
  white: '#FFFFFF',
  red: '#EF4444',
  green: '#10B981',
  amber: '#F59E0B',
};
