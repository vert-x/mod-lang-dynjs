/*
 * Copyright 2011-2013 the original author or authors.
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

if (!vertx.createNetServer) {

  load("convert_handler.js");
  load("core/ssl_support.js");
  load("core/tcp_support.js");
  load("helpers.js");

  vertx.createNetServer = function() {
    var jserver = vertx.__vertx.createNetServer();
    var server = {};
    sslSupport(server, jserver);
    serverSslSupport(server, jserver);
    tcpSupport(server, jserver);
    serverTcpSupport(server, jserver);

    server.connectHandler = function(handler) {
      jserver.connectHandler(function(result) {
        handler(jsNetSocket(result));
      });
    };
    server.listen = function() {
      var args = Array.prototype.slice.call(arguments);
      var handler = getArgValue('function', args);
      var host = getArgValue('string', args);
      var port = getArgValue('number', args);
      if (handler != null) {
        handler = adaptAsyncResultHandler(handler);
      }
      if (host == null) {
        host = "0.0.0.0";
      }
      jserver.listen(port, host, handler);
    };
    server.close = function(handler) {
      if (handler === undefined) {
        jserver.close();
      } else {
        jserver.close(adaptAsyncResultHandler(handler));
      }
    };
    server.port = function() {
      return jserver.port();
    }
    server.host = function() {
      return jserver.host();
    }
    return server;
  }

  vertx.createNetClient = function() {
    var jclient = vertx.__vertx.createNetClient();
    var client = {};
    sslSupport(client, jclient);
    clientSslSupport(client, jclient);
    tcpSupport(client, jclient);
    client.connect = function(arg0, arg1, arg2) {
      var port = arg0;
      var host;
      var handler;
      if (arg2 === undefined) {
        host = 'localhost';
        handler = arg1;
      } else {
        host = arg1;
        handler = arg2;
      }
      jclient.connect(port, host, adaptAsyncResultHandler(handler, function(result) {
        return jsNetSocket(result);
      }));
    };
    client.reconnectAttempts = function(attempts) {
      if (attempts === undefined) {
        return jclient.getReconnectAttempts();
      } else {
        jclient.setReconnectAttempts(attempts);
        return client;
      }
    };
    client.reconnectInterval = function(interval) {
      if (interval === undefined) {
        return jclient.getReconnectInterval();
      } else {
        jclient.setReconnectInterval(interval);
        return client;
      }
    };
    client.connectTimeout = function(timeout) {
      if (timeout === undefined) {
        return jclient.getConnectTimeout();
      } else {
        jclient.setConnectTimeout(timeout);
        return client;
      }
    };
    client.close = function() {
      jclient.close();
    }
    return client;
  }

  load("core/read_stream.js");
  load("core/write_stream.js");

  var jsNetSocket = function(jNetSocket) {
    var netSocket = {};
    readStream(netSocket, jNetSocket);
    writeStream(netSocket, jNetSocket);
    netSocket.writeHandlerID = function() {
      return jNetSocket.writeHandlerID();
    };
    netSocket.write = function(arg0, arg1) {
      if (arg1 === undefined) {
        jNetSocket.write(arg0);
      } else {
        jNetSocket.write(arg0, arg1);
      }
      return netSocket;
    };
    netSocket.sendFile = function(filename) {
      jNetSocket.sendFile(filename);
      return netSocket;
    };
    netSocket.remoteAddress = function() {
      return jNetSocket.remoteAddress();
    };
    netSocket.close = function() {
      jNetSocket.close();
    };
    netSocket.closeHandler = function(handler) {
      jNetSocket.closeHandler(handler);
      return netSocket;
    };
    return netSocket;
  }
}
