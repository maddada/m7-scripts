#SingleInstance Force
#Warn	; Enable warnings to assist with detecting common errors.

timexd := 1000

wheelDown:: {
if ((A_PriorKey = "wheelUp" || A_PriorKey = "wheelDown") 
&& 	(A_TickCount - wheelUpPreviousTick < timexd || A_TickCount - wheelDownPreviousTick < timexd)
&& (wheelUpCount >= 2 || wheelDownCount >= 2))
{
	send %A_ThisHotkey%
	; this line just makes it easier to continually scroll
	; so you dont have to worry about the 400 ms timeout occurring and hence 
	; requiring you to scroll the wheel 2 times again to activate it

	; also it allows you to instantly scroll up (without the 2 dead movements)
	; if you were previously scrolling down
	wheelDownPreviousTick :=  wheelUpPreviousTick := A_TickCount 
}
else
{
	if (A_TickCount - %A_ThisHotkey%PreviousTick < timexd)
		%A_ThisHotkey%Count++
	else 
		%A_ThisHotkey%Count := 1
	%A_ThisHotkey%previousTick := A_TickCount
}
return
}