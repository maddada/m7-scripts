; ^  ->  Ctrl
; !  ->  Alt
; +  ->  Shift
; #  ->  Windows
; ⚠ Select then format. Don't use whole file auto formatting ⚠

; #region 🟥 Globals & AHK Stuff
#Warn
#SingleInstance Force
#MaxThreadsPerHotkey 2

; Globals (need to be declared at the top of the file - before any return statements)
pausedIcon := 'C:\Users\madda\Pictures\ico\soundoff.ico'
runningIcon := 'C:\Users\madda\Pictures\ico\soundon.ico'
autoScrollToggle := false
autoClickToggle := false

; Reload script when cursor is active
; (check if it's been modified in the last 5 seconds when ctrl+s is pressed)
#HotIf WinActive("ahk_exe Cursor.exe")
~^s:: {
    scriptPath := A_ScriptFullPath
    lastModified := FileGetTime(scriptPath, "M")
    now := DateAdd(A_Now, 0, "Seconds") ; Current time
    diff := DateDiff(now, lastModified, "Seconds")
    if Abs(diff) <= 5 {
        Reload
    }
}
#HotIf

; VLC -> Use mouse buttons to navigate
#HotIf WinActive("ahk_exe vlc.exe")
XButton1::Send("{Left}")    ; Mouse4 -> Left Arrow
XButton2::Send("{Right}")   ; Mouse5 -> Right Arrow
MButton::Send("{Space}")    ; Mouse3 (Middle) -> Space
#HotIf

; Screenbox -> Use mouse buttons to navigate (holding down the button repeats the actions)
#HotIf WinActive("ahk_exe ApplicationFrameHost.exe")
XButton1:: {
    while GetKeyState("XButton1", "P") {
        Send "+{Left}"
        Send "+{Left}"
        Sleep 200
    }
    return
}

XButton2:: {
    while GetKeyState("XButton2", "P") {
        Send "+{Right}"
        Send "+{Right}"
        Sleep 200
    }
    return
}
#HotIf

; Remapping apps key/copilot key to right ctrl (remapping in power toys is better so this is disabled)
; AppsKey::RCtrl
; #+F23::RCtrl

; Remapping keys for the surface laptop (not needed on Aura)
; F9::Home    ; F9 -> Home (for surface laptop)
; F10::End    ; F10 -> End (for surface laptop)
; F11::PgUp   ; F11 -> Page Up (for surface laptop)
; F12::PgDn   ; F12 -> Page Down (for surface laptop)

; !F8::F8     ; Alt+F8 -> F8
; !F9::F9     ; Alt+F9 -> F9
; !F10::F10   ; Alt+F10 -> F10
; !F11::F11   ; Alt+F11 -> F11
; !F12::F12   ; Alt+F12 -> F12

; Copy and paste with 1 key for jira pasting labels (2025-05-07)
;c::Send("^c")
;v::{
;    Send("^v")
;    Sleep(100)
;    Send("^+q")
;    Sleep(100)
;    Send("{Enter}")
;    return
;}
;a::{
;}

; This part makes sure this script is running as admin
full_command_line := DllCall("GetCommandLine", "str")
; msgBox "A_IsAdmin: " A_IsAdmin "`nCommand line: " full_command_line ; For Debugging
if not (A_IsAdmin or RegExMatch(full_command_line, " /restart(?!\S)")) {
    try
    {
        if (A_IsCompiled) {
            Run '*RunAs "' A_ScriptFullPath '" /restart'
        } else {
            Run '*RunAs "' A_AhkPath '" /restart "' A_ScriptFullPath '"'
        }
    }
    ExitApp
}

; Reload Script on Save
~^s:: {
    if (WinActive("General.ahk")) ; if active window's title contains "General.ahk"
    {
        Sleep(200)
        Reload
    }
    return
}
; #endregion 🟥 Globals & AHK Stuff

; alt + shift + q = quit application forcefully
!+q::
{
    ; Get the Process ID (PID) of the active window ("A")
    pid := WinGetPID("A")

    ; Check if a valid PID was retrieved
    if (pid)
    {
        ; Forcefully close the process with that PID.
        ; This will close all windows associated with that application.
        ProcessClose(pid)
    }
}

; alt + shift + q = quit application safely (?)
; !+q::
; {
;     ; Get the executable name (e.g., "chrome.exe") of the active window ("A")
;     exeName := WinGetProcessName("A")

;     ; Check if a valid name was retrieved
;     if (exeName)
;     {
;         ; Send the "Close" command to all windows associated
;         ; with that executable name.
;         WinClose("ahk_exe " exeName)
;     }
; }

; alt + q = close window
!q::!f4

; win + c = end task in terminals (like mac)
#c::^c
; win + v = open clipdiary instead of opening windows clipboard
#v::^`

; alt + left arrow = home
!Left::Home

; alt + shift + left arrow = shift + home
!+Left::+Home

; alt + right arrow = end
!Right::End

; alt + shift + right arrow = shift + end
!+Right::+End

; capslock = delete
capslock::delete

; #region 🟩 Auto Scroll
; Change Tray Icon based on Auto Scroll
if (fileExist(pausedIcon) and fileExist(runningIcon)) {
    traySetIcon(pausedIcon, 1)
} else {
    msgBox("Couldn't find icons")
    Exit
}

; Start Auto Scroll
#HotIf (!WinActive("ahk_exe cs2.exe"))
^!e:: {
    global autoScrollToggle := true
    SoundBeep 200, 600
    traySetIcon(runningIcon, 1)
    loopScroll()
}

; End Auto Scroll
^!w:: {
    global autoScrollToggle := false
    SoundBeep 500, 600
    reload
    ;traySetIcon(pausedIcon, 1)
}
#HotIf

 loopScroll() {
    while (autoScrollToggle) {
        rand := Random(26000, 30000)
        ; rand := Random(2000, 4000) ; For Debugging
        Sleep(rand)
        Click("WheelDown")
        Sleep(20)
        Click("WheelUp")
    }
}
; #endregion 🟩 Auto Scroll

; #region 🟩 Auto Click
; Start Auto Click
^!r:: {
    SoundBeep(500, 100)
    SoundBeep(500, 100)
    global autoClickToggle := true
    loopClick()
}

loopClick() {
    while (autoClickToggle) {
        Sleep(2000)
        Click()
    }
}
; #endregion 🟩 Auto Scroll

; #region 🟦 Productivity Section (Browsers, Notion, Slack, VSCode, Affinity Photo)

; Enter date when hitting ctrl+alt+t
^!+d:: {
    TimeString := FormatTime(, "yyyy-MM-dd ")
    Send(TimeString)
    return
}

; If window is Adobe, Use middle button as an equivalent of hand tool
#HotIf (WinActive("ahk_exe Photoshop.exe") or WinActive("ahk_exe Illustrator.exe"))
MButton:: {
    Send("{Space Down}{LButton Down}")
    Keywait("MButton")
    Send("{LButton Up}{Space Up}")
}
#HotIf

; Slack -> Change HotKeys
#HotIf WinActive("ahk_exe slack.exe")
^+f:: Send("^{g}")  ; ctrl+shift+f -> Search everywhere
^t:: Send("^{g}")   ; ctrl+t -> Go to person/channel
#HotIf

; Notion (app and browser) -> Change HotKeys
#HotIf (WinActive("ahk_exe notion.exe") or WinActive("ahk_exe brave.exe"))
!up:: Send("+^{Up}")        ; alt+up -> ctrl+shift+up Shifts blocks
!down:: Send("+^{Down}")    ; alt+down -> ctrl+shift+down Shifts blocks
^+f:: Send("^{k}")          ; ctrl+shift+f -> ctrl+k Finds a file
#HotIf

; VS Code & Browsers -> Scroll tabs with alt and scrollwheel
#HotIf (WinActive("ahk_exe msedge.exe") or
WinActive("ahk_exe brave.exe") or
WinActive("ahk_exe chrome.exe") or
WinActive("ahk_exe firefox.exe") or
WinActive("ahk_exe Code.exe") or
WinActive("ahk_exe SourceTree.exe") or
WinActive("ahk_exe vivaldi.exe") or
WinActive("ahk_exe Cursor.exe") or
WinActive("ahk_exe Windsurf.exe"))

    ^!WheelUp:: Send("^{PgUp}")      ; alt+wheelup   -> ctrl+pageup  -> prev tab
    ^!WheelDown:: Send("^{PgDn}")    ; alt+wheeldown -> ctrl+pageup  -> next tab
    !x:: Send("^{F4}")              ; alt+x         -> ctrl+f4      -> close tab
    !z:: Send("+^{t}")              ; alt+z         -> ctrl+shift+t -> reopen tab

#HotIf

#HotIf (WinActive("ahk_exe msedge.exe"))
^q:: { ; delete in notion with ctrl + q
    Send("{Escape}")
    Send("{Del}")
}
#HotIf

; Edge and Brave -> shift+mwheel to scroll sideways on Asana and other sites that don't support shift+scroll
#HotIf (WinActive("ahk_exe msedge.exe") or WinActive("ahk_exe brave.exe"))
+WheelUp:: Send("{WheelLeft}")
+WheelDown:: Send("{WheelRight}")
#HotIf

; #endregion 🟦 Productivity Section (Browsers, Notion, Slack, VSCode)
