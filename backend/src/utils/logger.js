/**
 * Logger Utility
 *
 * Provides structured logging with different levels and optional persistence
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 100; // Keep last 100 logs
    this.listeners = [];
    // Enable debug mode in development (check NODE_ENV for Node.js backend)
    this.level = process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
  }

  setLevel(level) {
    this.level = LOG_LEVELS[level] || LOG_LEVELS.INFO;
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notify() {
    this.listeners.forEach(cb => cb([...this.logs]));
  }

  log(level, category, message, data = null) {
    if (LOG_LEVELS[level] < this.level) return;

    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      data
    };

    // Console output
    const consoleMethod = level === 'ERROR' ? 'error' : level === 'WARN' ? 'warn' : 'log';
    const prefix = `[${level}] [${category}]`;

    if (data) {
      console[consoleMethod](prefix, message, data);
    } else {
      console[consoleMethod](prefix, message);
    }

    // Store log
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Notify listeners
    this.notify();
  }

  debug(category, message, data) {
    this.log('DEBUG', category, message, data);
  }

  info(category, message, data) {
    this.log('INFO', category, message, data);
  }

  warn(category, message, data) {
    this.log('WARN', category, message, data);
  }

  error(category, message, data) {
    this.log('ERROR', category, message, data);
  }

  clear() {
    this.logs = [];
    this.notify();
  }

  getLogs() {
    return [...this.logs];
  }

  exportLogs() {
    return JSON.stringify(this.logs, null, 2);
  }
}

// Singleton instance
export const logger = new Logger();

// Convenience exports
export const log = {
  debug: (category, message, data) => logger.debug(category, message, data),
  info: (category, message, data) => logger.info(category, message, data),
  warn: (category, message, data) => logger.warn(category, message, data),
  error: (category, message, data) => logger.error(category, message, data),
};
