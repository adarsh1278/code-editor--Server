/**
 * Logger utility for consistent logging
 */
class Logger {
    /**
     * Log an info message
     * @param {string} message - Message to log
     * @param {Object} data - Optional data to log
     */
    info(message, data = null) {
        if (data) {
            console.log(`ℹ️ ${message}`, data);
        } else {
            console.log(`ℹ️ ${message}`);
        }
    }

    /**
     * Log a success message
     * @param {string} message - Message to log
     * @param {Object} data - Optional data to log
     */
    success(message, data = null) {
        if (data) {
            console.log(`✅ ${message}`, data);
        } else {
            console.log(`✅ ${message}`);
        }
    }

    /**
     * Log an error message
     * @param {string} message - Message to log
     * @param {Error} error - Error object
     */
    error(message, error) {
        console.error(`❌ ${message}`, error);
    }

    /**
     * Log a warning message
     * @param {string} message - Message to log
     * @param {Object} data - Optional data to log
     */
    warning(message, data = null) {
        if (data) {
            console.warn(`⚠️ ${message}`, data);
        } else {
            console.warn(`⚠️ ${message}`);
        }
    }
}

module.exports = new Logger();
