# Setup script for Gemini API integration (PowerShell Version)
Write-Host "🔧 Setting up Gemini API integration for Learning Buddy..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "📝 Creating .env file from template..." -ForegroundColor Yellow
    Copy-Item "config.env.example" ".env"
    Write-Host "✅ .env file created" -ForegroundColor Green
}
else {
    Write-Host "✅ .env file already exists" -ForegroundColor Green
}

# Check if Gemini API key is configured
$envContent = Get-Content ".env" -Raw
if ($envContent -match "your-gemini-api-key-here") {
    Write-Host ""
    Write-Host "⚠️  WARNING: Gemini API key not configured!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "To use the real Gemini API, you need to:" -ForegroundColor White
    Write-Host "1. Get a Gemini API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Gray
    Write-Host "2. Edit the .env file and replace 'your-gemini-api-key-here' with your actual API key" -ForegroundColor Gray
    Write-Host "3. Restart the application" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Example:" -ForegroundColor White
    Write-Host "GEMINI_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" -ForegroundColor Gray
    Write-Host ""
}
else {
    Write-Host "✅ Gemini API key appears to be configured" -ForegroundColor Green
}

# Check if @google/generative-ai is installed
try {
    $package = npm list @google/generative-ai 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ @google/generative-ai package is installed" -ForegroundColor Green
    }
    else {
        throw "Package not found"
    }
}
catch {
    Write-Host "📦 Installing @google/generative-ai package..." -ForegroundColor Yellow
    npm install @google/generative-ai
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ @google/generative-ai installed successfully" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Failed to install @google/generative-ai" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "🎉 Gemini API setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor White
Write-Host "1. Get your Gemini API key from: https://makersuite.google.com/app/apikey" -ForegroundColor Gray
Write-Host "2. Update the GEMINI_API_KEY in your .env file" -ForegroundColor Gray
Write-Host "3. Run 'npm run dev' to start the application" -ForegroundColor Gray
Write-Host ""
Write-Host "The application will now use the real Gemini API instead of mock responses!" -ForegroundColor Cyan



