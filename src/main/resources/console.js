if (typeof module === 'undefined') {
  throw "Use require() to load Vert.x API modules"
}

// Add a console object which will be familiar to JavaScript devs
var console = console || {
  // TODO this should take varargs and allow formatting a la sprintf
  log: function(msg) {
    stdout.println(msg);
  },
  warn: function(msg) {
    stderr.println(msg);
  },
  error: function(msg) {
    stderr.println(msg);
  }
};

module.exports = console;
