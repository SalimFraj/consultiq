param(
    [string]$ReviewRoot = ""
)

$ErrorActionPreference = "Stop"

$workspaceRoot = Split-Path -Parent $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($ReviewRoot)) {
    $ReviewRoot = Join-Path $workspaceRoot "outreach_daily_reviews"
}

New-Item -ItemType Directory -Force -Path $ReviewRoot | Out-Null

$today = Get-Date -Format "yyyy-MM-dd"
$reviewFile = Join-Path $ReviewRoot "$today-linkedin-triage.md"

if (-not (Test-Path -LiteralPath $reviewFile)) {
    $content = @"
# LinkedIn Daily Triage - $today

Private working file. Do not commit.

## Scope

- Check new inbound LinkedIn messages.
- Check newly accepted connections.
- Draft replies and first messages.
- Do not send anything until Salim explicitly approves the exact text.
- Before sending, verify the thread does not already contain the same or a prior outgoing message.

## Open Pages

- Messages: https://www.linkedin.com/messaging/
- Connections: https://www.linkedin.com/mynetwork/invite-connect/connections/

## New Inbound Messages

Paste new message context here.

### Draft Replies

- Person:
- Context:
- Recommended reply:
- Duplicate check:
- Send status:

## New Connections

Paste new connection names, profile URLs, headlines, and useful profile/activity notes here.

### Draft First Messages

- Person:
- Profile signal:
- Recommended message:
- Duplicate check:
- Send status:

## Quality Check

Use this before sending:

- Is it specific to their profile or message?
- Does it ask one clear, easy-to-answer question when a response is useful?
- Does it avoid sounding desperate, transactional, or referral-first?
- Does it avoid repeating ConsultIQ unless directly relevant?
- Has the thread been checked for an existing message from Salim?

## Codex Prompt

Use this after reviewing LinkedIn:

```text
Check the pasted LinkedIn messages and connections below. Draft concise, tailored replies/openers. Prioritize relationship-first messages, avoid duplicate outreach, and tell me which ones to send or skip.
```
"@
    Set-Content -LiteralPath $reviewFile -Value $content -Encoding UTF8
}

$urls = @(
    "https://www.linkedin.com/messaging/",
    "https://www.linkedin.com/mynetwork/invite-connect/connections/"
)

foreach ($url in $urls) {
    Start-Process $url
}

Start-Process $reviewFile

Write-Host "LinkedIn daily triage opened."
Write-Host "Review file: $reviewFile"
