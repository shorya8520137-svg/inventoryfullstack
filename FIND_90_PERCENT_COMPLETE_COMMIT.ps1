# FIND 90% COMPLETE COMMIT
Write-Host "SEARCHING FOR 90% COMPLETE COMMIT" -ForegroundColor Green
Write-Host "=================================="

$SERVER_IP = "13.48.248.180"
$SSH_KEY = "C:\Users\Admin\awsconection.pem"

Write-Host "1. Searching for commits with '90%' or 'complete' keywords..." -ForegroundColor Cyan
$completionCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline --grep='90' --grep='complete' --grep='finished' --grep='done' --grep='ready' -i"

Write-Host "Commits mentioning completion:"
Write-Host $completionCommits

Write-Host ""
Write-Host "2. Searching for commits with 'percent' or '%'..." -ForegroundColor Cyan
$percentCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline --grep='percent' --grep='%' -i"

Write-Host "Commits mentioning percentages:"
Write-Host $percentCommits

Write-Host ""
Write-Host "3. Searching recent commits for completion status..." -ForegroundColor Cyan
$recentCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline -20"

Write-Host "Recent 20 commits:"
Write-Host $recentCommits

Write-Host ""
Write-Host "4. Searching for commits with 'phase' or 'final'..." -ForegroundColor Cyan
$phaseCommits = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && git log --oneline --grep='phase' --grep='final' --grep='deployment' -i"

Write-Host "Phase/Final commits:"
Write-Host $phaseCommits

Write-Host ""
Write-Host "5. Looking for specific completion files..." -ForegroundColor Cyan
$completionFiles = ssh -i $SSH_KEY ubuntu@$SERVER_IP "cd ~/inventoryfullstack && find . -name '*COMPLETE*' -o -name '*FINAL*' -o -name '*READY*' | head -10"

Write-Host "Completion-related files:"
Write-Host $completionFiles