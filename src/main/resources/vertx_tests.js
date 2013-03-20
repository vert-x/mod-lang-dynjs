vassert = org.vertx.testtools.VertxAssert;

initTests = function(top) {
  var methodName = vertx.config.methodName;
  vassert.initialize(vertx.__vertx)
  top[methodName]();
}

