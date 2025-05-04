; ^ctrl !alt +shift #windows
; #region Reference {Ctrl} {Ctrl down} {Ctrl up}
; + {Shift} {Shift down} {Shift up}
; ! {Alt} {Alt down} {Alt up} ; Send !a presses Alt+A
; # {LWin}
; Keep in mind that globals need to be declared here at the top of the file (before any return statements)
; Reference: https://lexikos.github.io/v2/docs/commands/Send.htm
; ^ {Ctrl} {Ctrl down} {Ctrl up}
; + {Shift} {Shift down} {Shift up}
; ! {Alt} {Alt down} {Alt up} ; Send !a presses Alt+A
; # {LWin}
reference := 'reference'	; ignore
; #endregion

#Warn
#SingleInstance Force
#MaxThreadsPerHotkey 2

F7:: {
    reload
}

F6:: {
    IB := InputBox("Please enter a number of votes to add.", "Number of Votes", "w200 h100")
    if IB.Result = "Cancel" {
        MsgBox "You entered " IB.Value " but then cancelled."
        return
    }
    
    i := 1
    maxd := Number(IB.Value)
    
    while i <= maxd {
        Send i "@sp.com"
        i := i + 1
        Sleep 600
        Send "{Enter}"
        Sleep 2500
    }
    
    i := 1
}
