-- drag-import: 用 AppleScript 把 Finder/Axure 准备好 → 调 Swift 合成 CGEvent 鼠标拖拽
--
-- 步骤：
--   1. 解析 SVG 路径
--   2. Finder 打开 SVG 所在文件夹 + 选中文件 + 强制 icon view
--   3. 获取 SVG 文件在屏幕上的中心坐标
--   4. 激活 Axure 拿画布中心坐标
--   5. 把两组坐标 + SVG 路径写到 /tmp 文件给 Swift 用
--   6. 调用 Swift drag-cgevent.swift 合成拖拽
--
-- 之所以分两步：AppleScript 适合 UI 查询，CGEvent 合成必须 Swift

on run argv
    if (count of argv) = 0 then return "ERR no argv"
    set svgPath to item 1 of argv

    -- 路径拆 folder + filename
    set AppleScript's text item delimiters to "/"
    set pathParts to text items of svgPath
    set fileName to last item of pathParts
    set folderParts to items 1 thru -2 of pathParts
    set folderPath to folderParts as text
    set AppleScript's text item delimiters to ""

    log "svgPath: " & svgPath
    log "folder: " & folderPath
    log "file: " & fileName

    -- 1. Finder 打开文件夹，选中文件，icon view
    tell application "Finder"
        activate
        try
            set targetFolder to POSIX file folderPath as alias
        on error errMsg
            return "ERR cant_alias_folder: " & errMsg
        end try
        open targetFolder
        delay 0.6
        try
            set targetFile to (POSIX file svgPath) as alias
            select targetFile
        on error errMsg
            return "ERR cant_select_file: " & errMsg
        end try
        delay 0.3
        -- 强制 icon view
        try
            tell front Finder window
                set current view to icon view
            end tell
            delay 0.3
        end try
    end tell

    -- 2. 查文件 icon 在屏幕上的中心位置
    set fileScreenX to 0
    set fileScreenY to 0
    tell application "Finder"
        try
            set winBounds to bounds of front Finder window
            -- bounds = {left, top, right, bottom} 屏幕坐标
            set winLeft to item 1 of winBounds
            set winTop to item 2 of winBounds
        on error errMsg
            return "ERR no_window_bounds: " & errMsg
        end try
        try
            set targetFile to (POSIX file svgPath) as alias
            set iconPos to position of targetFile
            -- iconPos = {x, y} 相对窗口内容区
            set iconX to item 1 of iconPos
            set iconY to item 2 of iconPos
        on error errMsg
            return "ERR no_icon_pos: " & errMsg & " (可能 view 还没切到 icon)"
        end try
    end tell

    -- Finder icon view: 内容区起点约在 winLeft + 0, winTop + 50 (toolbar 高度)
    set fileScreenX to winLeft + iconX
    set fileScreenY to winTop + iconY + 50
    log "file screen pos: " & fileScreenX & "," & fileScreenY

    -- 3. 激活 Axure 拿画布
    tell application "System Events"
        set procs to (every process whose name contains "Axure")
        if (count of procs) is 0 then return "ERR no_axure"
        set axName to name of (item 1 of procs)
    end tell
    try
        tell application axName to activate
    end try
    delay 0.5

    set axCenterX to 0
    set axCenterY to 0
    tell application "System Events"
        tell process axName
            try
                set w to window 1
                set pos to position of w
                set sz to size of w
                set wL to item 1 of pos
                set wT to item 2 of pos
                set wW to item 1 of sz
                set wH to item 2 of sz
                -- 画布大致在中心；为安全先用 window 中心
                set axCenterX to wL + (wW div 2)
                set axCenterY to wT + (wH div 2)
            on error errMsg
                return "ERR no_axure_window: " & errMsg
            end try
        end tell
    end tell
    log "axure center: " & axCenterX & "," & axCenterY

    -- 4. 写参数到 /tmp 文件
    set paramsFile to "/tmp/axure-bridge-drag-params"
    set params to (fileScreenX as text) & " " & (fileScreenY as text) & " " & (axCenterX as text) & " " & (axCenterY as text)
    do shell script "echo " & quoted form of params & " > " & quoted form of paramsFile
    log "params: " & params

    -- 5. 调用 Swift 合成拖拽（硬编码路径，避免 path to me 的歧义）
    set swiftScript to "/Users/macbookpro/Library/Application Support/axure-bridge/AxureBridge.app/Contents/Resources/drag-cgevent.swift"
    set swiftLog to "/tmp/axure-bridge-swift.log"
    -- 把 Swift 输出重定向到 swiftLog 便于诊断
    try
        do shell script "/usr/bin/env swift " & quoted form of swiftScript & " " & params & " > " & quoted form of swiftLog & " 2>&1"
    on error errMsg
        return "ERR swift_failed: " & errMsg & " (查 " & swiftLog & ")"
    end try

    return "OK drag-import dispatched | from " & fileScreenX & "," & fileScreenY & " to " & axCenterX & "," & axCenterY
end run
