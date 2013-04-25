var container = require('container');
var vertxTest = require('vertx_tests');
var vassert = vertxTest.vassert;

function testEnv() {
  container.deployVerticle("deploy/child.js", function() {
    vassert.testComplete();
    // TODO: WTF
    // container.env['SOMETHING'] = 'else';
    // vassert.assertEquals("else", container.env['SOMETHING']);
    vassert.testComplete();
  });
}

vertxTest.startTests(this);
