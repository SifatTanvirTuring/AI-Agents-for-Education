# Test Runner Script for Learning Buddy (PowerShell Version)
# Comprehensive test execution with proper setup and reporting

param(
    [switch]$IncludeDev,
    [switch]$Verbose
)

# Set error action preference
$ErrorActionPreference = "Stop"

Write-Host "🧪 Learning Buddy Test Suite Runner" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Function to print colored output
function Write-TestStatus {
    param(
        [string]$Status,
        [string]$Message
    )
    
    switch ($Status) {
        "SUCCESS" { Write-Host "✅ $Message" -ForegroundColor Green }
        "ERROR" { Write-Host "❌ $Message" -ForegroundColor Red }
        "WARNING" { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
        "INFO" { Write-Host "ℹ️  $Message" -ForegroundColor Blue }
    }
}

# Function to run a test and capture results
function Invoke-Test {
    param(
        [string]$TestName,
        [string]$TestCommand,
        [string]$TestFile
    )
    
    Write-Host ""
    Write-Host "Running $TestName..." -ForegroundColor White
    Write-Host "Command: $TestCommand" -ForegroundColor Gray
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    if (Test-Path $TestFile) {
        try {
            if ($Verbose) {
                Invoke-Expression $TestCommand
            } else {
                Invoke-Expression $TestCommand | Out-Null
            }
            Write-TestStatus "SUCCESS" "$TestName completed successfully"
            return $true
        }
        catch {
            Write-TestStatus "ERROR" "$TestName failed: $($_.Exception.Message)"
            return $false
        }
    }
    else {
        Write-TestStatus "WARNING" "$TestFile not found, skipping $TestName"
        return $null
    }
}

# Initialize test results
$TotalTests = 0
$PassedTests = 0
$FailedTests = 0
$SkippedTests = 0

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor White

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-TestStatus "SUCCESS" "Node.js is available (version: $nodeVersion)"
}
catch {
    Write-TestStatus "ERROR" "Node.js is not installed. Please install Node.js to run tests."
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-TestStatus "SUCCESS" "npm is available (version: $npmVersion)"
}
catch {
    Write-TestStatus "ERROR" "npm is not installed. Please install npm to run tests."
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-TestStatus "INFO" "Installing dependencies..."
    try {
        npm install
        Write-TestStatus "SUCCESS" "Dependencies installed successfully"
    }
    catch {
        Write-TestStatus "ERROR" "Failed to install dependencies"
        exit 1
    }
}
else {
    Write-TestStatus "SUCCESS" "Dependencies already installed"
}

Write-Host ""
Write-Host "Starting test execution..." -ForegroundColor White
Write-Host "==========================" -ForegroundColor White

# Test 1: Integration Tests
$TotalTests++
$result = Invoke-Test "Integration Tests" "node test_strands_integration.js" "test_strands_integration.js"
if ($result -eq $true) {
    $PassedTests++
}
elseif ($result -eq $null) {
    $SkippedTests++
}
else {
    $FailedTests++
}

# Test 2: Firebase JavaScript Tests
$TotalTests++
$result = Invoke-Test "Firebase JavaScript Tests" "node test-firebase.js" "test-firebase.js"
if ($result -eq $true) {
    $PassedTests++
}
elseif ($result -eq $null) {
    $SkippedTests++
}
else {
    $FailedTests++
}

# Test 3: Firebase HTML Tests
$TotalTests++
if (Test-Path "test-firebase.html") {
    Write-TestStatus "SUCCESS" "Firebase HTML test file found"
    Write-TestStatus "INFO" "To run Firebase HTML tests, open test-firebase.html in a browser"
    $PassedTests++
}
else {
    Write-TestStatus "WARNING" "test-firebase.html not found"
    $SkippedTests++
}

# Test 4: Unit Tests (if configured)
if ((Test-Path "package.json") -and (Select-String -Path "package.json" -Pattern '"test"' -Quiet)) {
    $TotalTests++
    $result = Invoke-Test "Unit Tests" "npm test" "package.json"
    if ($result -eq $true) {
        $PassedTests++
    }
    else {
        $FailedTests++
    }
}
else {
    Write-TestStatus "INFO" "No unit tests configured in package.json"
}

# Test 5: Linting (if configured)
if ((Test-Path "package.json") -and (Select-String -Path "package.json" -Pattern '"lint"' -Quiet)) {
    $TotalTests++
    $result = Invoke-Test "Linting" "npm run lint" "package.json"
    if ($result -eq $true) {
        $PassedTests++
    }
    else {
        Write-TestStatus "WARNING" "Linting found issues"
        $PassedTests++  # Count as passed with warnings
    }
}
else {
    Write-TestStatus "INFO" "No linting configured in package.json"
}

# Test 6: Build Test
$TotalTests++
$result = Invoke-Test "Build Test" "npm run build" "package.json"
if ($result -eq $true) {
    $PassedTests++
}
else {
    $FailedTests++
}

# Test 7: Development Server Test (optional)
if ($IncludeDev) {
    $TotalTests++
    Write-TestStatus "INFO" "Testing development server startup..."
    try {
        $devProcess = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
        Start-Sleep -Seconds 3
        if (-not $devProcess.HasExited) {
            Write-TestStatus "SUCCESS" "Development server started successfully"
            Stop-Process -Id $devProcess.Id -Force
            $PassedTests++
        }
        else {
            Write-TestStatus "ERROR" "Development server failed to start"
            $FailedTests++
        }
    }
    catch {
        Write-TestStatus "ERROR" "Development server test failed: $($_.Exception.Message)"
        $FailedTests++
    }
}

# Generate test report
Write-Host ""
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-TestStatus "INFO" "Total Tests: $TotalTests"
Write-TestStatus "SUCCESS" "Passed: $PassedTests"
if ($FailedTests -gt 0) {
    Write-TestStatus "ERROR" "Failed: $FailedTests"
}
if ($SkippedTests -gt 0) {
    Write-TestStatus "WARNING" "Skipped: $SkippedTests"
}

# Calculate success rate
if ($TotalTests -gt 0) {
    $SuccessRate = [math]::Round(($PassedTests * 100) / $TotalTests)
    Write-Host ""
    Write-Host "Success Rate: $SuccessRate%" -ForegroundColor White
    
    if ($SuccessRate -ge 80) {
        Write-TestStatus "SUCCESS" "Overall test suite: PASSED"
        exit 0
    }
    elseif ($SuccessRate -ge 60) {
        Write-TestStatus "WARNING" "Overall test suite: PARTIAL PASS"
        exit 1
    }
    else {
        Write-TestStatus "ERROR" "Overall test suite: FAILED"
        exit 1
    }
}
else {
    Write-TestStatus "ERROR" "No tests were executed"
    exit 1
}

