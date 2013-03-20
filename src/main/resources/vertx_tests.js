var vassert = org.vertx.testtools.VertxAssert;

var initTests = function(top) {
  var methodName = vertx.config.methodName;
  vassert.initialize(vertx.__vertx)
  top[methodName]();
}

