
;; Windows+F5 to Sleep PC
; $^+':: {
;     Send("#{x}")
;     Sleep 250
;     Send("{Up}")
;     Sleep 250
;     Send("{Up}")
;     Sleep 250
;     Send("{Right}")
;     Sleep 250
;     Send("{Down}")
;     Sleep 250
;     Send("{Enter}")
; }
''
; get name of window under cursor
; SetTimer WatchCursor, 100
; WatchCursor()
; {
; 	MouseGetPos , , &id, &control
; 	ToolTip
; 	(
; 		"ahk_id " id "
;         ahk_class " WinGetClass(id) "
;         " WinGetTitle(id) "
;         Control: " control
; 	)
; }
''
; #IfWinActive, "ahk_exe DeadByDaylight-Win64-Shipping.exe"
; SetKeyDelay , 200
; ~XButton1::
; Loop
; {
; 	if not GetKeyState("XButton1", "P")
; 		break
; 	Sleep , 175
; 	Send {
; 		space
; 	}
; }
; return

; ~XButton2::
; Loop
; {
; 	Send {
; 		a Down
; 	} {
; 		a Up
; 	}
; 	Sleep , 175
; 	Send {
; 		d Down
; 	} {
; 		d Up
; 	}
; } until !GetKeyState("XButton2", "P")
; return
; #IfWinActive
''
; #IfWinActive, ahk_exe Hades.exe
; dBug_active := 1
; ~$RButton::
; Loop
; {
; 	if not GetKeyState("RButton", "P") {
; 		break
; 		; MsgBox, 64, Debug , Debug marker #%dBug_count%, 5
; 	}
; 	Send {
; 		j
; 	}
; 	Sleep , 200
; }
; return
; #IfWinActive
''
; If (WinActive("ahk_exe nioh.exe")) {
; 	~XButton1:: o
; 	~XButton2:: p
; }
''
;Sound on copy/cut/paste (don't need it cuz clipdiary does it)
; ~^x::
; ~^c::
; SoundBeep, 2000, 200
; return
; ~^v::
; SoundBeep, 1000, 200
; return
''
;Fix Double Clicking middle mouse button:
;~XButton1:: return	; Automatically Sets A_PriorHotkey.
;#If A_PriorHotkey != "" && A_TimeSincePriorHotkey < 200
;XButton1:: return
;SoundPlay *-1  ; play sound to indicate that 2nd click was blocked
;return ; Block hotkey.
; ~LButton::return  ; Automatically Sets A_PriorHotkey.
; #If A_PriorHotkey != "" && A_TimeSincePriorHotkey < 200
; LButton:: SoundPlay *-1
; return
''
; #If not ( WinActive("ahk_exe code.exe") or WinActive("ahk_exe devenv.exe") or WinActive("ahk_exe studio64.exe") or WinActive("ahk_exe Ssms.exe") or WinActive("ahk_exe Notion.exe") or WinActive("ahk_exe MailClient.exe"))
; Making ctrl+q delete current line/field in chrome (like in vscode)
; ^Q::DeleteCurrentLine()
; ^q::{
; ; Send, {End}
; ; Send, +{Home}
; ; Send, {Delete}
; ; Send, {Backspace}
; }
; ^q::
;     SendInput {End}
;     SendInput +{Home}
;     ; SendInput ^+{Left}
;     SendInput {Delete}
; return
; #IfWinActive
''
; Alt tab to the browser and refresh after saving in vscode
; ~!^S::
; Send, !{TAB}
; Sleep, 200
; Send, {F5}
; Sleep, 100
; Send, !{TAB}
; Return
''
; For running reload browser on every save, disabled cuz don't need it on vs 2019
; ^s::
; {
;     Send, ^s
;     Send, ^!{Enter}
; }
; return
''
;WheelUp::
;    if( GetKeyState("F13") ) {
;        Send, {Volume_Up}
;        Send, {Volume_Up}
;    }
;    else if ( GetKeyState("XButton2") ) {
;        send, {x}
;    }
;    else {
;        Send, {WheelUp}
;    }
;Return
''
;WheelDown::
;    if( GetKeyState("F13") ) {
;        Send, {Volume_Down}
;        Send, {Volume_Down}
;    }
;    else if ( GetKeyState("XButton2") ) {
;        send, {z}
;    }
;    else {
;        Send, {WheelDown}
;    }
;Return
''
; Media_Play_Pause::
;     if(GetKeyState("F13")) {

;     } else {
;         Send, {Media_Play_Pause}
;     }
; return

; ~F9::F13
''
; Auto-Reload AutoHotkey when .ahk file is saved
; http://prxbx.com/forums/showthread.php?tid=1181
; Modified 2009-12-09 11:32:17 by Luke Scammell - luke {at} scammell [dot] co (.) uk
; Modified to match any window with .ahk in the title, meaning it will update other scripts as well and from other programs like Notepad++ :)
; $^s::
; SetTitleMatchMode, 2
; IfWinActive, .ahk
; {
;   Send, ^s
;   SplashTextOn,,,Updated script,
;   Sleep,500
;   SplashTextOff
;   Reload
; }
; else
;   Send, ^s
; return
''
;#IfWinNotActive ahk_exe code.exe ; old way to check if window active.
;If WinNotActive is better looking and you can use && or ||
''
;;;;;;;;; COMMENTED STUFF:
;XButton2::Send, ^{F8}
;^+SPACE::  Winset, Alwaysontop, , A
; #^d::Send("{LWin down}{LCtrl down}{Right}{LWin up}{LCtrl up}" ;go to next desktop
; #^a::Send("{LWin down}{LCtrl down}{Left}{LWin up}{LCtrl up}" ;go to prev desktop
;#`::Send, +{F10}M{Enter} ;;move window to next desktop
; -------------------------------------------------------------------------------

; ------------------------------------------------------------------------------/

; DeleteCurrentLine() {
;     SendInput {End}
;     SendInput +{Home}
;     If get_SelectedText() := "" {
;         ; On an empty line.
;         SendInput {Delete}
;     } Else {
;         SendInput ^+{Left}
;         SendInput {Delete}
;     }
; }

; get_SelectedText() {

;     ; See if selection can be captured without using the clipboard.
;     WinActive("A")
;     ControlGetFocus ctrl
;     ControlGet selectedText, Selected,, %ctrl%

;     ; If not, use the clipboard as a fallback.
;     If (selectedText := "") {
;         originalClipboard := ClipboardAll ; Store current clipboard.
;         Clipboard := ""
;         SendInput ^c
;         sleep, 200
;         ; ClipWait, 0.2
;         selectedText := ClipBoard
;         ClipBoard := originalClipboard
;     }

;     Return selectedText
; }

; make ctrl+d duplicate line in SQL
; #IfWinActive ahk_exe Ssms.exe
; ^d::
;     ; save clipboard
;     Send ^c
;     ClipWait
;     Send ^v
; ;    Send ^v
;     return
; #IfWinActive

; t := 0
; ::
; t := !t
; While Toggle{

; }
; return

; clickmonster:
;     Click WheelDown
;     Click WheelDown
;     Click WheelDown
;     Click WheelDown
;     Click WheelDown
;     Click WheelDown
;     Sleep 20
; 	Click down
; 	Sleep 20
; 	Click up
; 	Random, rand, 4000, 8000
; 	Sleep % rand
; return

; ; toggles clickmonster on/off @ 250ms interval
; +!g::settimer clickmonster, % (clickmonster := !clickmonster) ? "on" : "off"

; #IfWinActive, ahk_exe
; key2send := x ;<-- change this key to the key you want to actually send
; timerval := -5000 ;<-- change this to the the timer interval you want
;     ; make sure it is a negative number!
; winname := Marvel

; gosub Timer5s
; Return

; Timer5s:
;     IfWinExist, %winname%
;     {
;         ControlSend,,%key2send%, %winname%
;         Sleep 500
;     }
;     SetTimer, Timer5s, %timerval%
;     Return
; #IfWinActive


; No need for this since power toys has a module for it
;^+SPACE:: { ; Set current window to be always on top (ctrl + shift + space)
;	WinSetAlwaysOnTop -1, "A"
;	SoundBeep 200, 200
;}