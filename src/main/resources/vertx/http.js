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
 * The http module provides HTTP functions. 
 *
 * @exports vertx/http
 */
var http = {};
var net = require('vertx/net');
var MultiMap = require('vertx/multi_map').MultiMap;

load("vertx/read_stream.js");
load("vertx/write_stream.js");
load("vertx/ssl_support.js");
load("vertx/tcp_support.js");
load("vertx/helpers.js");

/**
 * Represents a server-side HttpServerRequest object. This object is created internally
 * by vert.x and passed as a parameter to a request listener.
 *
 * @example
 * var http    = require('vertx/http');
 * var console = require('vertx/console');
 *
 * var server = http.createHttpServer();
 * server.requestHandler(function(request) {
 *
 *   // Get headers from the HttpServerRequest object
 *   // and write them to the console
 *   for (var k in request.headers()) {
 *     console.log(k + ": " + headers[k]);
 *   }
 * 
 *   request.response.end(str);
 * 
 * }).listen(8080, 'localhost');
 *
 * @class 
 * @param {org.vertx.java.core.http.HttpServerRequest} request the underlying
 * Java HttpServerRequest object
 * @mixes readStream~ReadStream
 */
http.HttpServerRequest = function(jreq) {
  var reqHeaders   = null;
  var reqParams    = null;
  var version      = null;
  var reqFormAttrs = null;
  var netSocket    = null;
  var that         = this;

  readStream(this, jreq);

  /**
   * The HTTP version - either HTTP_1_0 or HTTP_1_1
   *
   * @returns {string} version
   */
  this.version = function() {
    if (version === null) {
      version = jreq.version().toString();
    }
    return version;
  }

  /**
   * Get the raw Java NetSocket. Primarily for internal use, but if you really must
   * roll your own websockets or some such, this will let you do that.
   * @returns {org.vertx.java.core.net.NetSocket}
   */
  this.netSocket = function() {
    if (netSocket === null) {
      netSocket = net.__jsNetSocket(jreq.netSocket());
    }
    return netSocket;
  }

  /**
   * The HTTP method, one of HEAD, OPTIONS, GET, POST, PUT, DELETE, CONNECT, TRACE
   *
   * @returns {string} The HTTP method
   */
  this.method = function() {
    return jreq.method();
  }

  /**
   * The uri of the request. For example
   * http://www.somedomain.com/path/morepath/resource.foo?param=32&otherparam=x
   *
   * @returns {string} uri
   */
  this.uri = function() {
    return jreq.uri();
  }

  /**
   * The path part of the uri. For example /path/morepath/resource.foo
   *
   * @returns {string} path
   */
  this.path = function() {
    return jreq.path();
  }

  /**
   * The query part of the uri. For example param=32&otherparam=x
   *
   * @returns {string} query
   */
  this.query = function() {
    return jreq.query();
  }

  /**
   * The headers of the request.
   *
   * @returns {MultiMap}
   */
  this.headers = function() {
    if (!reqHeaders) {
      reqHeaders = new MultiMap(jreq.headers());
    }
    return reqHeaders;
  }

  /**
   * Return the remote (client side) address of the request
   *
   * @returns {MultiMap}
   */
  this.params = function() {
    if (!reqParams) {
      reqParams = new MultiMap(jreq.params());
    }
    return reqParams;
  }

  /**
   * @external java.net.InetSocketAddress
   */

  /**
   * Get the address of the remote peer as a Java InetSocketAddress object
   *
   * @return {java.net.InetSocketAddress} the underlying Java socket address instance
   */
  this.remoteAddress = function() {
    return jreq.remoteAddress();
  }

  /**
   * Get an array of Java X509Certificate objects
   *
   * @return {Array} Array of Java X509Certificate objects
   */
  this.peerCertificateChain = function() {
    return jreq.peerCertificateChain();
  }

  /**
   * Return the absolute URI corresponding to the the HTTP request
   *
   * @returns {string} absoluteURI
   */
  this.absoluteURI = function() {
    return jreq.absoluteURI();
  }

  /**
   * Return a form attributes object
   *
   * @returns {MultiMap} The form attributes
   */
  this.formAttributes = function() {
    if (!reqFormAttrs) {
      reqFormAttrs =  new MultiMap(jreq.formAttributes());
    }
    return reqFormAttrs;
  }

  /**
   * Set the upload handler. The handler will get notified once a new file
   * upload was received and so allow to get notified by the upload in
   * progress.
   *
   * @param {Handler} handler The handler to call
   * @returns {HttpServerRequest} this
   */
  this.uploadHandler = function(handler) {
    if (handler) {
      jreq.uploadHandler(wrapUploadHandler(handler));
    }
    return that;
  }

  /**
   *  Set the body handler for this request, the handler receives a single
   *  Buffer object as a parameter.  This can be used as a decorator.
   *
   * @param {Handler} handler The handler to call once the body was received
   * @returns {HttpServerRequest} this
   */
  this.bodyHandler = function(handler) {
    jreq.bodyHandler(handler);
    return that;
  }

  var jresp = jreq.response();

  /**
   * @property HttpResponse response
   */
  this.response = new http.HttpServerResponse(jresp);

  /**
   * @private
   */
  this._to_java_request = function() {
    return jreq;
  }
}

/**
 * <p>
 * A server-side HTTP response.
 * An instance of this class is created and associated to every instance of
 * {@linkcode HttpServerRequest} that is created.
 * </p>
 *
 * <p>
 * It allows the developer to control the HTTP response that is sent back to
 * the client for a partcular HTTP request. It contains methods that allow HTTP
 * headers and trailers to be set, and for a body to be written out to the
 * response.  
 * </p>
 *
 * @class
 * @mixes writeStream~WriteStream
 */
http.HttpServerResponse = function(jresp) {
  var that = this;
  var respHeaders = null;
  var respTrailers = null;

  /**
   * Get or set HTTP status code of the response.
   * @param {number} [code] The HTTP status code, e.g. 200
   * @returns {number|HttpServerResponse} If a status code is supplied, this method
   * sets it and returns itself. If a status code is not provided, return the current
   * status code for this response.
   */
  this.statusCode = function(code) {
    if (code) {
      jresp.setStatusCode(code);
      return that;
    } else {
      return jresp.getStatusCode();
    }
  }

  /**
   * Get or set HTTP status message of the response.
   * @param {string} [message] The HTTP status message.
   * @returns {string|HttpServerResponse} 
   */
  this.statusMessage = function(msg) {
    if (msg) {
      jresp.setStatusMessage(msg);
      return that;
    } else {
      return jresp.getStatusMessage();
    }
  }

  /**
   * Get or set if the response is chunked
   * @param {boolean} [chunked] Whether or not the response will be chunked encoding
   * @returns {boolean|HttpServerResponse}
   */
  this.chunked = function(ch) {
    if (ch) {
      jresp.setChunked(ch);
      return that;
    } else {
      return jresp.isChunked();
    }
  }

  /**
   * Return the http headers of the response
   * @returns {MultiMap}
   */
  this.headers = function() {
    if (!respHeaders) {
      respHeaders = new MultiMap(jresp.headers());
    }
    return respHeaders;
  }

  /**
   * Put a header on the response.
   *
   * @param {string} headerName The name under which the header should be stored
   * @param {string} headerValue T the value of the header
   * @returns {HttpServerResponse}
   */
  this.putHeader = function(k, v) {
    jresp.putHeader(k, v);
    return that;
  }

  /**
   * Return the trailing headers of the response
   *
   * @returns {MultiMap}
   */
  this.trailers = function() {
    if (!respTrailers) {
      respTrailers = new MultiMap(jresp.trailers());
    }
    return respTrailers;
  }

  /**
   * Put a trailing header
   *
   * @param {string} trailerName The name under which the header should be stored
   * @param {string} trailerValue The value of the trailer
   * @returns {HttpServerResponse}
   */
  this.putTrailer = function(k, v) {
    jresp.putTrailer(k, v);
    return that;
  }

  /**
   * Write content to the response
   *
   * @param {string} body The body of the response.
   * @param {string} [encoding] The character encoding, defaults to UTF-8
   * @returns {HttpServerResponse} Returns self
   */
  this.write = function(body, encoding) {
    if (encoding === undefined) {
      jresp.write(body);
    } else {
      jresp.write(body, encoding);
    }
    return that;
  }

  /**
   * Forces the head of the request to be written before end is called on the
   * request. This is normally used to implement HTTP 100-continue handling,
   * see continue_handler for more information.
   *
   * @returns {HttpServerResponse}
   */
  this.sendHead = function() {
    jresp.sendHead();
    return that;
  }

  /**
   * <p>
   * Ends the response. If no data has been written to the response body,
   * the actual response won't get written until this method gets called.
   * </p>
   * <p>
   * Once the response has ended, it cannot be used any more.
   * </p>
   *
   * @param {string} [chunk] a string to write to the data stream before closing
   * @param {string} [encoding] the encoding to use for the write (default is UTF-8)
   */
  this.end = function(arg0, arg1) {
    if (arg0) {
      if (arg1) {
        jresp.end(arg0, arg1);
      } else {
        jresp.end(arg0);
      }
    } else {
      jresp.end();
    }
  }

  /**
   * Tell the kernel to stream a file directly from disk to the outgoing
   * connection, bypassing userspace altogether (where supported by the
   * underlying operating system. This is a very efficient way to serve
   * files.
   *
   * @param {string} fileName Path to file to send.
   * @param {string} notFoundFile Path to a file to send if <code>fileName</code> can't be found.
   * @returns {HttpServerResponse}
   */
  this.sendFile = function(fileName, notFoundFile) {
    if (notFoundFile === undefined) {
      jresp.sendFile(fileName);
    } else {
      jresp.sendFile(fileName, notFoundFile);
    }
    return that;
  }

  writeStream(that, jresp);
}

function wrappedRequestHandler(handler) {
  return function(jreq) {
    handler(new http.HttpServerRequest(jreq));
  }
}

/**
 * Represents an upload from an HTML form. Created internally and provided to upload
 * handlers. Instances of this class should not be created externally.
 *
 * @constructor
 * @mixes readStream~ReadStream
 */
http.HttpServerFileUpload = function(jupload) {
  readStream(this, jupload);
  /**
   * Stream the upload to the given file
   *
   * @param {string} filename The file to which it wil be streamed
   * @returns {http.HttpServerFileUpload}
   */
  upload.streamToFileSystem = function(filename) {
    jupload.streamToFileSystem(filename);
    return this;
  };

  /**
   * The filename of the upload
   *
   * @returns {string} filenmae
   */
  this.filename = function() {
    return jupload.filename();
  };

  /**
   * The name of the upload
   *
   * @returns {string} name
   */
  this.name = function() {
    return jupload.name();
  };

  /**
   * The content type
   *
   * @returns {string} contentType
   */
  this.contentType = function() {
    return jupload.contentType();
  };

  /**
   * The content transfer encoding
   *
   * @returns {string} contentTransferEncoding
   */
  this.contentTransferEncoding = function() {
    return jupload.contentTransferEncoding();
  }

  /**
   * The charset
   *
   * @returns {string} charset
   */
  this.charset = function() {
    return jupload.charset().toString();
  }

  /**
   * The size
   *
   * @returns {number} size
   */
  this.size = function() {
    return jupload.size();
  }
}

function wrapUploadHandler(handler) {
  return function(jupload) {
    handler(new http.HttpServerFileUpload(jupload));
  }
}

/**
 * <p>Represents an HTML 5 Websocket</p>
 * <p>Instances of this class are created and provided to the handler of an
 * {@linkcode HttpClient} when a successful websocket connect attempt occurs.</p>
 * <p>It implements both {@linkcode readStream~ReadStream|ReadStream} and 
 * {@linkcode writeStream~WriteStream|WriteStream} so it can be used with
 * {@linkcode module:vertx/Pump.Pump|Pump} to pump data with flow control.</p>
 *
 * @constructor
 *
 * @param {org.vertx.java.core.http.WebSocketBase} jWebSocket The java WebSocketBase object
 * @param {boolean} [server] whether this is a server-side websocket (default: false)
 *
 * @mixes readStream~ReadStream
 * @mixes writeStream~WriteStream
 */
http.WebSocket = function(jwebsocket, server) {
  var headers = null;
  readStream(this, jwebsocket);
  writeStream(this, jwebsocket);

  /**
   * When a WebSocket is created it automatically registers an event handler
   * with the eventbus, the ID of that handler is returned.
   *
   * Given this ID, a different event loop can send a binary frame to that
   * event handler using the event bus and that buffer will be received by
   * this instance in its own event loop and written to the underlying
   * connection. This allows you to write data to other websockets which are
   * owned by different event loops.
   *
   * @returns {string} id
   */
  this.binaryHandlerID = function() {
    return jwebsocket.binaryHandlerID();
  };

  /**
   * When a WebSocket is created it automatically registers an event handler
   * with the eventbus, the ID of that handler is returned.
   *
   * Given this ID, a different event loop can send a text frame to that
   * event handler using the event bus and that buffer will be received by
   * this instance in its own event loop and written to the underlying
   * connection. This allows you to write data to other websockets which are
   * owned by different event loops.
   *
   * @returns {string} id
   */
  this.textHandlerID = function() {
    return jwebsocket.textHandlerID();
  };

  /**
   *  Write data to the websocket as a binary frame
   *
   * @param {Buffer} data
   */
  this.writeBinaryFrame = function(data) {
    jwebsocket.writeBinaryFrame(data);
  };

  /**
   *  Write data to the websocket as a text frame
   *
   * @param {Buffer} data
   */
  this.writeTextFrame = function(data) {
    jwebsocket.writeTextFrame(data);
  };

  /**
   * Set a closed handler on the connection, the handler receives no parameters.
   *
   * @param {Handler} handler
   * @returns {WebSocket}
   */
  this.closeHandler = function(handler) {
    jwebsocket.closeHandler(handler);
    return this;
  };
  /**
   * Close the websocket connection
   */
  this.close = function() {
    jwebsocket.close();
  };

  if (server) {
    /**
     * The path the websocket connect was attempted at.
     * Only available if this is a server websocket.
     *
     * @returns {string} path
     */
    this.path = function() {
      return jwebsocket.path();
    };

    /**
     * Reject the WebSocket. Sends 404 to client
     * Only available if this is a server websocket.
     *
     * @returns {WebSocket}
     */
    this.reject = function() {
      jwebsocket.reject();
      return ws;
    }
    /**
     * The headers of the handshake request
     * Only available if this is a server websocket.
     *
     * @returns {MultiMap}
     */
    this.headers = function() {
      if (!headers) {
        headers = new MultiMap(jwebsocket.headers());
      }
      return headers;
    }
  }
}

function wrapWebsocketHandler(server, handler) {
  return function(jwebsocket) {
    handler(new http.WebSocket(jwebsocket, server));
  }
}


/**
 * An HTTP and websockets server. Created by calling 
 * {@linkcode module:vertx/http.createHttpServer|createHttpServer}
 *
 * @class
 */
http.HttpServer = function() {
  var that = this;
  var jserver = __jvertx.createHttpServer();

  /**
   * Set the request handler for the server. As HTTP requests are received by
   * the server, instances of 
   * {@linkcode module:vertx/http.HttpServerRequest|HttpServerRequest} will be created
   * and passed to this handler.
   *
   * @param {RequestHandler} handler the function used to handle the request.
   * @return {module:vertx/http.HttpServer}
   */
  this.requestHandler = function(handler) {
    if (handler) {
      if (typeof handler === 'function') {
        handler = wrappedRequestHandler(handler);
      } else {
        // It's a route matcher
        handler = handler._to_java_handler();
      }
      jserver.requestHandler(handler);
    }
    return that;
  }

  /**
   * Set the websocket handler for the server. If a websocket connect
   * handshake is successful a new 
   * {@linkcode module:vertx/http.WebSocket|WebSocket} instance will be created
   * and passed to the handler.
   * 
   
   * @param {Handler} handler the function used to handle the request.
   * @return {module:vertx/http.HttpServer}
   */
  this.websocketHandler = function(handler) {
    if (handler) {
      jserver.websocketHandler(wrapWebsocketHandler(true, handler));
    }
    return that;
  }

  /**
   * Close the server. If a handler is supplied, it will be called
   * when the underlying connection has completed closing.
   *
   * @param {Handler} [handler] The handler to notify when close() completes
   */
  this.close = function(handler) {
    if (jserver) {
      jserver.close(handler);
    } else {
      jserver.close();
    }
  }

  /**
   * Start to listen for incoming HTTP requests
   *
   * @param {number} port The port to listen on
   * @param {string} [host] The host name or IP address
   * @param {Handler} [listenHandler] A handler to be notified when the underlying
   *        system level listen() call has completed.
   * @returns {module:vertx/http.HttpServer}
   */
  this.listen = function() {
    var args = Array.prototype.slice.call(arguments);
    var handler = getArgValue('function', args);
    var host = getArgValue('string', args);
    var port = getArgValue('number', args);
    if (handler) {
      handler = adaptAsyncResultHandler(handler);
    }
    if (host == null) {
      host = "0.0.0.0";
    }
    jserver.listen(port, host, handler);
    return that;
  }

  /**
   * @private
   */
  _to_java_server: function() {
    return jserver;
  }

  sslSupport(this, jserver);
  serverSslSupport(this, jserver);
  tcpSupport(this, jserver);
  serverTcpSupport(this, jserver);
}


/**
 * Return a HttpServer
 *
 * @example
 * var http = require('vertx/http');
 * var server = http.createHttpServer();
 *
 * // setup request handlers and such...
 * server.listen(8080, 'localhost');
 *
 * @desc Create and return an HttpServer object
 * @return {module:vertx/http.HttpServer}
 */
http.createHttpServer = function() {
  return new http.HttpServer();
}

/**
 * Return a HTTP Client
 *
 * @returns {{client}}
 */
http.createHttpClient = function() {

  var jclient = __jvertx.createHttpClient();

  function wrapResponseHandler(handler) {
    return function(jresp) {

      var respHeaders = null;
      var respTrailers = null;

      /**
       *
       * @type {{}}
       */
      var resp = {};
      readStream(resp, jresp)

      /**
       * The HTTP status code of the response.
       *
       * @returns {code} The HTTP Status code
       */
      resp.statusCode = function() {
        return jresp.statusCode();
      };

      /**
       * The HTTP Status message of the response
       *
       * @returns {code} The HTTP Status message
       */
      resp.statusMessage = function() {
        return jresp.statusMessage();
      };

      /**
       * Get all the headers of the response.
       *
       * @returns {respHeaders} The headers
       */
      resp.headers = function() {
        if (!respHeaders) {
          respHeaders = new MultiMap(jresp.headers());
        }
        return respHeaders;
      };

      /**
       * Get all the trailing headers of the response.
       *
       * @returns {respTrailers}
       */
      resp.trailers = function() {
        if (!respTrailers) {
          respTrailers = new MultiMap(jresp.trailers());
        }
        return respTrailers;
      };

      /**
        * The Set-Cookie headers (including trailers)
       *
       * @returns {cookies} The cookies
       */
      resp.cookies = function() {
        return jresp.cookies();
      };

      /**
       * Set a handler to receive the entire body in one go - do not use this for large bodies
       *
       * @param handler The handler to use
       * @returns {resp}
       */
      resp.bodyHandler = function(handler) {
        jresp.bodyHandler(handler);
        return resp;
      };
      handler(resp);
    }
  }

  function wrapRequest(jreq) {
    var reqHeaders = null;

    var req = {};
    writeStream(req, jreq);

    /**
     * Sets or gets whether the request should used HTTP chunked encoding or not.
     *
     * @param ch If val is true, this request will use HTTP chunked encoding, and each call to write to the body
     *  will correspond to a new HTTP chunk sent on the wire. If chunked encoding is used the HTTP header
     * 'Transfer-Encoding' with a value of 'Chunked' will be automatically inserted in the request.
     * @returns {req}
     */
    req.chunked = function(ch) {
      if (ch === undefined) {
        return jreq.isChunked();
      } else {
        jreq.setChunked(ch);
        return req;
      }
    };
    /**
     * Returns the headers for the requests
     *
     * @returns {reqHeaders} The headers
     */
    req.headers = function() {
      if (!reqHeaders) {
        reqHeaders = new MultiMap(jreq.headers());
      }
      return reqHeaders;
    };

    /**
     * Put a header on the request
     *
     * @param k The name under which to store
     * @param V the value to store
     * @returns {req}
     */
    req.putHeader = function(k, v) {
      jreq.putHeader(k, v);
      return req;
    };

    /**
     * Put muliple headers on the request
     *
     * @param k The name under which to store
     * @param V the value to store
     * @returns {req}
     */
    req.putAllHeaders = function(other) {
      var hdrs = wrapped.headers();
      for (var k in other) {
        hdrs[k] = other[k];
      }
      return req;
    };

    /**
     * Write a to the request body
     * @param arg0
     * @param arg1
     * @returns {{}}
     */
    req.write = function(arg0, arg1) {
      if (arg1 === undefined) {
        jreq.write(arg0);
      } else {
        jreq.write(arg0, arg1);
      }
      return req;
    };

    /**
     * If you send an HTTP request with the header 'Expect' set to the value '100-continue'
     * and the server responds with an interim HTTP response with a status code of '100' and a continue handler
     * has been set using this method, then the handler will be called.
     * You can then continue to write data to the request body and later end it. This is normally used in conjunction with
     * the send_head method to force the request header to be written before the request has ended.
     *
     * @param handler The handler
     * @returns {req}
     */
    req.continueHandler = function(handler) {
      jreq.continueHandler(handler);
      return req;
    };

    /**
     * Forces the head of the request to be written before end is called on the request. This is normally used
     * to implement HTTP 100-continue handling, see continue_handler for more information.
     *
     * @returns req
     */
    req.sendHead = function() {
      jreq.sendHead();
      return req;
    };

    /**
     * Ends the request. If no data has been written to the request body, and send_head has not been called then
     * the actual request won't get written until this method gets called.
     * Once the request has ended, it cannot be used any more, and if keep alive is true the underlying connection will
     * be returned to the HttpClient pool so it can be assigned to another request.
     * @param arg0 The data to write
     * @param arg1 The charset to use
     */
    req.end = function(arg0, arg1) {
      if (arg0) {
        if (arg1) {
          jreq.end(arg0, arg1);
        } else {
          jreq.end(arg0);
        }
      } else {
        jreq.end();
      }
    };

    /**
     * Set the timeout
     *
     * @param t The timeout to set
     */
    req.timeout = function(t) {
      jreq.setTimeout(t);
    };
    return req;
  }

  /**
   * An HTTP client.
   * A client maintains a pool of connections to a specific host, at a specific port. The HTTP connections can act
   * as pipelines for HTTP requests.
   * It is used as a factory for HttpClientRequest instances which encapsulate the actual HTTP requests. It is also
   * used as a factory for HTML5 WebSocket websockets.
   * @type {{}}
   */
  var client = {};
  sslSupport(client, jclient);
  clientSslSupport(client, jclient);
  tcpSupport(client, jclient);

  /**
   * Set the exception handler.
   *
   * @param handler The handler which is called on an exception
   * @returns {{}}
   */
  client.exceptionHandler = function(handler) {
    jclient.exceptionHandler(handler);
    return client;
  };

  /**
   * Get or set the maxium number of connections this client will pool
   *
   * @param size
   * @returns {*}
   */
  client.maxPoolSize = function(size) {
    if (size === undefined) {
      return jclient.getMaxPoolSize();
    } else {
      jclient.setMaxPoolSize(size);
      return client;
    }
  };
  /**
   * Get or set if the client use keep alive
   *
   * @param size
   * @returns {*}
   */
  client.keepAlive = function(ka) {
    if (ka === undefined) {
      return jclient.isKeepAlive();
    } else {
      jclient.setKeepAlive(ka);
      return client;
    }
  };

  /**
   * Get or set the port that the client will attempt to connect to on the server on. The default value is 80
   * @param p
   * @returns {*}
   */
  client.port = function(p) {
    if (p === undefined) {
      return jclient.getPort();
    } else {
      jclient.setPort(p);
      return client;
    }
  };

  /**
   *  Get or set the host name or ip address that the client will attempt to connect to on the server on
   *
   * @param h
   * @returns {*}
   */
  client.host = function(h) {
    if (h === undefined) {
      return jclient.getHost();
    } else {
      jclient.setHost(h);
      return client;
    }
  };
  /**
   * Get or set if the host should be verified.  If set then the client will try to validate the remote server's certificate
   * hostname against the requested host. Should default to 'true'.
   * This method should only be used in SSL mode
   *
   * @param h
   * @returns {*}
   */
  client.verifyHost = function(h) {
    if (h === undefined) {
      return jclient.isVerifyHost();
    } else {
      jclient.setVerifyHost(h);
      return client;
    }
  };

  /**
   * Attempt to connect an HTML5 websocket to the specified URI.
   * The connect is done asynchronously and the handler is called with a WebSocket on success.
   *
   * @param uri A relative URI where to connect the websocket on the host, e.g. /some/path
   * @param handler The handler to be called with the WebSocket
   */
  client.connectWebsocket = function(uri, handler) {
    jclient.connectWebsocket(uri, wrapWebsocketHandler(false, handler));
  };

  /**
   * This is a quick version of the get method where you do not want to do anything with the request
   * before sing.
   * With this method the request is immediately sent.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the GET on the server.
   * @param handler The handler to be called

   * @returns {*}
   */
  client.getNow = function(uri, handler) {
    return wrapRequest(jclient.getNow(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP OPTIOS request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the OPTIONS on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.options = function(uri, handler) {
    return wrapRequest(jclient.options(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP GET request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the GET on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.get =function(uri, handler) {
    return wrapRequest(jclient.get(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP HEAD request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the HEAD on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.head =function(uri, handler) {
    return wrapRequest(jclient.head(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP POST request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the POST on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.post = function(uri, handler) {
    return wrapRequest(jclient.post(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP PUT request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the PUT on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.put = function(uri, handler) {
    return wrapRequest(jclient.put(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP DELETE request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the DELETE on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.delete = function(uri, handler) {
    return wrapRequest(jclient.delete(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP TRACE request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the TRACE on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.trace = function(uri, handler) {
    return wrapRequest(jclient.trace(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP CONNECT request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the CONNECT on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.connect = function(uri, handler) {
    return wrapRequest(jclient.connect(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP PATCH request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param uri A relative URI where to perform the PATCH on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.patch = function(uri, handler) {
    return wrapRequest(jclient.patch(uri, wrapResponseHandler(handler)));
  };

  /**
   * his method returns an request which represents an HTTP request with the specified uri.
   * When an HTTP response is received from the server the handler is called passing in the response.
   *
   * @param method The HTTP method which is used for the request
   * @param uri A relative URI where to perform the PUT on the server.
   * @param handler The handler to be called
   * @returns {*}
   */
  client.request = function(method, uri, handler) {
    return wrapRequest(jclient.request(method, uri, wrapResponseHandler(handler)));
  };

  /**
   * Close the client
   */
  client.close = function() {
    jclient.close();
  };
  return client;
}

/**
 * This class allows you to do route requests based on the HTTP verb and the request URI, in a manner similar
 * to <a href="http://www.sinatrarb.com/">Sinatra</a> or <a href="http://expressjs.com/">Express</a>.
 * RouteMatcher also lets you extract paramaters from the request URI either a simple pattern or using
 * regular expressions for more complex matches. Any parameters extracted will be added to the requests parameters
 * which will be available to you in your request handler.
 *
 * It's particularly useful when writing REST-ful web applications.
 *
 * To use a simple pattern to extract parameters simply prefix the parameter name in the pattern with a ':' (colon).
 *
 * Different handlers can be specified for each of the HTTP verbs, GET, POST, PUT, DELETE etc.
 *
 * For more complex matches regular expressions can be used in the pattern. When regular expressions are used, the extracted
 * parameters do not have a name, so they are put into the HTTP request with names of param0, param1, param2 etc.
 *
 * Multiple matches can be specified for each HTTP verb. In the case there are more than one matching patterns for
 a particular request, the first matching one will be used.
 *
 * @constructor
 */
http.RouteMatcher = function() {

  var j_rm = new org.vertx.java.core.http.RouteMatcher();

  this.call = function(req) {
    j_rm.handle(req._to_java_request())
  }

  /**
   * Specify a handler that will be called for a matching HTTP GET
   *
   * @pattern pattern to match
   * @param handler handler for match
   * @return {RouteMatcher}
   */
  this.get = function(pattern, handler) {
    j_rm.get(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP PUT
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.put = function(pattern, handler) {
    j_rm.put(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP POST
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.post = function(pattern, handler) {
    j_rm.post(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP DELETE
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.delete = function(pattern, handler) {
    j_rm.delete(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP OPTIONS
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.options = function(pattern, handler) {
    j_rm.options(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP HEAD
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.head = function(pattern, handler) {
    j_rm.head(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP TRACE
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.trace = function(pattern, handler) {
    j_rm.trace(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP CONNECT
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.connect = function(pattern, handler) {
    j_rm.connect(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP PATCH
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.patch = function(pattern, handler) {
    j_rm.patch(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP ALL
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.all = function(pattern, handler) {
    j_rm.all(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP GET
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}

   */
  this.getWithRegEx = function(pattern, handler) {
    j_rm.getWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP PUT
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.putWithRegEx = function(pattern, handler) {
    j_rm.putWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP POST
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.postWithRegEx = function(pattern, handler) {
    j_rm.postWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP DELETE
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.deleteWithRegEx = function(pattern, handler) {
    j_rm.deleteWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP PUT
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.optionsWithRegEx = function(pattern, handler) {
    j_rm.optionsWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP HEAD
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.headWithRegEx = function(pattern, handler) {
    j_rm.headWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP TRACE
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.traceWithRegEx = function(pattern, handler) {
    j_rm.traceWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP CONNECT
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.connectWithRegEx = function(pattern, handler) {
    j_rm.connectWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP PATCH
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.patchWithRegEx = function(pattern, handler) {
    j_rm.patchWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for a matching HTTP request
   *
   * @param pattern: pattern to match
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.allWithRegEx = function(pattern, handler) {
    j_rm.allWithRegEx(pattern, wrappedRequestHandler(handler));
    return this;
  }

  /**
   * Specify a handler that will be called for HTTP request that not match any pattern.
   *
   * @param handler: http server request handler
   * @return {RouteMatcher}
   */
  this.noMatch = function(handler) {
    j_rm.noMatch(wrappedRequestHandler(handler));
    return this;
  }
  /**
   *
   * @returns {org.vertx.java.core.http.RouteMatcher}
   * @private
   */
  this._to_java_handler = function() {
    return j_rm;
  }
}


module.exports = http;

