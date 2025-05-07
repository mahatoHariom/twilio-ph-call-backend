/**
 * Logger Utility
 *
 * Provides a centralized logging mechanism for the server application.
 * This helps maintain consistent log formats and enables easy configuration
 * of log levels and destinations.
 */

enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

/**
 * Current environment - used to determine logging behavior
 */
const NODE_ENV = process.env.NODE_ENV || "development";

/**
 * Whether to include timestamps in logs
 */
const INCLUDE_TIMESTAMPS = true;

/**
 * Whether to log in color (for terminal output)
 */
const USE_COLORS = NODE_ENV === "development";

/**
 * Color codes for different log levels
 */
const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  gray: "\x1b[90m",
};

/**
 * Get formatted timestamp for logging
 */
function getTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Format a log message with appropriate color and timestamp
 */
function formatLogMessage(level: LogLevel, message: string): string {
  let color = "";

  if (USE_COLORS) {
    switch (level) {
      case LogLevel.ERROR:
        color = colors.red;
        break;
      case LogLevel.WARN:
        color = colors.yellow;
        break;
      case LogLevel.INFO:
        color = colors.blue;
        break;
      case LogLevel.DEBUG:
        color = colors.gray;
        break;
    }
  }

  const timestamp = INCLUDE_TIMESTAMPS ? `[${getTimestamp()}] ` : "";
  const formattedLevel = `[${level}]`;

  return `${color}${timestamp}${formattedLevel} ${message}${
    USE_COLORS ? colors.reset : ""
  }`;
}

/**
 * Log an error message
 */
export function error(message: string, error?: unknown): void {
  const errorDetails =
    error instanceof Error
      ? `\n${error.message}\n${error.stack || ""}`
      : error
      ? `\n${String(error)}`
      : "";

  console.error(formatLogMessage(LogLevel.ERROR, message + errorDetails));
}

/**
 * Log a warning message
 */
export function warn(message: string): void {
  console.warn(formatLogMessage(LogLevel.WARN, message));
}

/**
 * Log an info message
 */
export function info(message: string): void {
  console.info(formatLogMessage(LogLevel.INFO, message));
}

/**
 * Log a debug message (only in development mode)
 */
export function debug(message: string): void {
  if (NODE_ENV === "development") {
    console.debug(formatLogMessage(LogLevel.DEBUG, message));
  }
}

export default {
  error,
  warn,
  info,
  debug,
};
