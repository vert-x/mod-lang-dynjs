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

if (typeof module === 'undefined') {
  throw "Use require() to load Vert.x API modules"
}

var eventBus = {};

var handlerMap = {};

var jEventBus = __jvertx.eventBus();

eventBus.registerLocalHandler = function(address, handler) {
  registerHandler(address, handler, true);
  return eventBus;
};

eventBus.registerHandler = function(address, handler) {
  registerHandler(address, handler, false);
  return eventBus;
};

eventBus.unregisterHandler = function(address, handler) {
  checkHandlerParams(address, handler);
  var wrapped = handlerMap[handler];
  if (wrapped) {
    jEventBus.unregisterHandler(address, wrapped);
    delete handlerMap[handler];
  }
  return eventBus;
};

/*
 Message should be a JSON object
 It should have a property "address"
 */
eventBus.send = function(address, message, replyHandler) {
  sendOrPub(true, address, message, replyHandler);
  return eventBus;
};

eventBus.publish = function(address, message) {
  sendOrPub(false, address, message);
  return eventBus;
};

function checkHandlerParams(address, handler) {
  if (!address) {
    throw "address must be specified";
  }
  if (!handler) {
    throw "handler must be specified";
  }
  if (typeof address != "string") {
    throw "address must be a string";
  }
  if (typeof handler != "function") {
    throw "handler must be a function";
  }
}

var jsonObjectClass = new org.vertx.java.core.json.JsonObject().getClass();
var jsonArrayClass = new org.vertx.java.core.json.JsonArray().getClass();

function wrappedHandler(handler) {
  return new org.vertx.java.core.Handler({
    handle: function(jMsg) {
      var body = jMsg.body();

      if (body && typeof body === 'org.vertx.java.core.json.JsonObject') {
        // Convert to JS JSON
        body = JSON.parse(body.encode());
      }

      handler(body, function(reply, replyHandler) {
        if (typeof reply === 'undefined') {
          throw "Reply message must be specified";
        }
        reply = convertMessage(reply);
        if (replyHandler) {
          var wrapped = wrappedHandler(replyHandler);
          jMsg.reply(reply, wrapped);
        } else {
          jMsg.reply(reply);
        }
      })
    }
  });
}

function registerHandler(address, handler, localOnly) {
  checkHandlerParams(address, handler);

  var wrapped = wrappedHandler(handler);

  // This is a bit more complex than it should be because we have to wrap the
  // handler - therefore we have to keep track of it :(
  handlerMap[handler] = wrapped;

  if (localOnly) {
    jEventBus.registerLocalHandler(address, wrapped);
  } else {
    jEventBus.registerHandler(address, wrapped);
  }
  return eventBus;
}

function convertMessage(message) {
  var msgType = typeof message;
  switch (msgType) {
    case 'string':
    case 'boolean':
    case 'undefined':
    case 'org.vertx.java.core.buffer.Buffer':
      break;
    case 'number':
      message = (message % 1 === 0) ? message 
                                    : java.lang.Double.parseDouble(message.toString())
      break;
    case 'object':
      // If null then we just wrap it as an empty JSON message
      // We don't do this if it's a Java class (it has the getClass) method
      // since it may be a Buffer which we want to let through
      if (message == null || typeof message.getClass === "undefined") {
        // Not a Java object - assume JSON message
        message = new org.vertx.java.core.json.JsonObject(JSON.stringify(message));
      }
      break;
    default:
      throw 'Invalid type for message: ' + msgType;
  }
  return message;
}

function sendOrPub(send, address, message, replyHandler) {
  if (!address) {
    throw "address must be specified";
  }
  if (typeof address !== "string") {
    throw "address must be a string";
  }
  if (replyHandler && typeof replyHandler !== "function") {
    throw "replyHandler must be a function";
  }
  message = convertMessage(message);
  if (send) {
    if (replyHandler) {
      var wrapped = wrappedHandler(replyHandler);
      jEventBus.send(address, message, wrapped);
    } else {
      jEventBus.send(address, message);
    }
  } else {
    jEventBus.publish(address, message);
  }
  return eventBus;
}

module.exports = eventBus;

