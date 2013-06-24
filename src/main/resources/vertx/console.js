if (typeof module === 'undefined') {
  throw "Use require() to load Vert.x API modules"
}

var stdout = java.lang.System.out;
var stderr = java.lang.System.err;
/**
 * A simple console object that can be used to print log messages
 * errors, and warnings. 
 * @example
 * var console = require('vertx/console');
 *
 * console.log('Hello standard out');
 * console.warn('Warning standard error');
 * console.error('Alert! Alert!');
 *
 * @exports vertx/console
 */
var console = {

  // TODO this should take varargs and allow formatting a la sprintf
  /**
   * Log the msg to STDOUT.
   *
   * @param {string} msg The message to log to standard out.
   */
  log: function(msg) {
    stdout.println(msg);
  },

  /**
   * Log the msg to STDERR
   *
   * @param {string} msg The message to log with a warning to standard error.
   */
  warn: function(msg) {
    stderr.println(msg);
  },

  /**
   * Log the msg to STDERR
   *
   * @param {string} msg The message to log with a warning alert to standard error.
   */
  error: function(msg) {
    stderr.println(msg);
  }
};

module.exports = console;
