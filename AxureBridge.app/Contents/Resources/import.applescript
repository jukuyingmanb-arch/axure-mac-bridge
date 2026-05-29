-- AxureBridge import：把 SVG 路径通过 File → Import 菜单导入 Axure
--
-- 多重匹配策略：
--   1. 找 File / 文件 菜单
--   2. 在该菜单里找含 "SVG" 的项（最高优先），其次 "图片/图像/Image"，再次 "导入/Import"
--   3. 若顶层项有子菜单，递归进去找 SVG / 图片 项
--   4. 找不到时把所有可见项 + 子菜单内容 dump 到 log

-- 返回菜单项是否有子菜单
on hasSubmenu(mi)
    try
        set sub to menu 1 of mi
        return true
    on error
        return false
    end try
end hasSubmenu

-- 评分：含 SVG > 含图片/图像/Image > 含 导入/Import
on score(itemName)
    set s to itemName as text
    if s contains "SVG" or s contains "svg" then return 100
    if s contains "图片" or s contains "图像" or s contains "Image" then return 50
    if s contains "导入" or s contains "Import" or s contains "輸入" then return 10
    return 0
end score

on run argv
    if (count of argv) = 0 then return "ERR no argv"
    set svgPath to item 1 of argv

    tell application "System Events"
        set procs to (every process whose name contains "Axure")
        if (count of procs) is 0 then return "ERR no_axure_process"
        set procName to name of (item 1 of procs)
    end tell

    try
        tell application procName to activate
    on error errMsg
        return "ERR activate_failed: " & errMsg
    end try
    delay 0.6

    -- 找 File 菜单本地化名 — 记录所有可见顶级菜单帮助诊断
    set fileMenuName to ""
    set topMenusLog to ""
    tell application "System Events"
        tell process procName
            set mbItems to every menu bar item of menu bar 1
            repeat with mbi in mbItems
                set nm to name of mbi as text
                set topMenusLog to topMenusLog & "[" & nm & "] "
                if nm is "File" or nm is "文件" or nm contains "File" or nm contains "文件" then
                    set fileMenuName to nm
                    -- 不 exit，继续 dump 全部
                end if
            end repeat
        end tell
    end tell
    log "top menus: " & topMenusLog
    if fileMenuName is "" then return "ERR no_file_menu | top menus: " & topMenusLog

    -- 列 File 菜单所有项 + 评分，挑最佳 Import 项
    set bestName to ""
    set bestScore to 0
    set bestPath to {}  -- 记录路径，可能是 "顶层项" 或 "顶层 → 子项"
    set dumpLog to "File menu contents:" & return

    tell application "System Events"
        tell process procName
            set fileMenu to menu fileMenuName of menu bar item fileMenuName of menu bar 1
            repeat with mi in (every menu item of fileMenu)
                set itmName to name of mi as text
                if itmName is not "" then
                    set hasSub to my hasSubmenu(mi)
                    set sc to my score(itmName)
                    if hasSub then
                        set dumpLog to dumpLog & "  • " & itmName & " [子菜单]:" & return
                        try
                            set subItems to every menu item of menu 1 of mi
                            repeat with si in subItems
                                set siName to name of si as text
                                if siName is not "" then
                                    set siScore to my score(siName)
                                    set dumpLog to dumpLog & "      - " & siName & "  (score=" & siScore & ")" & return
                                    if siScore > bestScore then
                                        set bestScore to siScore
                                        set bestName to siName
                                        set bestPath to {itmName, siName}
                                    end if
                                end if
                            end repeat
                        end try
                    else
                        set dumpLog to dumpLog & "  • " & itmName & "  (score=" & sc & ")" & return
                        if sc > bestScore then
                            set bestScore to sc
                            set bestName to itmName
                            set bestPath to {itmName}
                        end if
                    end if
                end if
            end repeat
        end tell
    end tell

    log dumpLog

    if bestName is "" or bestScore is 0 then
        return "ERR no_import_candidate | " & dumpLog
    end if

    -- 点击最佳项（顶层或子菜单）
    try
        tell application "System Events"
            tell process procName
                if (count of bestPath) = 1 then
                    click menu item bestName of menu fileMenuName of menu bar item fileMenuName of menu bar 1
                else
                    -- 二级菜单：先点顶层（展开子菜单），再点子项
                    set topName to item 1 of bestPath
                    set subName to item 2 of bestPath
                    click menu item subName of menu 1 of menu item topName of menu fileMenuName of menu bar item fileMenuName of menu bar 1
                end if
            end tell
        end tell
    on error errMsg
        return "ERR click_failed: " & errMsg & " | path=" & (bestPath as text)
    end try

    -- 等文件选择对话框
    delay 1.2

    -- Cmd+Shift+G → 输入路径 → 双 Enter
    tell application "System Events"
        keystroke "g" using {command down, shift down}
    end tell
    delay 0.4

    set the clipboard to svgPath
    delay 0.15
    tell application "System Events"
        keystroke "v" using command down
    end tell
    delay 0.3
    tell application "System Events"
        key code 36
    end tell
    delay 0.6
    tell application "System Events"
        key code 36
    end tell

    return "OK chosen=" & bestName & " score=" & bestScore & " | path=" & (bestPath as text)
end run
