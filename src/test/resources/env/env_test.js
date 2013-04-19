load('vertx.js');
load('vertx_tests.js');

function testEnv() {
  vertx.deployVerticle("deploy/child.js", function() {
    vassert.testComplete();
    // TODO: WTF
    // vertx.env['SOMETHING'] = 'else';
    // vassert.assertEquals("else", vertx.env['SOMETHING']);
    vassert.testComplete();
  });
}

initTests(this);
