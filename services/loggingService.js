/**
 * Comprehensive Logging Service for Learning Buddy
 * Provides structured logging with JSON output and telemetry
 */

import fs from 'fs';
import path from 'path';

class LoggingService {
  constructor() {
    this.config = this.loadConfig();
    this.logs = [];
    this.metrics = {};
    this.healthChecks = {};
    this.setupLogging();
  }

  loadConfig() {
    try {
      const configPath = path.join(process.cwd(), 'logging-config.json');
      if (fs.existsSync(configPath)) {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }
    } catch (error) {
      console.warn('Failed to load logging config, using defaults');
    }
    
    return {
      telemetry: {
        enabled: true,
        target: 'local',
        otlpEndpoint: '',
        outfile: './logs/telemetry.log'
      },
      logging: {
        level: 'info',
        format: 'json',
        outputs: [
          { type: 'file', path: './logs/application.log' },
          { type: 'console', format: 'pretty' }
        ]
      },
      monitoring: {
        enabled: true,
        metrics: { enabled: true, interval: 30000 },
        healthChecks: { enabled: true, interval: 60000 }
      }
    };
  }

  setupLogging() {
    // Ensure logs directory exists
    const logsDir = path.dirname(this.config.logging.outputs[0].path);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }

    // Setup periodic log flushing
    if (this.config.monitoring.enabled) {
      setInterval(() => this.flushLogs(), 5000);
      setInterval(() => this.collectMetrics(), this.config.monitoring.metrics.interval);
      setInterval(() => this.performHealthCheck(), this.config.monitoring.healthChecks.interval);
    }
  }

  log(level, message, data = {}, category = 'general') {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      data,
      sessionId: this.getSessionId(),
      userId: this.getCurrentUserId(),
      requestId: this.getRequestId()
    };

    // Add to in-memory logs
    this.logs.push(logEntry);

    // Output to configured destinations
    this.outputLog(logEntry);

    // Store in telemetry if enabled
    if (this.config.telemetry.enabled) {
      this.storeTelemetry(logEntry);
    }
  }

  outputLog(logEntry) {
    const { outputs } = this.config.logging;
    
    outputs.forEach(output => {
      try {
        if (output.type === 'file') {
          this.writeToFile(output.path, logEntry);
        } else if (output.type === 'console') {
          this.writeToConsole(logEntry, output.format);
        }
      } catch (error) {
        console.error('Failed to output log:', error);
      }
    });
  }

  writeToFile(filePath, logEntry) {
    const logLine = JSON.stringify(logEntry) + '\n';
    fs.appendFileSync(filePath, logLine);
  }

  writeToConsole(logEntry, format = 'pretty') {
    if (format === 'pretty') {
      const timestamp = new Date(logEntry.timestamp).toLocaleString();
      const levelColor = this.getLevelColor(logEntry.level);
      console.log(
        `${levelColor}[${timestamp}] ${logEntry.level.toUpperCase()}${levelColor} ` +
        `${logEntry.category}: ${logEntry.message}`
      );
      if (Object.keys(logEntry.data).length > 0) {
        console.log('  Data:', logEntry.data);
      }
    } else {
      console.log(JSON.stringify(logEntry));
    }
  }

  getLevelColor(level) {
    const colors = {
      error: '\x1b[31m',   // Red
      warn: '\x1b[33m',    // Yellow
      info: '\x1b[36m',    // Cyan
      debug: '\x1b[37m',  // White
      trace: '\x1b[90m'    // Gray
    };
    return colors[level] || '\x1b[0m';
  }

  storeTelemetry(logEntry) {
    try {
      const telemetryData = {
        timestamp: logEntry.timestamp,
        level: logEntry.level,
        category: logEntry.category,
        message: logEntry.message,
        sessionId: logEntry.sessionId,
        userId: logEntry.userId,
        requestId: logEntry.requestId,
        metadata: {
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
          url: typeof window !== 'undefined' ? window.location.href : 'server',
          performance: this.getPerformanceMetrics()
        }
      };

      const telemetryLine = JSON.stringify(telemetryData) + '\n';
      fs.appendFileSync(this.config.telemetry.outfile, telemetryLine);
    } catch (error) {
      console.error('Failed to store telemetry:', error);
    }
  }

  collectMetrics() {
    const metrics = {
      timestamp: new Date().toISOString(),
      logs: {
        total: this.logs.length,
        byLevel: this.getLogCountsByLevel(),
        byCategory: this.getLogCountsByCategory()
      },
      performance: this.getPerformanceMetrics(),
      memory: this.getMemoryMetrics(),
      errors: this.getErrorCount()
    };

    this.metrics[Date.now()] = metrics;

    // Save metrics to file
    try {
      fs.writeFileSync(
        this.config.monitoring.metrics.output,
        JSON.stringify(metrics, null, 2)
      );
    } catch (error) {
      console.error('Failed to save metrics:', error);
    }
  }

  performHealthCheck() {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      checks: {
        logging: this.checkLoggingHealth(),
        fileSystem: this.checkFileSystemHealth(),
        memory: this.checkMemoryHealth(),
        performance: this.checkPerformanceHealth()
      }
    };

    this.healthChecks[Date.now()] = healthCheck;

    // Save health check to file
    try {
      fs.writeFileSync(
        this.config.monitoring.healthChecks.output,
        JSON.stringify(healthCheck, null, 2)
      );
    } catch (error) {
      console.error('Failed to save health check:', error);
    }
  }

  getLogCountsByLevel() {
    const counts = {};
    this.logs.forEach(log => {
      counts[log.level] = (counts[log.level] || 0) + 1;
    });
    return counts;
  }

  getLogCountsByCategory() {
    const counts = {};
    this.logs.forEach(log => {
      counts[log.category] = (counts[log.category] || 0) + 1;
    });
    return counts;
  }

  getPerformanceMetrics() {
    if (typeof performance !== 'undefined') {
      return {
        navigation: performance.getEntriesByType('navigation')[0],
        memory: performance.memory,
        timing: performance.timing
      };
    }
    return {};
  }

  getMemoryMetrics() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      return process.memoryUsage();
    }
    return {};
  }

  getErrorCount() {
    return this.logs.filter(log => log.level === 'error').length;
  }

  checkLoggingHealth() {
    return {
      status: 'healthy',
      logsInMemory: this.logs.length,
      lastLogTime: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : null
    };
  }

  checkFileSystemHealth() {
    try {
      const testFile = './logs/health-test.tmp';
      fs.writeFileSync(testFile, 'test');
      fs.unlinkSync(testFile);
      return { status: 'healthy' };
    } catch (error) {
      return { status: 'unhealthy', error: error.message };
    }
  }

  checkMemoryHealth() {
    const memory = this.getMemoryMetrics();
    const isHealthy = memory.heapUsed < (memory.heapTotal * 0.9);
    return {
      status: isHealthy ? 'healthy' : 'warning',
      heapUsed: memory.heapUsed,
      heapTotal: memory.heapTotal,
      usage: (memory.heapUsed / memory.heapTotal * 100).toFixed(2) + '%'
    };
  }

  checkPerformanceHealth() {
    const perf = this.getPerformanceMetrics();
    return {
      status: 'healthy',
      metrics: perf
    };
  }

  flushLogs() {
    // Keep only last 1000 logs in memory
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  getSessionId() {
    // In a real application, this would come from session management
    return this.sessionId || (this.sessionId = 'session-' + Date.now());
  }

  getCurrentUserId() {
    // In a real application, this would come from authentication
    return this.currentUserId || null;
  }

  getRequestId() {
    // In a real application, this would come from request tracking
    return this.requestId || (this.requestId = 'req-' + Date.now());
  }

  // Convenience methods
  error(message, data = {}, category = 'general') {
    this.log('error', message, data, category);
  }

  warn(message, data = {}, category = 'general') {
    this.log('warn', message, data, category);
  }

  info(message, data = {}, category = 'general') {
    this.log('info', message, data, category);
  }

  debug(message, data = {}, category = 'general') {
    this.log('debug', message, data, category);
  }

  trace(message, data = {}, category = 'general') {
    this.log('trace', message, data, category);
  }

  // Export logs for sharing
  exportLogs(format = 'json') {
    const exportData = {
      timestamp: new Date().toISOString(),
      logs: this.logs,
      metrics: this.metrics,
      healthChecks: this.healthChecks,
      summary: {
        totalLogs: this.logs.length,
        logLevels: this.getLogCountsByLevel(),
        logCategories: this.getLogCountsByCategory(),
        errorCount: this.getErrorCount()
      }
    };

    if (format === 'json') {
      return JSON.stringify(exportData, null, 2);
    } else if (format === 'csv') {
      return this.convertToCSV(exportData);
    }
    
    return exportData;
  }

  convertToCSV(data) {
    const headers = ['timestamp', 'level', 'category', 'message', 'sessionId', 'userId'];
    const rows = data.logs.map(log => [
      log.timestamp,
      log.level,
      log.category,
      log.message,
      log.sessionId,
      log.userId
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    this.metrics = {};
    this.healthChecks = {};
  }
}

// Create singleton instance
const logger = new LoggingService();

export default logger;
export { LoggingService };



