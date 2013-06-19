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

/**
 * The 'vertx' module provides all of the vertx API namespaced 
 * under 'vertx'. For example:
 *
 * @example
 * var vertx  = require('vertx');
 * var buff   = new vertx.Buffer('some string');
 * var bus    = vertx.eventBus;
 * var client = vertx.http.createHttpClient();
 *
 * // Each of the modules imported by vertx may also be required as 
 * //individual modules. For example:
 *
 * var http   = require('vertx/http');
 * var server = http.createHttpServer();
 * var client = http.createHttpClient();
 *
 * var Buffer = require('vertx/buffer');
 * var buff   = new Buffer('another string');
 *
 * @exports vertx
 */
var vertx = {};

function addProps(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      vertx[key] = obj[key];
    }
  }
}

   
/** 
 * The vert.x Buffer class. 
 * See the {@linkcode module:vertx/buffer|vertx/buffer} module.
 * */
vertx.Buffer = require('vertx/buffer');

/**
 * The vert.x distributed event bus.
 * See the {@linkcode module:vertx/event_bus|vertx/event_bus} module.
 */
vertx.eventBus = require('vertx/event_bus');
addProps(require('vertx/net'));
addProps(require('vertx/http'));
vertx.Pump = require('vertx/pump');

// See if this fixes the intermittent 
// build failures with vertx.setTimer
var Timers = require('vertx/timer');
vertx.setTimer     = Timers.setTimer;
vertx.setPeriodic  = Timers.setPeriodic;
vertx.cancelTimer  = Timers.cancelTimer;
vertx.runOnContext = Timers.runOnContext;

addProps(require('vertx/sockjs'));
addProps(require('vertx/parse_tools'));
addProps(require('vertx/shared_data'));
vertx.fileSystem = require('vertx/file_system');

/**
 * Put the task on the event queue for this loop so it will be run asynchronously
 * immediately after this event is processed.
 *
 * @param {Handler} handler The handler to be called
 */
vertx.runOnContext = function(task) {
  __jvertx.runOnContext(task);
}

vertx.currentContext = function() {
  return __jvertx.currentContext();
}

module.exports = vertx;

// JSDoc @typedef declarations go here. This is primarily a documentation
// convenience.  Typically a @typedef will just be a reference to a module or a
// type within a module.

/**
 * Vert.x makes heavy use of callback handlers in the API. A callback
 * handler simply a function that is called when events are fired.
 * If there is an error, the first parameter passed to the function
 * will indicate the cause. If not, the handler will be called with
 * the result specified. Handlers are registered with specific components
 * to enable notification and action based on events defined by those
 * components.
 *
 * @example
 * var http = require('vertx/http');
 * var server = http.createHttpServer();
 *
 * server.requestHandler( function( request ) {
 *   // This function is executed for each
 *   // request event on our server
 * } );
 *
 * @typedef {function} Handler
 */

/**
 * The vert.x Buffer type is defined in the 
 * {@linkcode module:vertx/buffer|vertx/buffer} module
 * @typedef {module:vertx/buffer~Buffer} Buffer
 */

/** 
 * A DeploymentId is used to identify a specific verticle deployment.
 * See the {@linkcode module:vertx/container|vertx/container} module.
 * @typedef {string} DeploymentId 
 * */

/** 
 * The EventBus is a distributed lightweight messaging bus. 
 * See the {@linkcode module:vertx/event_bus|vertx/event_bus} module.
 * @typedef {module:vertx/event_bus} EventBus 
 * */

/**
 * The vert.x FileSystem object contains a broad set of operations for manipulating files.
 * An asynchronous and a synchronous version of each operation is provided.
 * The asynchronous versions take a handler as a final argument which is
 * called when the operation completes or an error occurs. The handler is called
 * with two arguments; the first an exception, this will be nil if the operation has
 * succeeded. The second is the result - this will be nil if the operation failed or
 * there was no result to return.
 * The synchronous versions return the results, or throw exceptions directly.
 * @typedef {module:vertx/file_system} FileSystem
 */

/** 
 * Pumps data from a ReadStream to a WriteStream and performs flow control
 * where necessary to prevent the write stream from getting overloaded.
 * @typedef {module:vertx/pump~Pump} Pump 
 * */

/**
 * A file on the file system that supports asynchronous operations.
 * @typedef {module:vertx/file_system.AsyncFile} AsyncFile 
 */

/**
 * Represents a map that can have multiple values for a given key.
 * @typedef {module:vertx/multi_map~MultiMap} MultiMap
 */

/**
 * Represents a server-side HTTP request
 * @typedef {module:vertx/http.HttpServerRequest} HttpServerRequest
 */

/**
 * Represents a server-side HTTP response
 * @typedef {module:vertx/http.HttpServerResponse} HttpServerResponse
 */

/**
 * Represents a WebSocket object
 * @typedef {module:vertx/http.WebSocket} WebSocket
 */

/** 
 * A TimerId is just a number that identifies a given timer.
 * See the {@linkcode module:vertx/timer|vertx/timer} module.
 * @typedef {number} TimerId 
 * */

