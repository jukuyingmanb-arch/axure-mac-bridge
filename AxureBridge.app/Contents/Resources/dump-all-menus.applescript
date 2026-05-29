-- Dump 所有 Axure 顶层菜单的项 + 子项，找任何含 "图片/图像/SVG/导入/Insert/Image" 的项

tell application "System Events"
    set procs to (every process whose name contains "Axure")
    if (count of procs) is 0 then return "ERR no axure"
    set procName to name of (item 1 of procs)
end tell
try
    tell application procName to activate
end try
delay 0.4

set out to ""
tell application "System Events"
    tell process procName
        set mbItems to every menu bar item of menu bar 1
        repeat with mbi in mbItems
            set topName to name of mbi as text
            -- 跳过 Apple 菜单和应用名菜单
            if topName is not "Apple" and topName does not contain "Axure RP" then
                set out to out & return & "=== " & topName & " ==="
                try
                    set m to menu 1 of mbi
                    repeat with mi in (every menu item of m)
                        set itmName to name of mi as text
                        if itmName is not "" then
                            -- 检测是否含 svg/图片/图像/导入/Insert/Image
                            set s to itmName
                            set hasMatch to (s contains "SVG" or s contains "svg" or s contains "图片" or s contains "图像" or s contains "导入" or s contains "Import" or s contains "Insert" or s contains "Image" or s contains "插入" or s contains "添加")
                            if hasMatch then
                                set out to out & return & "  ★ " & itmName
                            end if
                            -- 子菜单
                            try
                                set sub to menu 1 of mi
                                repeat with si in (every menu item of sub)
                                    set siName to name of si as text
                                    if siName is not "" then
                                        set s2 to siName
                                        set hasMatch2 to (s2 contains "SVG" or s2 contains "svg" or s2 contains "图片" or s2 contains "图像" or s2 contains "导入" or s2 contains "Import" or s2 contains "Insert" or s2 contains "Image" or s2 contains "插入" or s2 contains "添加")
                                        if hasMatch2 then
                                            set out to out & return & "    ★ " & itmName & " → " & siName
                                        end if
                                    end if
                                end repeat
                            end try
                        end if
                    end repeat
                end try
            end if
        end repeat
    end tell
end tell
return out
