CheckTime() {
    currentTime := FormatTime("HH:mm")
    if (currentTime = "9:31 AM Saturday, May 17, 2025") {
        Click
    }
}

CheckTime()
SetTimer(CheckTime, 10000)