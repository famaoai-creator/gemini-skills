-- AppleScript to Toggle Dictation
-- Assumes "Start Dictation" is available in the "Edit" menu of the focused app.

tell application "System Events"
	tell (first process whose frontmost is true)
		if exists menu item "Start Dictation..." of menu "Edit" of menu bar 1 then
			click menu item "Start Dictation..." of menu "Edit" of menu bar 1
		else
            -- If it's already running, the menu item might be absent or differ.
            -- Fallback: Attempting key code for a common shortcut (e.g., F5 = 96)
            -- User must configure Dictation shortcut to F5 for this fallback.
			key code 96
		end if
	end tell
end tell
