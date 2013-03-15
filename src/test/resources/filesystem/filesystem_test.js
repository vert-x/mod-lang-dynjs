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

var TestUtils = require('test_utils');

var fs = vertx.fileSystem;
var tu = new TestUtils();

var fileDir = "js-test-output"

// More tests needed

function testCopy() {
  var from = fileDir + "/foo.tmp";
  var to = fileDir + "/bar.tmp";
  var content = "some-data";
  fs.writeFile(from, content, function() {
    fs.copy(from, to, function(err, res) {
      vassert.assertTrue(err === null);
      fs.readFile(to, function(err, res) {
        vassert.assertTrue(err === null);
        vassert.assertTrue(res.toString() === content);
        vassert.testComplete();
        teardown();
      });
    });
  });
}

function testMove() {
  var from = fileDir + "/foo.tmp";
  var to = fileDir + "/bar.tmp";
  var content = "some-data";
  fs.writeFile(from, content, function() {
    fs.move(from, to, function(err, res) {
      vassert.assertTrue(err === null);
      fs.readFile(to, function(err, res) {
        vassert.assertTrue(err === null);
        vassert.assertTrue(res.toString() === content);
        fs.exists(from, function(err, res) {
          vassert.assertTrue(err === null);
          vassert.assertTrue(!res);
          vassert.testComplete();
          teardown();
        });
      });
    });
  });
}

function testReadDir() {
  var file1 = fileDir + "/foo.tmp";
  var file2 = fileDir + "/bar.tmp";
  var file3 = fileDir + "/baz.tmp";
  var content = "some-data";
  fs.writeFile(file1, content, function() {
    fs.writeFile(file2, content, function() {
      fs.writeFile(file3, content, function() {
        fs.readDir(fileDir, function(err, res) {
          vassert.assertTrue(err === null);
          vassert.assertTrue(res.length === 3);
          vassert.testComplete();
          teardown();
        });
      })
    })
  });
}

function testProps() {
  var file = fileDir + "/foo.tmp";
  var content = "some-data";
  fs.writeFile(file, content, function() {
    fs.props(file, function(err, res) {
      vassert.assertTrue(err === null);
      vassert.assertTrue(res.isRegularFile);
      vassert.assertTrue(typeof res.creationTime === 'number');
      vassert.assertTrue(typeof res.lastAccessTime === 'number');
      vassert.assertTrue(typeof res.lastModifiedTime === 'number');
      vassert.testComplete();
      teardown();
    });
  });
}

function testPumpFile() {
  var from = fileDir + "/foo.tmp";
  var to = fileDir + "/bar.tmp";
  var content = tu.generateRandomBuffer(10000);
  fs.writeFile(from, content, function() {
    fs.open(from, function(err, file1) {
      vassert.assertTrue(err === null);
      fs.open(to, function(err, file2) {
        vassert.assertTrue(err === null);
        var rs = file1.getReadStream();
        var ws = file2.getWriteStream();
        var pump = new vertx.Pump(rs, ws);
        pump.start();
        rs.endHandler(function() {
          file1.close(function() {
            file2.close(function() {
              fs.readFile(to, function(err, res) {
                vassert.assertTrue(err === null);
                vassert.assertTrue(tu.buffersEqual(content, res));
                vassert.testComplete();
                teardown();
              });
            });
          });
        });
      });
    });
  });
}

function setup(doneHandler) {
  fs.exists(fileDir, function(err, exists) {
    if (exists) {
      fs.delete(fileDir, true, function() {
        fs.mkDir(fileDir, function() {
          doneHandler();
        });
      });
    } else {
      fs.mkDir(fileDir, function() {
        doneHandler();
      });
    }
  });
}

function teardown(doneHandler) {
  fs.delete(fileDir, true, function() {
    doneHandler();
  });
}

setup(function() {
  initTests(this);
})



