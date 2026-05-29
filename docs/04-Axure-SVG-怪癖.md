# Axure for Mac SVG 解析器怪癖

写 SVG 给 Axure for Mac import 时**必须**遵守的约束。违反就会出现"形状对了文字全错位"这种情况。

## 怪癖 1：`<text>` 元素的 `y` 属性被忽略

**症状**：你的 SVG 里所有 `<text x y>` 在浏览器/Safari 里位置完美，拖进 Axure 全部塌到画布顶部一个区域。

**原因**：Axure 的 SVG 解析器对**裸 `<text>` 元素的 y 属性**处理有 bug。可能是把所有 text 当成第一个 y 值，也可能是把 y 当成无效值用默认 0。

**修复**：把每个 text 用 `<g transform="translate(x, y)">` 包裹，文字本身放 `(0, 0)`：

```xml
<!-- ❌ Axure 解析后 y 丢失 -->
<text x="100" y="200">Hello</text>

<!-- ✅ Axure 通过 transform 拿到位置 -->
<g transform="translate(100, 200)">
  <text x="0" y="0">Hello</text>
</g>
```

**验证**：我们做过一个 6 种写法的探针 SVG，确认 **只有 `<g transform="translate(x,y)"><text x=0 y=0>` 能保持位置**。其他 5 种（裸 x/y、显式 font-family、纯英文、加 dominant-baseline、空 g 包裹）全部失败。

---

## 怪癖 2：`text-anchor` 完全被忽略

**症状**：本来想居中的文字（`text-anchor="middle"`），在 Axure 里全部变成左对齐。

**修复**：手动算字符宽度做偏移。

```js
function measureText(s, size) {
  let w = 0;
  for (const ch of String(s)) {
    if (/[一-鿿]/.test(ch)) w += size * 1.0;       // CJK
    else if (/[A-Z]/.test(ch)) w += size * 0.62;   // 大写
    else if (/[a-z0-9]/.test(ch)) w += size * 0.55;// 小写/数字
    else w += size * 0.5;
  }
  return w;
}

// 居中：x = 中心点 - 半宽
const measuredW = measureText(label, fontSize);
const leftX = centerX - measuredW / 2;
const svgText = `<g transform="translate(${leftX}, ${y})"><text x="0" y="0" font-size="${fontSize}">${label}</text></g>`;
```

`svg-generator/lib/primitives.mjs` 的 `txt()` 函数已经把这套封装好了，传 `anchor: 'middle'` 即可。

---

## 怪癖 3：baseline 没有统一约定

不同 SVG 渲染器对 `<text>` 的 y 解释不一样：
- Safari 默认：y 是基线
- 加 `dominant-baseline="hanging"`：y 是顶边（cap height）
- 加 `dominant-baseline="text-before-edge"`：y 是 em box 顶

**Axure 行为**：不稳定，且 `dominant-baseline` 属性它**不识别**。

**统一约定**：所有 helper 接受"视觉顶边"作为输入，内部转成基线 y（baseline = top + size × 0.8），不依赖任何 `dominant-baseline`。这样在 Safari、Axure、Sketch、Figma 表现一致。

---

## 怪癖 4：`font-family` 不继承

**症状**：在 `<svg>` 根元素上设 `font-family="Inter, ..."`，子 `<text>` 可能不继承。

**对策**：要么每个 text 显式 `font-family=`，要么接受 Axure 默认字体（系统 fallback）。我们的 lib 选了后者——低保真原型字体差异可接受。

如果你需要精确字体，把所有 text 加 `font-family="PingFang SC, Helvetica"`。

---

## 怪癖 5：CJK 字体 fallback 行为不可控

Axure for Mac 渲染 CJK 字符时回退到系统字体。这通常没问题，但：

- 字符宽度可能比 `measureText()` 估的略宽（系数 1.0 对 PingFang 准，对其他 fallback 字体可能差 5%）
- 字符垂直对齐可能略偏

低保真原型场景一般可接受。要 pixel-perfect 就把文字转成 SVG `<path>`（`opentype.js` 生成 glyph 路径），缺点是文字不可编辑。

---

## 不要做的事

1. **不要用 `<tspan>`** —— Axure 解析它的位置规则更乱。
2. **不要写 `<text dy>`** —— 同上。
3. **不要依赖 SVG 文本自动换行** —— SVG 1.1 本来就不支持，自己用 `measureText()` 算断行（`txtBlock()`）。
4. **不要在 `<g>` 里嵌套 `<g>` 嵌套 `<text>`** —— 多层 transform 没问题，但 Axure 解析嵌套 g 的属性合并有时会丢一个层级。`txt()` 的设计是**单层 g + 单层 text**，验证过最稳。
5. **不要用 emoji（U+1F000+）** —— Axure 默认字体不渲染 emoji 平面。用 BMP 范围的字符（如 ★ ✓ ‹ ›）或单独贴位图。

---

## 模板：合法的 Axure SVG 文本写法

```xml
<!-- 标题，左对齐 -->
<g transform="translate(50, 100)">
  <text x="0" y="0" font-size="18" font-weight="700" fill="#111827">页面标题</text>
</g>

<!-- 按钮文字，居中（手算偏移）-->
<g transform="translate(187, 745)">
  <text x="0" y="0" font-size="15" font-weight="700" fill="#FFFFFF">提交反馈</text>
</g>

<!-- 居中：中心 200，文字宽度 60，所以 left = 200 - 30 = 170 -->
<g transform="translate(170, 50)">
  <text x="0" y="0" font-size="14">居中文字</text>
</g>
```
