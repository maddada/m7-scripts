; All Apps -> Disable Insert and Delete for copying/pasting
; ^Insert::return ; using this in ShareX
; +Insert::return ; using this in ShareX

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
CapsLock::Del
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
