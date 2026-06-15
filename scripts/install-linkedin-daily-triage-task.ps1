param(
    [string]$TaskName = "LinkedIn Daily Triage",
    [string]$At = "08:00"
)

$ErrorActionPreference = "Stop"

$scriptPath = Join-Path $PSScriptRoot "linkedin-daily-triage.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing script: $scriptPath"
}

$powershellPath = (Get-Command powershell.exe).Source
$action = New-ScheduledTaskAction -Execute $powershellPath -Argument "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings -Description "Opens LinkedIn messages/connections and creates a private daily triage review file. Drafting and sending remain human-approved." -Force | Out-Null

Write-Host "Scheduled task installed: $TaskName at $At daily."
Write-Host "This opens LinkedIn and a private review file. It does not auto-send messages."
