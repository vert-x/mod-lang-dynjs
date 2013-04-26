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
var vertxTest = require('vertx_tests');
var vassert = vertxTest.vassert;

var eb = require('vertx/event_bus');
var timers = require('vertx/timer');
var Buffer = require('vertx/buffer');
var address = 'foo-address';

var sent = {
  price : 23.45,
  name : 'tim'
};

var emptySent = {
  address : address
};

var reply = {
  desc: "approved",
  status: 123
}

function assertSent(msg) {
  vassert.assertEquals(sent.price, msg.price);
  vassert.assertEquals(sent.name, msg.name);
}


function assertReply(rep) {
  vassert.assertEquals(reply.desc, rep.desc);
  vassert.assertTrue(reply.status === rep.status);
}

function testSimple() {
  var handled = false;
  var ebus = eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    eb.unregisterHandler(address, MyHandler);
    handled = true;
    vassert.testComplete();
  });
  vassert.assertTrue(ebus === eb);
  vassert.assertTrue(eb.send(address, sent) === eb);
}

function testEmptyMessage() {

  var handled = false;
  var ebus = eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    vassert.assertTrue(eb.unregisterHandler(address, MyHandler) === eb);
    handled = true;
    vassert.testComplete();
  });
  vassert.assertTrue(ebus === eb);
  vassert.assertTrue(eb.send(address, emptySent) === eb);
}


function testUnregister() {

  var handled = false;
  var MyHandler = function(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    vassert.assertTrue(eb.unregisterHandler(address, MyHandler) === eb);
    // Unregister again - should do nothing
    vassert.assertTrue(eb.unregisterHandler(address, MyHandler) === eb);
    handled = true;
    // Wait a little while to allow any other messages to arrive
    timers.setTimer(100, function() {
      vassert.testComplete();
    });
  }
  var ebus = eb.registerHandler(address, MyHandler);

  for (var i = 0; i < 2; i++) {
    vassert.assertTrue(eb.send(address, sent) === eb);
  }
}

function testWithReply() {

  var handled = false;
  var ebus = eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    vassert.assertTrue(eb.unregisterHandler(address, MyHandler) === eb);
    handled = true;
    replier(reply);
  });
  vassert.assertTrue(ebus === eb);

  ebus = eb.send(address, sent, function(reply) {
    assertReply(reply);
    vassert.testComplete();
  });
  vassert.assertTrue(ebus === eb);
}

function testReplyOfReplyOfReply() {

  var ebus = eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertEquals("message", msg);
    replier("reply", function(reply, replier) {
      vassert.assertEquals("reply-of-reply", reply);
      replier("reply-of-reply-of-reply");
      vassert.assertTrue(eb.unregisterHandler(address, MyHandler) === eb);
    });
  });
  vassert.assertTrue(ebus === eb);

  ebus = eb.send(address, "message", function(reply, replier) {
    vassert.assertEquals("reply", reply);
    replier("reply-of-reply", function(reply) {
      vassert.assertEquals("reply-of-reply-of-reply", reply);
      vassert.testComplete();
    });
  });
  vassert.assertTrue(ebus === eb);
}

function testEmptyReply() {

  var handled = false;
  var ebus = eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    vassert.assertTrue(eb.unregisterHandler(address, MyHandler) === eb);
    handled = true;
    replier({});
  });
  vassert.assertTrue(ebus === eb);

  ebus = eb.send(address, sent, function(reply) {
    vassert.testComplete();
  });
  vassert.assertTrue(ebus === eb);
  vassert.assertTrue(eb.send(address, sent) === eb);
}

function testEchoString() {
  echo("foo");
}

function testEchoNumber1() {
  echo(1234);
}

function testEchoNumber2() {
  echo(1.2345);
}

function testEchoBooleanTrue() {
  echo(true);
}

function testEchoBooleanFalse() {
  echo(false);
}

function testEchoJson() {
  echo(sent);
}

function testEchoBuffer() {
  echo(new Buffer());
}

function testEchoNull() {
  echo(null);
}


function echo(msg) {
  var ebus = eb.registerHandler(address, function MyHandler(received, replier) {
    eb.unregisterHandler(address, MyHandler);
    replier(received);
  });
  vassert.assertTrue(ebus === eb);
  ebus = eb.send(address, msg, function (reply){

  if (msg != null) {
    for (field in reply) {
      vassert.assertEquals(msg.field, reply.field);
    }
  }
  vassert.assertTrue(ebus === eb);
  vassert.testComplete();
  });
}

vertxTest.startTests(this);

