// Demo：用户反馈页面（3 屏，左 mockup + 右需求说明）
// 复现了项目最早的产物，作为模块化 lib 的使用范例
//
// 运行：
//   cd svg-generator
//   node examples/feedback-page.mjs
//   → 输出到 ~/Desktop/原型/feedback-prototype.svg

import { writeFileSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import {
  txt, rect, colors as C, svgHeader, svgFooter,
} from '../lib/primitives.mjs';
import {
  PHONE_W, PHONE_H, phoneFrame, statusBar, navBar, homeIndicator, pill,
} from '../lib/phone.mjs';
import { specPanel, SPEC_W_DEFAULT } from '../lib/spec-panel.mjs';

// === 布局参数 ===
const GUTTER = 56;
const SPEC_W = SPEC_W_DEFAULT;
const PAGE_W = PHONE_W + GUTTER + SPEC_W;
const PAGE_PADDING_X = 48;
const PAGE_PADDING_Y = 60;
const PAGE_GAP_Y = 60;
const ROW_H = PHONE_H + 100;
const TOTAL_W = PAGE_PADDING_X * 2 + PAGE_W;
const TOTAL_H = PAGE_PADDING_Y * 2 + ROW_H * 3 + PAGE_GAP_Y * 2;

// === 输出累积 ===
const out = [];
const push = (s) => out.push(s);

push(svgHeader(TOTAL_W, TOTAL_H));
push(`<rect width="100%" height="100%" fill="${C.canvas}"/>`);

// 文档顶部标题
push(txt(PAGE_PADDING_X, 16, '用户反馈中心 · 移动端 V1 设计稿', { size: 18, weight: 700, fill: C.navy }));
push(txt(PAGE_PADDING_X, 40, '左侧为 UI 设计，右侧为需求说明 · 移动端 375×812 · 必须登录 · 无回复闭环', { size: 12, fill: C.gray }));

// =========================================================================
// Row 1：反馈提交页
// =========================================================================
const row1Y = PAGE_PADDING_Y + 24;
const mockupX = PAGE_PADDING_X;
const specX = PAGE_PADDING_X + PHONE_W + GUTTER;

{
  const frame = phoneFrame(mockupX, row1Y, 'Page 1');
  push(frame.begin);
  push(statusBar());
  push(navBar('意见反馈'));

  // 反馈类型 label
  push(`  ${txt(16, 116, '反馈类型', { size: 14, weight: 500, fill: C.gray })}`);

  // 4 Chips
  const chips = [
    { label: 'Bug 反馈', selected: true, w: 80 },
    { label: '功能建议', selected: false, w: 80 },
    { label: '体验问题', selected: false, w: 80 },
    { label: '其他', selected: false, w: 60 },
  ];
  let cx = 16;
  for (const c of chips) {
    const fill = c.selected ? C.primary : C.inputBg;
    const stroke = c.selected ? undefined : C.border;
    const textFill = c.selected ? C.white : C.gray;
    push(`  ${pill(cx, 144, c.w, 32, fill, { stroke })}`);
    push(`  ${txt(cx + c.w / 2, 153, c.label, { size: 13, weight: c.selected ? 500 : 400, fill: textFill, anchor: 'middle' })}`);
    cx += c.w + 8;
  }

  // 反馈内容
  push(`  ${txt(16, 200, '反馈内容', { size: 14, weight: 500, fill: C.gray })}`);
  push(`  ${rect(16, 228, 343, 140, C.inputBg, { stroke: C.border, rx: 8 })}`);
  push(`  ${txt(28, 244, '请详细描述你遇到的问题或建议…', { size: 13, fill: C.light })}`);
  push(`  ${txt(PHONE_W - 28, 350, '0 / 500', { size: 11, fill: C.light, anchor: 'end' })}`);

  // 上传图片
  push(`  ${txt(16, 392, '上传图片（最多 9 张）', { size: 14, weight: 500, fill: C.gray })}`);
  push(`  ${rect(16, 420, 72, 72, C.inputBg, { stroke: C.border, rx: 8 })}`);
  push(`  <g transform="translate(36, 438)" stroke="${C.light}" stroke-width="1.5" fill="none">`);
  push(`    <rect x="0" y="6" width="32" height="22" rx="3"/>`);
  push(`    <rect x="10" y="2" width="12" height="6" rx="1"/>`);
  push(`    <circle cx="16" cy="17" r="6"/>`);
  push(`  </g>`);
  push(`  ${txt(52, 476, '相机', { size: 11, fill: C.light, anchor: 'middle' })}`);
  push(`  ${rect(96, 420, 72, 72, C.inputBg, { stroke: C.border, rx: 8 })}`);
  push(`  <g transform="translate(116, 436)" stroke="${C.light}" stroke-width="1.5" fill="none">`);
  push(`    <rect x="0" y="0" width="32" height="32" rx="3"/>`);
  push(`    <circle cx="10" cy="11" r="3"/>`);
  push(`    <path d="M 0 24 L 10 16 L 18 22 L 26 14 L 32 20 L 32 32 L 0 32 Z" fill="${C.light}" stroke="none"/>`);
  push(`  </g>`);
  push(`  ${txt(132, 476, '相册', { size: 11, fill: C.light, anchor: 'middle' })}`);

  // 联系方式
  push(`  ${txt(16, 516, '联系方式（选填）', { size: 14, weight: 500, fill: C.gray })}`);
  push(`  ${rect(16, 544, 343, 44, C.inputBg, { stroke: C.border, rx: 8 })}`);
  push(`  ${txt(28, 559, '手机号 / 邮箱，方便我们联系你', { size: 13, fill: C.light })}`);

  push(`  ${txt(16, 608, '查看常见问题 ›', { size: 13, fill: C.primary })}`);

  // 提交按钮
  push(`  ${rect(16, 728, 343, 48, C.primary, { rx: 8 })}`);
  push(`  ${txt(PHONE_W / 2, 744, '提交反馈', { size: 15, weight: 700, fill: C.white, anchor: 'middle' })}`);

  push(homeIndicator());
  push(frame.end);

  push(specPanel(specX, row1Y, 1, '反馈提交页', [
    {
      heading: '功能目标',
      items: ['让用户在 30 秒内完成一次反馈提交，承接 App 主动收集用户声音的入口。'],
    },
    {
      heading: '页面元素',
      items: [
        '• 顶栏：返回 + 标题"意见反馈"',
        '• 反馈类型 Chips：Bug / 功能建议 / 体验问题 / 其他（单选，默认 Bug）',
        '• 反馈内容：多行输入框，最大 500 字，右下角实时字符计数',
        '• 图片上传：相机 + 相册 2 个入口，最多 9 张',
        '• 联系方式：单行输入框，选填',
        '• 提交按钮：底部主色按钮 343×48',
      ],
    },
    {
      heading: '关键交互',
      items: [
        '• 反馈内容为空 → 提交按钮置灰禁用',
        '• 提交进行中 → 按钮变菊花，禁止重复点击',
        '• 提交成功 → Toast → 跳"我的反馈"列表',
      ],
    },
    {
      heading: '字段 & 校验',
      items: [
        '- type：必选，4 选 1',
        '- content：必填，1-500 字',
        '- images：≤ 9 张，单张 ≤ 10 MB',
        '- contact：选填，填了则校验格式',
      ],
    },
  ]));
}

// =========================================================================
// Row 2：我的反馈列表
// =========================================================================
const row2Y = row1Y + ROW_H + PAGE_GAP_Y;
{
  const frame = phoneFrame(mockupX, row2Y, 'Page 2');
  push(frame.begin);
  push(statusBar());
  push(navBar('我的反馈', '筛选'));

  // Tab 栏
  push(`  ${rect(0, 96, PHONE_W, 44, C.card, { stroke: C.border })}`);
  push(`  ${txt(PHONE_W / 6, 111, '全部', { size: 14, weight: 700, fill: C.primary, anchor: 'middle' })}`);
  push(`  ${txt(PHONE_W / 2, 111, 'Bug', { size: 14, fill: C.gray, anchor: 'middle' })}`);
  push(`  ${txt((PHONE_W / 6) * 5, 111, '建议', { size: 14, fill: C.gray, anchor: 'middle' })}`);
  push(`  ${rect(PHONE_W / 6 - 30, 134, 60, 2, C.primary)}`);

  // 反馈卡片
  const card = (y, tag, tagColor, summary, time) => {
    push(`  ${rect(16, y, 343, 88, C.card, { stroke: C.border, rx: 10 })}`);
    push(`  ${pill(28, y + 14, 64, 22, tagColor)}`);
    push(`  ${txt(60, y + 19, tag, { size: 11, weight: 500, fill: C.white, anchor: 'middle' })}`);
    push(`  ${txt(28, y + 46, summary, { size: 13, fill: C.navy })}`);
    push(`  ${txt(28, y + 70, time, { size: 11, fill: C.light })}`);
    push(`  <path d="M 320 ${y + 38} L 326 ${y + 44} L 320 ${y + 50}" stroke="${C.light}" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`);
  };
  card(160, 'Bug 反馈', C.red, '登录后头像加载失败，反复刷新无效…', '今天 14:32');
  card(264, '功能建议', C.green, '希望增加深色模式，长时间使用眼睛酸…', '昨天 09:15');
  card(368, '体验问题', C.amber, '搜索结果排序混乱，找不到刚看过的内容…', '3 天前');
  card(472, 'Bug 反馈', C.red, '应用闪退，操作付款后白屏…', '上周');

  // FAB
  push(`  <circle cx="${PHONE_W - 44}" cy="720" r="28" fill="${C.primary}"/>`);
  push(`  ${txt(PHONE_W - 44, 706, '+', { size: 28, weight: 700, fill: C.white, anchor: 'middle' })}`);

  push(homeIndicator());
  push(frame.end);

  push(specPanel(specX, row2Y, 2, '我的反馈列表页', [
    {
      heading: '功能目标',
      items: ['让用户回看历史反馈，避免重复提交；保持反馈记录的可追溯性。'],
    },
    {
      heading: '页面元素',
      items: [
        '• 顶栏：返回 + 标题"我的反馈" + 右上"筛选"',
        '• Tab：全部 / Bug / 建议',
        '• 反馈卡片：类型 Tag + 摘要 + 时间 + chevron',
        '• 右下 FAB：跳反馈提交页',
      ],
    },
    {
      heading: '关键交互',
      items: [
        '• Tab 切换 → 立刻刷新列表',
        '• 卡片点击 → 跳详情',
        '• 下拉刷新 / 上拉加载下一页（20 条/页）',
      ],
    },
    {
      heading: '字段 & 数据',
      items: [
        '- feedback_id',
        '- type / summary / created_at',
        '- 时间相对显示（今天 / 昨天 / N 天前 / 具体日期）',
      ],
    },
  ]));
}

// =========================================================================
// Row 3：反馈详情页
// =========================================================================
const row3Y = row2Y + ROW_H + PAGE_GAP_Y;
{
  const frame = phoneFrame(mockupX, row3Y, 'Page 3');
  push(frame.begin);
  push(statusBar());
  push(navBar('反馈详情'));

  push(`  ${pill(16, 116, 72, 24, C.red)}`);
  push(`  ${txt(52, 122, 'Bug 反馈', { size: 12, weight: 500, fill: C.white, anchor: 'middle' })}`);
  push(`  ${txt(100, 124, '提交于 2026-05-28 14:32', { size: 12, fill: C.light })}`);

  push(`  ${rect(16, 156, 343, 1, C.border)}`);

  push(`  ${txt(16, 174, '反馈内容', { size: 13, weight: 500, fill: C.gray })}`);
  push(`  ${txt(16, 200, '登录后头像加载失败，反复刷新无效。', { size: 14, fill: C.navy })}`);
  push(`  ${txt(16, 222, '我用的是 iPhone 13，iOS 17.4，App 版本', { size: 14, fill: C.navy })}`);
  push(`  ${txt(16, 244, '是 3.2.1。问题大概是从上周开始的。', { size: 14, fill: C.navy })}`);

  push(`  ${txt(16, 290, '图片附件（3 张）', { size: 13, weight: 500, fill: C.gray })}`);
  for (let i = 0; i < 3; i++) {
    const ix = 16 + i * 80;
    push(`  ${rect(ix, 314, 72, 72, C.inputBg, { stroke: C.border, rx: 6 })}`);
    push(`  <g transform="translate(${ix + 6}, 328)" stroke="${C.light}" stroke-width="1.5" fill="none">`);
    push(`    <rect x="0" y="0" width="60" height="44" rx="2"/>`);
    push(`    <circle cx="48" cy="12" r="4" fill="${C.light}" stroke="none"/>`);
    push(`    <path d="M 0 44 L 18 24 L 36 36 L 60 14 L 60 44 Z" fill="${C.light}" stroke="none"/>`);
    push(`  </g>`);
  }

  push(`  ${txt(16, 410, '联系方式', { size: 13, weight: 500, fill: C.gray })}`);
  push(`  ${txt(16, 434, '138****5678', { size: 14, fill: C.navy })}`);

  push(`  ${rect(16, 472, 343, 1, C.border)}`);

  push(`  ${rect(16, 492, 343, 60, C.primaryBg, { rx: 8 })}`);
  push(`  ${txt(PHONE_W / 2, 515, '已收到，感谢你帮助我们改进 ♥', { size: 13, fill: C.primary, anchor: 'middle' })}`);

  push(`  ${rect(16, 728, 343, 48, C.card, { stroke: C.primary, rx: 8 })}`);
  push(`  ${txt(PHONE_W / 2, 744, '追加补充', { size: 15, weight: 500, fill: C.primary, anchor: 'middle' })}`);

  push(homeIndicator());
  push(frame.end);

  push(specPanel(specX, row3Y, 3, '反馈详情页', [
    {
      heading: '功能目标',
      items: ['让用户查看自己提交过的反馈完整内容，必要时追加补充。'],
    },
    {
      heading: '页面元素',
      items: [
        '• 顶栏：返回 + 标题"反馈详情"',
        '• 类型 Tag + 提交时间',
        '• 反馈内容（只读，可选择复制）',
        '• 图片附件（最多 3 张，可点击放大）',
        '• 联系方式（脱敏显示）',
        '• 追加补充按钮（次按钮）',
      ],
    },
    {
      heading: '关键交互',
      items: [
        '• 点图片 → 全屏预览，横滑切换',
        '• 长按内容 → 系统复制菜单',
        '• 追加补充 → 跳提交页（带原 id）',
        '• 提交后不可删，仅追加',
      ],
    },
    {
      heading: '字段 & 脱敏',
      items: [
        '- 手机号：前 3 + 后 4，中间星号',
        '- 邮箱：@ 前保留前 3，其余星号',
      ],
    },
  ]));
}

push(svgFooter);

// =========================================================================
// 输出 & 触发 AxureBridge
// =========================================================================
const svg = out.join('\n');
const PROTO_DIR = `${homedir()}/Desktop/原型`;
mkdirSync(PROTO_DIR, { recursive: true });
const outPath = `${PROTO_DIR}/feedback-prototype.svg`;
writeFileSync(outPath, svg, 'utf8');
console.log('✅ Wrote SVG:', outPath);
console.log('   Dimensions:', TOTAL_W, 'x', TOTAL_H);
console.log('   Chars:', svg.length);
console.log();
console.log('Next:');
console.log('   1. open -a Safari', outPath);
console.log('   2. open -a "$HOME/Library/Application Support/axure-bridge/AxureBridge.app" --args', JSON.stringify(outPath));
console.log('   3. Finder 里拖文件到 Axure 画布');
