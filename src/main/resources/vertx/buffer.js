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
 * The vert.x Buffer module
 * @typedef {module:vertx/buffer} Buffer
 */

/**
 * The Java vert.x Buffer object is used directly in JavaScript. An instance
 * of this is returned when requiring a 'vertx/buffer' and using the new
 * keyword
 *
 * @example
 * var Buffer = require('vertx/buffer');
 * var buff   = new Buffer('Hello!'); // this is actually a java thing
 *
 * @external org.vertx.java.core.buffer.Buffer
 */

/**
 *
 * Most data in vert.x is shuffled around using buffers.
 *
 * A Buffer represents a sequence of zero or more bytes that can be written to
 * or read from, and which expands automatically as necessary to accomodate any
 * bytes written to it. You can perhaps think of a buffer as smart byte array.
 *
 * Buffers are actually Java objects - the exact same as those documented in the
 * vert.x Java documents. The methods documented for the Java Buffer objects
 * are applicable to Javascript Buffer instances as well. 
 *
 * Maybe some examples are in order.
 *
 * @example <caption>Creating Buffers</caption>
 * var Buffer = require('vertx/buffer');
 *
 * // Create a buffer from a string with UTF-8 encoding (the default)
 * var buff = new Buffer('Now is the winter of our discontent made glorioius summer');
 *
 * // Create a buffer from a string and specify an encoding
 * buff = new Buffer('Too hot, too hot!', 'UTF-16');
 *
 * // etc etc
 * // TODO: Finish these examples
 *
 * @constructor
 */
var Buffer = org.vertx.java.core.buffer.Buffer;


/**
 * @module vertx/buffer
 */
module.exports = Buffer;
