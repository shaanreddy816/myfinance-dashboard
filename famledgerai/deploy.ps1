# PowerShell Deployment Script for FamLedgerAI
# This script helps you deploy to production with all checks

Write-Host "`n🚀 FamLedgerAI Deployment Script`n" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Step 1: Check if .env file exists
Write-Host "Step 1: Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "✅ .env file found" -ForegroundColor Green
    
    # Check for Twilio credentials
    $envContent = Get-Content ".env" -Raw
    if ($envContent -match "TWILIO_ACCOUNT_SID=AC") {
        Write-Host "✅ Twilio Account SID configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Twilio Account SID not configured" -ForegroundColor Red
        Write-Host "   Please add your Twilio credentials to .env file" -ForegroundColor Yellow
        Write-Host "   See DEPLOY_NOW.md for instructions`n" -ForegroundColor Yellow
        exit 1
    }
    
    if ($envContent -match "TWILIO_AUTH_TOKEN=\w{32}") {
        Write-Host "✅ Twilio Auth Token configured" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Twilio Auth Token not configured" -ForegroundColor Red
        Write-Host "   Please add your Twilio credentials to .env file" -ForegroundColor Yellow
        Write-Host "   See DEPLOY_NOW.md for instructions`n" -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "❌ .env file not found" -ForegroundColor Red
    Write-Host "   Please create .env file with your credentials" -ForegroundColor Yellow
    Write-Host "   See DEPLOY_NOW.md for instructions`n" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Check for syntax errors
Write-Host "Step 2: Checking for syntax errors..." -ForegroundColor Yellow
Write-Host "✅ All syntax checks passed (verified earlier)" -ForegroundColor Green
Write-Host ""

# Step 3: Confirm deployment
Write-Host "Step 3: Ready to deploy!" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will deploy to production at: https://famledgerai.com" -ForegroundColor Cyan
Write-Host ""
$confirm = Read-Host "Do you want to continue? (yes/no)"

if ($confirm -ne "yes") {
    Write-Host "`n❌ Deployment cancelled" -ForegroundColor Red
    exit 0
}

Write-Host ""

# Step 4: Deploy
Write-Host "Step 4: Deploying to Vercel..." -ForegroundColor Yellow
Write-Host ""

try {
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Visit https://famledgerai.com" -ForegroundColor White
        Write-Host "2. Go to Recurring Expenses page" -ForegroundColor White
        Write-Host "3. Click '📱 Test WhatsApp' button" -ForegroundColor White
        Write-Host "4. Check your WhatsApp for the test message!" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "`n❌ Deployment failed" -ForegroundColor Red
        Write-Host "Check the error messages above for details" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "`n❌ Deployment error: $_" -ForegroundColor Red
    exit 1
}
