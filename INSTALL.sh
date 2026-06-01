#!/bin/bash
# axure-mac-bridge 安装脚本
# 把 AxureBridge.app 装到 ~/Library/Application Support/ 并注册到 LaunchServices

set -e

REPO_DIR="$(cd "$(dirname "$0")" && pwd)"
BRIDGE_SRC="$REPO_DIR/AxureBridge.app"
BRIDGE_DST_DIR="$HOME/Library/Application Support/axure-bridge"
BRIDGE_DST="$BRIDGE_DST_DIR/AxureBridge.app"
PROTO_DIR="$HOME/Desktop/原型"

echo "========================================"
echo "  axure-mac-bridge installer"
echo "========================================"
echo

# --- 1. 检查前置 ---
echo "[1/5] 检查前置条件..."

if [[ "$(uname -s)" != "Darwin" ]]; then
    echo "  ❌ 这个工具只在 macOS 上跑。"
    exit 1
fi
echo "  ✅ macOS"

if ! command -v node &> /dev/null; then
    echo "  ❌ 缺 Node.js。装一个：https://nodejs.org/"
    exit 1
fi
NODE_VER=$(node -v | sed 's/v//' | cut -d. -f1)
if [[ "$NODE_VER" -lt 18 ]]; then
    echo "  ❌ Node.js 版本过低（< 18）。当前：$(node -v)"
    exit 1
fi
echo "  ✅ Node.js $(node -v)"

if [[ ! -d "/Applications/Axure RP 11.app" ]]; then
    echo "  ⚠️  没找到 Axure RP 11.app（可能你装在别处或还没装）"
    echo "      继续装 bridge，但用之前请先装 Axure。"
else
    echo "  ✅ Axure RP 11"
fi

echo

# --- 2. 拷贝 AxureBridge.app ---
echo "[2/5] 安装 AxureBridge.app..."

if [[ ! -d "$BRIDGE_SRC" ]]; then
    echo "  ❌ 找不到 $BRIDGE_SRC。你是不是在错误的目录跑的？"
    exit 1
fi

mkdir -p "$BRIDGE_DST_DIR"
if [[ -d "$BRIDGE_DST" ]]; then
    echo "  ⚠️  已存在旧版本，覆盖..."
    rm -rf "$BRIDGE_DST"
fi
cp -R "$BRIDGE_SRC" "$BRIDGE_DST"
chmod +x "$BRIDGE_DST/Contents/MacOS/AxureBridge"
echo "  ✅ 拷到 $BRIDGE_DST"

# 去 quarantine：浏览器下载 zip 会带此属性，否则 Gatekeeper 拦 + TCC 授权不稳
xattr -dr com.apple.quarantine "$BRIDGE_DST" 2>/dev/null || true
echo "  ✅ 已清除 quarantine 隔离属性"

# ad-hoc 签名：让 TCC 用稳定签名标识记录授权（否则改动/移动后权限失效要重授）
if command -v codesign &> /dev/null; then
    if codesign --force --deep --sign - "$BRIDGE_DST" 2>/dev/null; then
        echo "  ✅ ad-hoc 签名完成"
    else
        echo "  ⚠️  ad-hoc 签名失败（不致命）"
    fi
fi

echo

# --- 3. 注册到 LaunchServices ---
echo "[3/5] 注册到 LaunchServices..."
LSREGISTER="/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister"
if [[ -x "$LSREGISTER" ]]; then
    "$LSREGISTER" -f "$BRIDGE_DST" > /dev/null 2>&1 || true
    echo "  ✅ 已注册"
else
    echo "  ⚠️  没找到 lsregister，跳过（不影响功能，但 macOS 可能要几分钟才认出 App）"
fi

echo

# --- 4. 建原型目录 ---
echo "[4/5] 建 ~/Desktop/原型/ 目录..."
mkdir -p "$PROTO_DIR"
echo "  ✅ $PROTO_DIR"

echo

# --- 5. 完成 + 提示后续步骤 ---
echo "[5/5] 完成。"
echo
echo "========================================"
echo "  下一步：跑 demo + 授权"
echo "========================================"
echo
echo "  1. 跑 demo 生成 SVG："
echo "     cd $REPO_DIR/svg-generator"
echo "     node examples/feedback-page.mjs"
echo
echo "  2. 触发 AxureBridge："
echo "     open -a \"\$HOME/Library/Application Support/axure-bridge/AxureBridge.app\" \\"
echo "          --args \"\$HOME/Desktop/原型/feedback-prototype.svg\""
echo
echo "  3. 第一次运行 macOS 会弹 2~3 个权限对话框"
echo "     ▸ 'AxureBridge 想控制 System Events' → 允许"
echo "     ▸ 'AxureBridge 想控制 Axure RP 11'    → 允许"
echo "     ▸ 'AxureBridge 想控制 Finder'         → 允许"
echo
echo "  4. Finder 会自动选中 SVG 文件 + Axure 激活"
echo "     ▸ 你最后 1 秒：从 Finder 拖文件到 Axure 画布"
echo
echo "如果哪步坏了，看 docs/03-撞过的墙.md 里的常见问题。"
echo
