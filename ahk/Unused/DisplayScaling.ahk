#Persistent ; Script continually runs
#SingleInstance force ; If script is run a second time, it restart the instance already running

DetectHiddenWindows, On
;Allows you to hide the CMD window. If you won't be hiding your CMD window, then no need to add this line.

SetRegView 64
;Sets the registry view used by RegRead, allowing it in a 32-bit script to access the 64-bit registry view and vice versa.

^+!p:: ; the toggle key
RunWait, %ComSpec% /c  %windir%\System32\DpiScaling.exe ; launch Settings -> Display
RegRead, CurrentDPI, HKEY_CURRENT_USER\Control Panel\Desktop\PerMonitorSettings\SAM73A216780800_01_07E7_42^3732CFBC7303067BD05BE8FDAE2B9FBD, DpiValue ; Determine the current scaling setting.

Sleep, 750 ; Time to wait in milliseconds for the Display Settings window to appear
if CurrentDPI = 4294967289 ; was 0 ; Setting of 100%
{
    Send, {Tab 3}{Down}!{F4} ; Tab key is pressed three times, then Down Arrow, and then close the Display Settings window
    Return
}
else if CurrentDPI = 4294967293 ; was 1 ; Setting of 125%
{
     Send, {Tab 3}{Up}!{F4} ; Tab key is pressed three times, then Up Arrow, and then close the Display Settings window
     Return
}
else
{
    MsgBox, "Current Scaling DPI is neither 100`% nor 125`%. The current value is %CurrentDPI%."" ; 100% = 0, 125% = 1, 150% = 2, 175% = 3, 200% = 4, 225% = 6, and so on.
    Return
}