var TestUtils = function() {

  var syserr = java.lang.System.err
  var that = this;
  var jutils = new org.vertx.java.testframework.TestUtils(org.dynjs.vertx.DynJSVerticleFactory.vertx);

  that.azzert = function(result, message) {
    if (message) {
      jutils.azzert(result, message);
    } else {
      syserr.println("TEST UTILS: " + jutils.toString());
      methods = jutils.class.methods;
      for (i=0; i < methods.length; i++) {
        var name = methods[i].getName();
        if (name.match(/azzert/)) {
          syserr.println("TEST UTILS METHOD: " + methods[i].toString());
        }
      }
      syserr.println("RESULT: " + result);
      jutils.azzert(result);
    }
  }

  that.appReady = function() {
    jutils.appReady();
  }

  that.appStopped = function() {
    jutils.appStopped();
  }

  that.testComplete = function() {
    jutils.testComplete();
  }

  that.register = function(testName, test) {
    jutils.register(testName, test);
  }

  that.registerTests = function(obj) {
    for(var key in obj){
      var val = obj[key];
      if (typeof val === 'function' && key.substring(0, 4) === 'test') {
        jutils.register(key, val);
      }
   }
  }

  that.unregisterAll = function() {
    jutils.unregisterAll();
  }

  that.checkContext = function() {
    jutils.checkContext();
  }

  that.generateRandomBuffer = function(size) {
    return jutils.generateRandomBuffer(size);
  }

  that.randomUnicodeString = function(size) {
    return jutils.randomUnicodeString(size);
  }

  that.buffersEqual = function(buff1, buff2) {
    return jutils.buffersEqual(buff1, buff2);
  }

};

(function() {
    var instance = null;
    this.get =  function() {
        if(instance == null){
            instance = new TestUtils();
		}
        return instance;
    };
}).call((this.module && module.exports)? module.exports : this.TestUtils);

