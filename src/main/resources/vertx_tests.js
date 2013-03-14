var vassert = org.vertx.testtools.VertxAssert;

function initTests(top) {
  var methodName = vertx.config.methodName;
  vassert.initialize(vertx._jVertx)
  top[methodName]();
}

function setMain(main) {
  separator = java.io.File.separator;
  root = java.lang.System.getProperty('user.dir');
  dynjs.addLoadPath(root + separator + "src" + separator + "test" + separator + "resources" + separator + main);
}


