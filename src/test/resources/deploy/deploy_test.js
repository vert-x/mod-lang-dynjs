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

load('vertx.js');
load('vertx_tests.js');

var eb = vertx.eventBus;

function testSimpleDeploy() {
  vertx.deployVerticle("deploy/child.js", function(err, deployId) {
    vassert.assertEquals(null, err);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployWithConfig() {
  var conf = {foo: 'bar'}
  vertx.deployVerticle("deploy/child.js", conf, function(err, deployId) {
    vassert.assertEquals(null, err);
    // this should work?
//    vassert.assertEquals('bar', vertx.config['foo']);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployWithNumInstances() {
  vertx.deployVerticle("deploy/child.js", 12, function(err, deployId) {
    vassert.assertEquals(null, err);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployWithConfigAndNumInstances() {
  var conf = {foo: 'bar'}
  vertx.deployVerticle("deploy/child.js", conf, 12, function(err, deployId) {
    vassert.assertEquals(null, err);
    vassert.assertNotNull(deployId);
    vassert.testComplete();
  });
}

function testDeployFail() {
  vertx.deployVerticle("deploy/notexist.js", function(err, deployId) {
    vassert.assertFalse(null === err);
    vassert.assertEquals(null, deployId);
    vassert.testComplete();
  });
}

function testUndeploy() {
  vertx.deployVerticle("deploy/child.js", function(err, deployId) {
    vertx.undeployVerticle(deployId, function(err) {
      vassert.assertTrue(null === err);
      vassert.testComplete();
    });
  });
}

function testUndeployFail() {
  vertx.deployVerticle("deploy/child.js", function(err, deployId) {
    vertx.undeployVerticle('someotherid', function(err) {
      vassert.assertFalse(null === err);
      vassert.testComplete();
    });
  });
}

function testDeployWorker() {
  vertx.deployWorkerVerticle('deploy/child.js', function(err, deployId) {
    vassert.assertTrue(null === err);
    vassert.assertTrue(deployId !== null);
    vassert.testComplete();
  });
}

initTests(this);
