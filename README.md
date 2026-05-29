# axure-mac-bridge

**在 macOS 上把 SVG 原型半自动导入 Axure RP 11 的工具链。**

> 因为 Axure for Mac 跟 Axure for Windows 不一样：剪贴板粘 SVG 会被压扁成位图，`open -a` 不接受非 .rp 文件，菜单里压根没"导入 SVG"项。这个 repo 是绕过这些坑、把 SVG → Axure 流程做到**剩下 1 秒手动拖**的成品。

---

## 是给谁用的

- 在 Mac 上用 Axure RP 11 的产品/设计同学
- 想用代码生成原型（而不是手画 N 遍）
- 团队需要"原型 + 需求文档"配套交付的场景
- 想了解 macOS 跨 App 自动化坑的工程师（[docs/03-撞过的墙.md](docs/03-撞过的墙.md)）

不是给：
- Windows 用户（用 Axure 原生 Axvg 粘贴就够了，本 repo 没意义）
- 想完全跳过手动操作的（macOS 安全模型那 1 秒拖不可绕，详见 docs）

---

## 5 分钟跑起来

### 前置

- macOS 11+
- Axure RP 11（已装、能跑）
- Node.js ≥ 18
- Safari（系统自带）

### 安装

```bash
git clone <你 fork 后的 url> axure-mac-bridge
cd axure-mac-bridge
./INSTALL.sh
```

INSTALL.sh 做这几件事：
1. 把 `AxureBridge.app` 拷到 `~/Library/Application Support/axure-bridge/`
2. 注册到 LaunchServices
3. 在桌面建 `原型/` 目录
4. 提示后续权限授予步骤

### 首次跑（需要点 2~3 次权限"允许"）

```bash
cd svg-generator
node examples/feedback-page.mjs
```

输出：
```
✅ Wrote SVG: /Users/你/Desktop/原型/feedback-prototype.svg
   Dimensions: 1007 x 2976
   ...
```

再执行：

```bash
open -a Safari ~/Desktop/原型/feedback-prototype.svg
open -a "$HOME/Library/Application Support/axure-bridge/AxureBridge.app" \
    --args "$HOME/Desktop/原型/feedback-prototype.svg"
```

第二次 open 会弹 macOS 权限对话框（**第一次跑会弹 2~3 个**）：
- "AxureBridge 想控制 System Events" → 允许
- "AxureBridge 想控制 Axure RP 11" → 允许
- "AxureBridge 想控制 Finder" → 允许

授权完，Finder 自动打开 `~/Desktop/原型/` 并选中 SVG，Axure 激活。

**你最后 1 秒**：Finder 里把高亮的 SVG 拖到 Axure 画布。

---

## 为什么不能完全自动化

简短版：Axure for Mac 没提供任何菜单/剪贴板的 SVG 导入路径，**只接受 drag-drop**。

而 macOS 安全模型禁止合成 drag 事件——合成的 mouseDown→move→up 序列**不会触发 Finder 启动真正的 `NSDraggingSession`**，所以 drag pasteboard 是空的，Axure 看不到文件。

完整版见 [docs/03-撞过的墙.md](docs/03-撞过的墙.md)——记录了 8 条死路和失败原因，对要在 macOS 上做跨 App 自动化的工程师有参考价值。

---

## 项目结构

```
axure-mac-bridge/
├── README.md                    本文档
├── INSTALL.sh                   一键安装
│
├── docs/                        文档
│   ├── 00-新人安装指南.md        ← 零基础逐步安装（先看这个）
│   ├── 01-为什么需要这个.md
│   ├── 02-架构.md
│   ├── 03-撞过的墙.md           ← macOS 跨 App 自动化的坑大全
│   ├── 04-Axure-SVG-怪癖.md     ← SVG 写法约束
│   └── 05-举例-画自己的页面.md   ← 4 个 API 教你画页面
│
├── AxureBridge.app/             macOS 桥接 App
│   └── Contents/
│       ├── Info.plist           带 NSAppleEventsUsageDescription，绕开 Claude 等 App 的权限墙
│       ├── MacOS/AxureBridge    多模式分发主脚本
│       └── Resources/
│           ├── prepare-drag.applescript   ✅ 当前生产模式
│           ├── drag-import.applescript    ⚠️ CGEvent 拖拽（不工作，保留参考）
│           ├── drag-cgevent.swift         ⚠️ CGEvent 合成
│           ├── dump-all-menus.applescript 🔧 诊断用
│           └── import.applescript         ⚠️ 菜单 import（只对 .rp 有效）
│
└── svg-generator/               SVG 生成框架
    ├── package.json
    ├── lib/
    │   ├── primitives.mjs       txt / rect / measureText / 配色
    │   ├── phone.mjs            iPhone mockup（状态栏 / 导航栏 / Home indicator）
    │   └── spec-panel.mjs       右侧需求说明面板
    └── examples/
        └── feedback-page.mjs    Demo：用户反馈页（3 屏，左 mockup + 右说明）
```

---

## 写自己的页面

完整教程见 [docs/05-举例-画自己的页面.md](docs/05-举例-画自己的页面.md)，从最简单的 `examples/hello-page.mjs` 入手。核心 API：

```js
import { txt, rect, colors as C, svgHeader, svgFooter } from '../lib/primitives.mjs';
import { phoneFrame, statusBar, navBar, homeIndicator, pill, PHONE_W, PHONE_H } from '../lib/phone.mjs';
import { specPanel } from '../lib/spec-panel.mjs';

// 一定要用 lib 提供的 txt() —— 它自动包 <g transform="translate(...)">
// 直接写 <text x y> 在 Axure 里会全部塌到顶部（见 docs/04-Axure-SVG-怪癖.md）
const out = [
  svgHeader(1200, 900),
  txt(50, 50, '我的页面标题', { size: 18, weight: 700, fill: C.navy }),
  rect(50, 100, 400, 200, C.inputBg, { stroke: C.border, rx: 8 }),
  svgFooter,
].join('\n');
```

---

## 常见问题

**Q: 我点权限"允许"了，但 AxureBridge 还是不工作？**
A: 完全退出 Axure 和 AxureBridge 重启一次。`tccutil reset AppleEvents com.user.axurebridge` 可以重置权限决定，强制 macOS 再弹一次询问。

**Q: SVG 拖进 Axure 后文字位置歪了？**
A: 99% 是你直接写了 `<text x y>` 没用 lib 的 `txt()`。详见 docs/04-Axure-SVG-怪癖.md。

**Q: 文字宽度估算不准，居中略偏？**
A: `measureText()` 系数是基于 Inter / PingFang 实测的，CJK 估 1.0×fontSize、ASCII 估 0.55×。 真实字符宽度有 1~5% 偏差，低保真原型可接受。要精确就把文字转成 SVG 路径（lib 未实现，可自加）。

**Q: 能不能在生成 SVG 后自动开 Safari 和 AxureBridge？**
A: 可以，在你的生成脚本末尾加 `child_process.spawn('open', ['-a', 'Safari', outPath])` 等。example 里没自动调，因为不想每次跑 demo 都打开一堆窗口。

**Q: 这套也适用 Sketch / Figma 吗？**
A: SVG 生成框架（svg-generator/lib）是通用的，可以输出给任何 SVG 渲染器。AxureBridge.app 是专门为 Axure 写的。

---

## License

未指定。建议加 MIT。

---

## Acknowledgment

整个工具链是踩着多个坑磨出来的：
- AppleScript 权限墙（Claude.app 缺 NSAppleEventsUsageDescription）
- Axure for Mac SVG 解析器的怪癖
- macOS 沙箱对 Desktop 文件夹的限制（能写不能 ls）
- CGEvent 合成事件 vs 真实输入的安全分界

所有踩坑过程都在 `docs/03-撞过的墙.md`，希望能让下个 macOS 自动化工程师少走弯路。
