# Setup Logging Directory Structure for Learning Buddy (PowerShell Version)
# Creates necessary directories and files for comprehensive logging

Write-Host "🔧 Setting up logging infrastructure for Learning Buddy..." -ForegroundColor Cyan

# Create logs directory
if (-not (Test-Path "logs")) {
    New-Item -ItemType Directory -Path "logs" -Force
    Write-Host "✅ Created logs directory" -ForegroundColor Green
}

# Create log files
$logFiles = @(
    "logs/application.log",
    "logs/telemetry.log", 
    "logs/metrics.json",
    "logs/health.json"
)

foreach ($file in $logFiles) {
    if (-not (Test-Path $file)) {
        New-Item -ItemType File -Path $file -Force
        Write-Host "✅ Created $file" -ForegroundColor Green
    }
}

# Create a sample log entry
$timestamp = Get-Date -Format "yyyy-MM-ddTHH:mm:ss.fffZ"
$logEntry = @{
    timestamp = $timestamp
    level = "info"
    category = "setup"
    message = "Logging infrastructure initialized"
    data = @{
        setupTime = Get-Date
        version = "1.0.0"
    }
    sessionId = "setup-session"
    userId = $null
    requestId = "setup-req"
} | ConvertTo-Json -Depth 3

Set-Content -Path "logs/application.log" -Value $logEntry

# Create a sample telemetry entry
$telemetryEntry = @{
    timestamp = $timestamp
    level = "info"
    category = "telemetry"
    message = "Telemetry logging initialized"
    sessionId = "setup-session"
    userId = $null
    requestId = "setup-req"
    metadata = @{
        userAgent = "setup-script"
        url = "server"
        performance = @{}
    }
} | ConvertTo-Json -Depth 3

Set-Content -Path "logs/telemetry.log" -Value $telemetryEntry

# Create initial metrics file
$metricsData = @{
    timestamp = $timestamp
    logs = @{
        total = 1
        byLevel = @{
            info = 1
        }
        byCategory = @{
            setup = 1
        }
    }
    performance = @{}
    memory = @{}
    errors = 0
} | ConvertTo-Json -Depth 3

Set-Content -Path "logs/metrics.json" -Value $metricsData

# Create initial health check file
$healthData = @{
    timestamp = $timestamp
    status = "healthy"
    checks = @{
        logging = @{
            status = "healthy"
            logsInMemory = 0
            lastLogTime = $null
        }
        fileSystem = @{
            status = "healthy"
        }
        memory = @{
            status = "healthy"
            heapUsed = 0
            heapTotal = 0
            usage = "0%"
        }
        performance = @{
            status = "healthy"
            metrics = @{}
        }
    }
} | ConvertTo-Json -Depth 3

Set-Content -Path "logs/health.json" -Value $healthData

Write-Host ""
Write-Host "✅ Logging infrastructure setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📁 Created directories and files:" -ForegroundColor White
Write-Host "   - logs/application.log (main application logs)" -ForegroundColor Gray
Write-Host "   - logs/telemetry.log (telemetry data)" -ForegroundColor Gray
Write-Host "   - logs/metrics.json (performance metrics)" -ForegroundColor Gray
Write-Host "   - logs/health.json (health check results)" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 To view logs in a browser, open: log-viewer.html" -ForegroundColor Cyan
Write-Host "📊 To run Firebase tests, open: test-firebase.html" -ForegroundColor Cyan
Write-Host "🧪 To run integration tests, execute: .\run-tests.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Logging configuration:" -ForegroundColor White
Write-Host "   - JSON format for structured logging" -ForegroundColor Gray
Write-Host "   - Multiple output destinations (file + console)" -ForegroundColor Gray
Write-Host "   - Real-time metrics collection" -ForegroundColor Gray
Write-Host "   - Health monitoring" -ForegroundColor Gray
Write-Host "   - Telemetry tracking" -ForegroundColor Gray
Write-Host ""
Write-Host "🔍 Log levels available: error, warn, info, debug, trace" -ForegroundColor Yellow
Write-Host "📂 Log categories: auth, database, api, performance, security" -ForegroundColor Yellow



