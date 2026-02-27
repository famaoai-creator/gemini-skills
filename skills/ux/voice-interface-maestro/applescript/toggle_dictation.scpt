on run argv
    set key_code to item 1 of argv
    tell application "System Events"
        key code key_code
    end tell
end run