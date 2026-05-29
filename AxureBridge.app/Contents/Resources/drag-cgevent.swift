// drag-cgevent: 合成鼠标拖拽序列 from (sx,sy) to (tx,ty)
// 真实 mouse down → 多步 move（让 Finder 检测到 drag 启动）→ mouse up over Axure 画布

import AppKit
import CoreGraphics
import Foundation

let args = CommandLine.arguments
if args.count < 5 {
    print("ERR usage: drag-cgevent.swift <sx> <sy> <tx> <ty>")
    exit(1)
}
guard let sx = Double(args[1]), let sy = Double(args[2]),
      let tx = Double(args[3]), let ty = Double(args[4]) else {
    print("ERR cant parse args")
    exit(1)
}

print("drag from (\(sx),\(sy)) to (\(tx),\(ty))")

guard let source = CGEventSource(stateID: .combinedSessionState) else {
    print("ERR no_event_source")
    exit(1)
}

// 把光标先移到起点（不点）
let moveOnly = CGEvent(mouseEventSource: source,
                       mouseType: .mouseMoved,
                       mouseCursorPosition: CGPoint(x: sx, y: sy),
                       mouseButton: .left)
moveOnly?.post(tap: .cghidEventTap)
Thread.sleep(forTimeInterval: 0.3)

// Mouse down 在源点
let down = CGEvent(mouseEventSource: source,
                   mouseType: .leftMouseDown,
                   mouseCursorPosition: CGPoint(x: sx, y: sy),
                   mouseButton: .left)
down?.post(tap: .cghidEventTap)
print("mouse down at \(sx),\(sy)")

// 关键：在源点附近做几个小幅 move，让 Finder 识别为 "user has started dragging"
// macOS 通常要求 mouse 移动 > 几像素阈值才认作 drag
Thread.sleep(forTimeInterval: 0.1)
for i in 1...5 {
    let jitterX = sx + Double(i) * 3
    let jitterY = sy + Double(i) * 2
    let jit = CGEvent(mouseEventSource: source,
                      mouseType: .leftMouseDragged,
                      mouseCursorPosition: CGPoint(x: jitterX, y: jitterY),
                      mouseButton: .left)
    jit?.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.04)
}
print("jitter done, starting move to target")

// 主移动：从源到目标，分成 20 步缓慢移动
let steps = 20
for i in 1...steps {
    let t = Double(i) / Double(steps)
    let x = sx + (tx - sx) * t
    let y = sy + (ty - sy) * t
    let mv = CGEvent(mouseEventSource: source,
                     mouseType: .leftMouseDragged,
                     mouseCursorPosition: CGPoint(x: x, y: y),
                     mouseButton: .left)
    mv?.post(tap: .cghidEventTap)
    Thread.sleep(forTimeInterval: 0.025)
}
print("reached target")

// 在目标位置停留一下，让 Axure 检测到 dragging entered
Thread.sleep(forTimeInterval: 0.3)

// Mouse up at target → drop
let up = CGEvent(mouseEventSource: source,
                 mouseType: .leftMouseUp,
                 mouseCursorPosition: CGPoint(x: tx, y: ty),
                 mouseButton: .left)
up?.post(tap: .cghidEventTap)
print("mouse up at \(tx),\(ty) — drop dispatched")

print("OK drag synthesized")
