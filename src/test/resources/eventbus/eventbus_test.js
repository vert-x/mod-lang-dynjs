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

load('vertx_tests.js')

// Most testing occurs in the Java tests

var eb = vertx.eventBus;
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
  eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    eb.unregisterHandler(address, MyHandler);
    handled = true;
    vassert.testComplete();
  });

  eb.send(address, sent);
}

function testEmptyMessage() {

  var handled = false;
  eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    eb.unregisterHandler(address, MyHandler);
    handled = true;
    vassert.testComplete();
  });

  eb.send(address, emptySent);
}


function testUnregister() {

  var handled = false;
  var MyHandler = function(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    eb.unregisterHandler(address, MyHandler);
    // Unregister again - should do nothing
    eb.unregisterHandler(address, MyHandler);
    handled = true;
    // Wait a little while to allow any other messages to arrive
    vertx.setTimer(100, function() {
      vassert.testComplete();
    });
  }
  eb.registerHandler(address, MyHandler);

  for (var i = 0; i < 2; i++) {
    eb.send(address, sent);
  }
}

function testWithReply() {

  var handled = false;
  eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    eb.unregisterHandler(address, MyHandler);
    handled = true;
    replier(reply);
  });

  eb.send(address, sent, function(reply) {
    assertReply(reply);
    vassert.testComplete();
  });
}

function testReplyOfReplyOfReply() {

  eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue("message" === msg);
    replier("reply", function(reply, replier) {
      vassert.assertTrue("reply-of-reply" === reply);
      replier("reply-of-reply-of-reply");
      eb.unregisterHandler(address, MyHandler);
    });
  });

  eb.send(address, "message", function(reply, replier) {
    vassert.assertEquals("reply", reply);
    replier("reply-of-reply", function(reply) {
      vassert.assertEquals("reply-of-reply-of-reply", reply);
      vassert.testComplete();
    });
  });
}

function testEmptyReply() {

  var handled = false;
  eb.registerHandler(address, function MyHandler(msg, replier) {
    vassert.assertTrue(!handled);
    assertSent(msg);
    eb.unregisterHandler(address, MyHandler);
    handled = true;
    replier({});
  });

  eb.send(address, sent, function(reply) {
    vassert.testComplete();
  });
  eb.send(address, sent);
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
  echo(new org.vertx.java.core.buffer.Buffer());
}

function testEchoNull() {
  echo(null);
}


function echo(msg) {
  eb.registerHandler(address, function MyHandler(received, replier) {
    eb.unregisterHandler(address, MyHandler);
    replier(received);
  });
  eb.send(address, msg, function (reply){

  if (msg != null) {
    for (field in reply) {
      vassert.assertEquals(msg.field, reply.field);
    }
  }

  vassert.testComplete();
  });
}

initTests(this);

