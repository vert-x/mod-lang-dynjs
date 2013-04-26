/*
 * Copyright 2011-2012 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var container = require('vertx/container');
var vertxTest = require('vertx_tests');
var vassert = vertxTest.vassert;

function testSimpleDeploy() {
  container.deployVerticle("deploy/child.js", function(err, deployId) {
    vassert.assertEquals(null, err);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployWithConfig() {
  var conf = {'foo': 'bar'}
  container.deployVerticle("deploy/child.js", conf, function(err, deployId) {
    vassert.assertEquals(null, err);
    // this should work?
    //vassert.assertEquals('bar', container.config['foo']);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployWithNumInstances() {
  container.deployVerticle("deploy/child.js", 12, function(err, deployId) {
    vassert.assertEquals(null, err);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployWithConfigAndNumInstances() {
  var conf = {foo: 'bar'}
  container.deployVerticle("deploy/child.js", conf, 12, function(err, deployId) {
    vassert.assertEquals(null, err);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployFail() {
  container.deployVerticle("deploy/notexist.js", function(err, deployId) {
    vassert.assertFalse(null === err);
    vassert.assertEquals(null, deployId);
    vassert.testComplete();
  });
}

function testUndeploy() {
  container.deployVerticle("deploy/child.js", function(err, deployId) {
    container.undeployVerticle(deployId, function(err) {
      vassert.assertTrue(null === err);
      vassert.testComplete();
    });
  });
}

function testUndeployFail() {
  container.deployVerticle("deploy/child.js", function(err, deployId) {
    container.undeployVerticle('someotherid', function(err) {
      vassert.assertFalse(null === err);
      vassert.testComplete();
    });
  });
}

function testDeployWorker() {
  container.deployWorkerVerticle('deploy/child.js', function(err, deployId) {
    vassert.assertTrue(null === err);
    vassert.assertTrue(deployId !== null);
    vassert.testComplete();
  });
}

vertxTest.startTests(this);
