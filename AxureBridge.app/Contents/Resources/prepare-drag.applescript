-- prepare-drag: 帮用户做好"几乎要拖了"的准备
--   1. Finder 打开 SVG 所在文件夹，选中文件
--   2. 激活 Axure
--   3. 让 Finder 和 Axure 都在显眼位置
--   用户只需拖一下即可

on run argv
    if (count of argv) = 0 then return "ERR no argv"
    set svgPath to item 1 of argv

    set AppleScript's text item delimiters to "/"
    set pathParts to text items of svgPath
    set folderParts to items 1 thru -2 of pathParts
    set folderPath to folderParts as text
    set AppleScript's text item delimiters to ""

    -- 1. Finder 打开文件夹 + 选中
    tell application "Finder"
        activate
        try
            set targetFolder to POSIX file folderPath as alias
            open targetFolder
        on error errMsg
            return "ERR finder_open: " & errMsg
        end try
        delay 0.4
        try
            set targetFile to (POSIX file svgPath) as alias
            select targetFile
        on error errMsg
            return "ERR finder_select: " & errMsg
        end try
    end tell

    -- 2. 激活 Axure（让它在前台，用户可以拖到画布）
    tell application "System Events"
        set procs to (every process whose name contains "Axure")
        if (count of procs) is 0 then return "OK finder ready but Axure not running"
        set axName to name of (item 1 of procs)
    end tell
    delay 0.4
    try
        tell application axName to activate
    end try

    -- 不再尝试自动拖。直接把 Finder 重新带回前面，方便用户拖
    delay 0.5
    tell application "Finder" to activate

    return "OK finder selected file + axure activated; please drag"
end run
