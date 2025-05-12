/**
 * Simple logger utility for the server
 */

const logger = {
  /**
   * Log an info message
   */
  info: (message: string, ...args: any[]) => {
    console.info(`[INFO] ${message}`, ...args);
  },

  /**
   * Log a debug message
   */
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },

  /**
   * Log a warning message
   */
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },

  /**
   * Log an error message
   */
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
};

export default logger;
