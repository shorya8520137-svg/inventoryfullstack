# Automated Database Analysis Runner
# PowerShell script to install dependencies and run the analysis

Write-Host "🚀 Starting Automated Database Analysis..." -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Yellow

Write-Host "📦 Installing required dependencies..." -ForegroundColor Cyan
try {
    npm install ssh2 --save-dev
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n🔍 Running automated database analysis..." -ForegroundColor Cyan
try {
    node automated-database-analysis.js
    Write-Host "`n✅ Analysis completed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Analysis failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host "`n📊 Check the results above and the generated files:" -ForegroundColor Yellow
Write-Host "  - database-analysis-report.json (detailed analysis)" -ForegroundColor White
Write-Host "  - Console output shows categorized tables and recommendations" -ForegroundColor White

Write-Host "`n🎯 Next: The audit system has been set up automatically!" -ForegroundColor Green
Read-Host "Press Enter to continue..."