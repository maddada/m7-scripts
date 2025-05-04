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

AppsKey::RCtrl
#+F23::RCtrl

F9::Home    ; F9 -> Home (for surface laptop)
F10::End    ; F10 -> End (for surface laptop)
F11::PgUp   ; F11 -> Page Up (for surface laptop)
F12::PgDn   ; F12 -> Page Down (for surface laptop)

!F8::F8     ; Alt+F8 -> F8
!F9::F9     ; Alt+F9 -> F9
!F10::F10   ; Alt+F10 -> F10
!F11::F11   ; Alt+F11 -> F11
!F12::F12   ; Alt+F12 -> F12

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

; All Apps -> Disable Insert and Delete for copying/pasting
; ^Insert::return ; using this in ShareX
; +Insert::return ; using this in ShareX

; #endregion 🟦 Productivity Section (Browsers, Notion, Slack, VSCode)

; #region 🟨 DaveTheDiverk
#HotIf (WinActive("ahk_exe DaveTheDiver.exe"))
; msgBox("daveactive: " WinActive("ahk_exe DaveTheDiver.exe"))
XButton1::h
XButton2::j
; wheelDown::Send("{Blind}{k}")
; wheelUp::Send("{Blind}{k}")
#HotIf
; #endregion 🟨 DaveTheDiver

; #region 🟨 CSGO (Binds & Fix Mis-jump)
#HotIf WinActive("ahk_exe cs2.exe")
; Disable Insert Key Taking ShareX Screenshots in CSGO (used to buy awp instead)
Insert::F7

; Fix Scroll Jumping by Mistake in CSGO
; global timeSinceLastScroll := 2000
; global wheelDownCount := 0
; global wheelDownPreviousTick := 0

; wheelDown:: {
;     global
;     if ((A_PriorKey = "wheelDown")
;         && (A_TickCount - wheelDownPreviousTick < timeSinceLastScroll)
;         && (wheelDownCount >= 1))
;     {
;         Send("{wheelDown}")
;     }
;     else
;     {
;         if (A_TickCount - wheelDownPreviousTick < timeSinceLastScroll)
;             wheelDownCount++
;         else wheelDownCount := 1
;             wheelDownPreviousTick := A_TickCount
;     }
;     return
; }
#HotIf
; #endregion 🟨 CSGO

; 6af
; Desktop -> Toggles Auto Hide Taskbar by middle clicking on taskbar
; Might need to click on a window then the taskbar
; IsMouseOverTaskbar() {
;     MouseGetPos(&x, &y) ; msgBox "WinTitle: " WinTitle " \nWin: " Win ; For Debugging ; msgBox y > 1300
;     return y > 1435
; }
; #HotIf (IsMouseOverTaskbar() = true)
;     MButton:: {
;         CoordMode "Mouse", "Screen"
;         MouseGetPos &startX, &startY
;         ; Close Settings if it's already open
;         if (WinExist("Settings")) {
;             WinActivate("Settings")
;             Sleep(300)
;             Send("!{F4}")
;             Sleep(300)
;         }
;         ; Open Taskbar Settings
;         Run("ms-settings:taskbar")
;         Sleep(250)
;         ; Check if it was opened then go do the keyboard actions to disable
;         if (WinExist("Settings")) {
;             WinActivate("Settings")
;             ;4xshift+tab space tab tab space
;             Sleep(250)
;             Send("+{Tab}")
;             Sleep(250)
;             Send("+{Tab}")
;             Sleep(250)
;             Send("+{Tab}")
;             Sleep(250)
;             Send("+{Tab}")
;             Sleep(250)
;             Send("{Space}")
;             Sleep(250)
;             Send("{Tab}")
;             Sleep(250)
;             Send("{Tab}")
;             Sleep(250)
;             Send("{Space}")
;             Sleep(250)
;             if (WinActive("Settings"))
;                 Send("!{F4}")
;             Sleep(250)
;             Click("3600 1620") ; 32:9 5140x1440
;             MouseMove(startX, startY)
;         }
;     }
; #HotIf

; #HotIf WinActive("ahk_exe Photo.exe")
;     LAlt::LCtrl
;     LCtrl::LAlt
; #HotIf

; Desktop -> Toggles Night light with PrintScreen (FN+Ins on Deathstalker)
CapsLock::NumpadEnter
;PrintScreen:: {
;    CoordMode "Mouse", "Screen"
;    MouseGetPos &startX, &startY
;    Send("#{a}")
;    Sleep(300)	; change this if it doesn't work
;    ; Click("1845 745") ; 16:9 1920x1080
;    ; Click("3355 1100") ; 21:9 3440x1440
;    Click("4920 1110") ; 32:9 5140x1440
;    SoundBeep(500, 50)
;    Sleep(10)
;    Send("#{a}")
;    MouseMove(startX, startY)
;}
