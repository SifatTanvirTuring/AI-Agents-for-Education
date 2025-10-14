#!/bin/bash

# Setup Logging Directory Structure for Learning Buddy
# Creates necessary directories and files for comprehensive logging

echo "🔧 Setting up logging infrastructure for Learning Buddy..."

# Create logs directory
mkdir -p logs

# Create log files with proper permissions
touch logs/application.log
touch logs/telemetry.log
touch logs/metrics.json
touch logs/health.json

# Set permissions (if on Unix-like system)
if command -v chmod &> /dev/null; then
    chmod 644 logs/*.log
    chmod 644 logs/*.json
fi

# Create a sample log entry
cat > logs/application.log << EOF
{"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)","level":"info","category":"setup","message":"Logging infrastructure initialized","data":{"setupTime":"$(date)","version":"1.0.0"},"sessionId":"setup-session","userId":null,"requestId":"setup-req"}
EOF

# Create a sample telemetry entry
cat > logs/telemetry.log << EOF
{"timestamp":"$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)","level":"info","category":"telemetry","message":"Telemetry logging initialized","sessionId":"setup-session","userId":null,"requestId":"setup-req","metadata":{"userAgent":"setup-script","url":"server","performance":{}}}
EOF

# Create initial metrics file
cat > logs/metrics.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "logs": {
    "total": 1,
    "byLevel": {
      "info": 1
    },
    "byCategory": {
      "setup": 1
    }
  },
  "performance": {},
  "memory": {},
  "errors": 0
}
EOF

# Create initial health check file
cat > logs/health.json << EOF
{
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
  "status": "healthy",
  "checks": {
    "logging": {
      "status": "healthy",
      "logsInMemory": 0,
      "lastLogTime": null
    },
    "fileSystem": {
      "status": "healthy"
    },
    "memory": {
      "status": "healthy",
      "heapUsed": 0,
      "heapTotal": 0,
      "usage": "0%"
    },
    "performance": {
      "status": "healthy",
      "metrics": {}
    }
  }
}
EOF

echo "✅ Logging infrastructure setup complete!"
echo ""
echo "📁 Created directories and files:"
echo "   - logs/application.log (main application logs)"
echo "   - logs/telemetry.log (telemetry data)"
echo "   - logs/metrics.json (performance metrics)"
echo "   - logs/health.json (health check results)"
echo ""
echo "🌐 To view logs in a browser, open: log-viewer.html"
echo "📊 To run Firebase tests, open: test-firebase.html"
echo "🧪 To run integration tests, execute: ./run-tests.sh"
echo ""
echo "📋 Logging configuration:"
echo "   - JSON format for structured logging"
echo "   - Multiple output destinations (file + console)"
echo "   - Real-time metrics collection"
echo "   - Health monitoring"
echo "   - Telemetry tracking"
echo ""
echo "🔍 Log levels available: error, warn, info, debug, trace"
echo "📂 Log categories: auth, database, api, performance, security"



