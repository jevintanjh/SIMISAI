# Performance Testing Suite for SIMISAI
# System Architect - Comprehensive Performance Validation

Write-Host "🧪 SIMISAI Performance Testing Suite" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Configuration
$ApiBaseUrl = "https://2e7j2vait1.execute-api.us-east-1.amazonaws.com/prod"
$TestIterations = 10
$ConcurrentRequests = 5

# Test data
$TestMessages = @(
    "How do I use a blood pressure monitor?",
    "What are the steps for taking temperature?",
    "How to use digital thermometer?",
    "Blood pressure monitoring guide",
    "Temperature measurement instructions"
)

Write-Host "`n📊 Test Configuration:" -ForegroundColor Yellow
Write-Host "API Base URL: $ApiBaseUrl" -ForegroundColor Cyan
Write-Host "Test Iterations: $TestIterations" -ForegroundColor Cyan
Write-Host "Concurrent Requests: $ConcurrentRequests" -ForegroundColor Cyan
Write-Host "Test Messages: $($TestMessages.Count)" -ForegroundColor Cyan

# Performance metrics storage
$PerformanceResults = @()

function Test-Endpoint {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [hashtable]$Body = $null,
        [string]$TestName = "API Test"
    )
    
    $results = @()
    $totalTime = 0
    $successCount = 0
    $errorCount = 0
    
    Write-Host "`n🔬 Testing: $TestName" -ForegroundColor Yellow
    Write-Host "Endpoint: $Endpoint" -ForegroundColor Cyan
    
    for ($i = 1; $i -le $TestIterations; $i++) {
        $startTime = Get-Date
        
        try {
            if ($Method -eq "POST" -and $Body) {
                $response = Invoke-RestMethod -Uri "$ApiBaseUrl$Endpoint" -Method $Method -Body ($Body | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
            } else {
                $response = Invoke-RestMethod -Uri "$ApiBaseUrl$Endpoint" -Method $Method -TimeoutSec 30
            }
            
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            $totalTime += $responseTime
            $successCount++
            
            $results += @{
                iteration = $i
                responseTime = $responseTime
                success = $true
                status = "Success"
                cacheHit = $response.provider?.cacheHit
                provider = $response.provider?.provider
            }
            
            Write-Host "✅ Iteration $i`: $([math]::Round($responseTime, 2))ms" -ForegroundColor Green
            
        } catch {
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            $totalTime += $responseTime
            $errorCount++
            
            $results += @{
                iteration = $i
                responseTime = $responseTime
                success = $false
                status = "Error: $($_.Exception.Message)"
                cacheHit = $false
                provider = "Error"
            }
            
            Write-Host "❌ Iteration $i`: $([math]::Round($responseTime, 2))ms - Error" -ForegroundColor Red
        }
    }
    
    # Calculate statistics
    $avgResponseTime = $totalTime / $TestIterations
    $successRate = ($successCount / $TestIterations) * 100
    
    $PerformanceResults += @{
        TestName = $TestName
        Endpoint = $Endpoint
        AverageResponseTime = $avgResponseTime
        SuccessRate = $successRate
        TotalRequests = $TestIterations
        SuccessfulRequests = $successCount
        FailedRequests = $errorCount
        Results = $results
    }
    
    Write-Host "`n📈 $TestName Results:" -ForegroundColor Green
    Write-Host "Average Response Time: $([math]::Round($avgResponseTime, 2))ms" -ForegroundColor Cyan
    Write-Host "Success Rate: $([math]::Round($successRate, 2))%" -ForegroundColor Cyan
    Write-Host "Successful Requests: $successCount/$TestIterations" -ForegroundColor Cyan
    
    return $results
}

# Test 1: Status Endpoint
Write-Host "`n🚀 Starting Performance Tests..." -ForegroundColor Green
Test-Endpoint -Endpoint "/status" -TestName "Status Service Performance"

# Test 2: Chat Endpoint with various messages
foreach ($message in $TestMessages) {
    $body = @{
        messages = @(
            @{
                role = "user"
                content = $message
            }
        )
    }
    
    Test-Endpoint -Endpoint "/chat" -Method "POST" -Body $body -TestName "Chat Service - $($message.Substring(0, [Math]::Min(30, $message.Length)))..."
}

# Test 3: Guidance Service
Test-Endpoint -Endpoint "/guidance/digital_oral_thermometer/1?language=en&style=direct" -TestName "Guidance Service Performance"

# Test 4: Concurrent Load Test
Write-Host "`n🔥 Concurrent Load Testing..." -ForegroundColor Yellow

$concurrentJobs = @()
for ($i = 1; $i -le $ConcurrentRequests; $i++) {
    $message = $TestMessages[$i % $TestMessages.Count]
    $body = @{
        messages = @(
            @{
                role = "user"
                content = $message
            }
        )
    }
    
    $job = Start-Job -ScriptBlock {
        param($ApiUrl, $Body)
        try {
            $startTime = Get-Date
            $response = Invoke-RestMethod -Uri "$ApiUrl/chat" -Method "POST" -Body ($Body | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 30
            $endTime = Get-Date
            $responseTime = ($endTime - $startTime).TotalMilliseconds
            
            return @{
                success = $true
                responseTime = $responseTime
                cacheHit = $response.provider?.cacheHit
                provider = $response.provider?.provider
            }
        } catch {
            return @{
                success = $false
                responseTime = 30000
                error = $_.Exception.Message
            }
        }
    } -ArgumentList $ApiBaseUrl, $body
    
    $concurrentJobs += $job
}

# Wait for all concurrent jobs to complete
Write-Host "⏳ Waiting for concurrent requests to complete..." -ForegroundColor Yellow
$concurrentResults = $concurrentJobs | Wait-Job | Receive-Job
$concurrentJobs | Remove-Job

# Analyze concurrent results
$concurrentSuccessCount = ($concurrentResults | Where-Object { $_.success }).Count
$concurrentAvgTime = ($concurrentResults | Measure-Object -Property responseTime -Average).Average
$concurrentSuccessRate = ($concurrentSuccessCount / $ConcurrentRequests) * 100

Write-Host "`n📊 Concurrent Load Test Results:" -ForegroundColor Green
Write-Host "Concurrent Requests: $ConcurrentRequests" -ForegroundColor Cyan
Write-Host "Average Response Time: $([math]::Round($concurrentAvgTime, 2))ms" -ForegroundColor Cyan
Write-Host "Success Rate: $([math]::Round($concurrentSuccessRate, 2))%" -ForegroundColor Cyan

# Performance Summary
Write-Host "`n📋 PERFORMANCE TEST SUMMARY" -ForegroundColor Green
Write-Host "==========================" -ForegroundColor Green

foreach ($result in $PerformanceResults) {
    Write-Host "`n🎯 $($result.TestName):" -ForegroundColor Yellow
    Write-Host "   Average Response Time: $([math]::Round($result.AverageResponseTime, 2))ms" -ForegroundColor Cyan
    Write-Host "   Success Rate: $([math]::Round($result.SuccessRate, 2))%" -ForegroundColor Cyan
    Write-Host "   Requests: $($result.SuccessfulRequests)/$($result.TotalRequests)" -ForegroundColor Cyan
}

# Overall Performance Analysis
$overallAvgTime = ($PerformanceResults | Measure-Object -Property AverageResponseTime -Average).Average
$overallSuccessRate = ($PerformanceResults | Measure-Object -Property SuccessRate -Average).Average

Write-Host "`n🏆 OVERALL PERFORMANCE METRICS:" -ForegroundColor Green
Write-Host "Overall Average Response Time: $([math]::Round($overallAvgTime, 2))ms" -ForegroundColor Cyan
Write-Host "Overall Success Rate: $([math]::Round($overallSuccessRate, 2))%" -ForegroundColor Cyan

# Performance Grade
$performanceGrade = if ($overallAvgTime -lt 2000) { "A" } 
                   elseif ($overallAvgTime -lt 4000) { "B" }
                   elseif ($overallAvgTime -lt 6000) { "C" }
                   else { "D" }

Write-Host "Performance Grade: $performanceGrade" -ForegroundColor $(if ($performanceGrade -eq "A") { "Green" } elseif ($performanceGrade -eq "B") { "Yellow" } else { "Red" })

# Cache Analysis
$cacheHits = ($PerformanceResults | ForEach-Object { $_.Results } | Where-Object { $_.cacheHit -eq $true }).Count
$totalRequests = ($PerformanceResults | ForEach-Object { $_.Results }).Count
$cacheHitRate = if ($totalRequests -gt 0) { ($cacheHits / $totalRequests) * 100 } else { 0 }

Write-Host "Cache Hit Rate: $([math]::Round($cacheHitRate, 2))%" -ForegroundColor Cyan

# Recommendations
Write-Host "`n💡 PERFORMANCE RECOMMENDATIONS:" -ForegroundColor Green

if ($overallAvgTime -gt 3000) {
    Write-Host "⚠️ Response times are above 3 seconds - consider further optimization" -ForegroundColor Yellow
}

if ($cacheHitRate -lt 30) {
    Write-Host "⚠️ Cache hit rate is low - consider implementing more aggressive caching" -ForegroundColor Yellow
}

if ($overallSuccessRate -lt 95) {
    Write-Host "⚠️ Success rate is below 95% - investigate error causes" -ForegroundColor Yellow
}

if ($overallAvgTime -lt 2000 -and $overallSuccessRate -gt 95) {
    Write-Host "✅ Excellent performance! System is well optimized" -ForegroundColor Green
}

Write-Host "`n🚀 Performance testing complete!" -ForegroundColor Green
