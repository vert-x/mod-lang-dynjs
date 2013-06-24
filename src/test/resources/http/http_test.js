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

var vertx = require('vertx');
var vertxTest = require('vertx_tests');
var vassert = vertxTest.vassert;

var tu = require('test_utils');

var port = 8080
var server = vertx.http.createHttpServer();
var client = vertx.http.createHttpClient().port(port);

function testFormFileUpload() {
  var content = "Vert.x rocks!";
  server.requestHandler(function(req) {
    if (req.uri() === '/form') {
      req.response.chunked(true);
      req.uploadHandler(function(event) {
        event.dataHandler(function(buffer) {
          vassert.assertEquals(content, buffer.toString());
        });
      });
      req.endHandler(function() {
        var attrs = req.formAttributes();
        vassert.assertEquals(attrs.get('name'), "file");
        vassert.assertEquals(attrs.get('filename'), "tmp-0.txt");
        vassert.assertEquals(attrs.get('Content-Type'), "image/gif");
        req.response.end();
      });
    }
  });
  server.listen(8080, "0.0.0.0", function(err, serv) {
    vassert.assertEquals(err, null);
    client.port(8080);
    var req = client.post("/form", function(resp) {
      // assert the response
      vassert.assertTrue(200 === resp.statusCode());
      resp.bodyHandler(function(body) {
        vassert.assertTrue(0 === body.length());
      });
      vassert.testComplete();
    });

    var boundary = "dLV9Wyq26L_-JQxk6ferf-RT153LhOO";
    var buffer = new vertx.Buffer();
    var b =
        "--" + boundary + "\r\n" +
        "Content-Disposition: form-data; name=\"file\"; filename=\"tmp-0.txt\"\r\n" +
        "Content-Type: image/gif\r\n" +
        "\r\n" +
        content + "\r\n" +
        "--" + boundary + "--\r\n";

    buffer.appendString(b);
    req.headers().set("content-length", '' + buffer.length());
    req.headers().set("content-type", "multipart/form-data; boundary=" + boundary);
    req.write(buffer).end();
  });
}

function testFormUploadAttributes() {
    var content = "Vert.x rocks!";
    server.requestHandler(function(req) {

        if (req.uri() === '/form') {
            req.response.chunked(true);
            req.uploadHandler(function(event) {
                event.dataHandler(function(buffer) {
                    vassert.fail("Data handler should not be called");
                });
            });
            req.endHandler(function() {
                var attrs = req.formAttributes();
                vassert.assertEquals(attrs.get('framework'), "vertx");
                vassert.assertEquals(attrs.get('runson'), "jvm");
                req.response.end();
            });
        }
    });
    server.listen(8080, "0.0.0.0", function(err, serv) {
        vassert.assertEquals(err, null);
        client.port(8080);
        var req = client.post("/form", function(resp) {
            // assert the response
            vassert.assertTrue(200 === resp.statusCode());
            resp.bodyHandler(function(body) {
                vassert.assertTrue(0 === body.length());
            });
            vassert.testComplete();
        });

        var buffer = new vertx.Buffer();
        buffer.appendString("framework=vertx&runson=jvm");
        req.headers().set("content-length", '' + buffer.length());
        req.headers().set("content-type", "application/x-www-form-urlencoded");
        req.write(buffer).end();
    });
}


// This is just a basic test. Most testing occurs in the Java tests

function testGET() {
  httpMethod(false, "GET", false)
}

function testGetSSL() {
  httpMethod(true, "GET", false)
}

function testPUT() {
  httpMethod(false, "PUT", false)
}

function testPUTSSL() {
  httpMethod(true, "PUT", false)
}

function testPOST() {
  httpMethod(false, "POST", false)
}

function testPOSTSSL() {
  httpMethod(true, "POST", false)
}

function testHEAD() {
  httpMethod(false, "HEAD", false)
}

function testHEADSSL() {
  httpMethod(true, "HEAD", false)
}

function testOPTIONS() {
  httpMethod(false, "OPTIONS", false)
}

function testOPTIONSSSL() {
  httpMethod(true, "OPTIONS", false)
}
function testDELETE() {
  httpMethod(false, "DELETE", false)
}

function testDELETESSL() {
  httpMethod(true, "DELETE", false)
}

function testTRACE() {
  httpMethod(false, "TRACE", false)
}

function testTRACESSL() {
  httpMethod(true, "TRACE", false)
}

function testCONNECT() {
  httpMethod(false, "CONNECT", false)
}

function testCONNECTSSL() {
  httpMethod(true, "CONNECT", false)
}

function testPATCH() {
  httpMethod(false, "PATCH", false)
}

function testPATCHSSL() {
  httpMethod(true, "PATCH", false)
}

function testGETChunked() {
  httpMethod(false, "GET", true)
}

function testGetSSLChunked() {
  httpMethod(true, "GET", true)
}

function testPUTChunked() {
  httpMethod(false, "PUT", true)
}

function testPUTSSLChunked() {
  httpMethod(true, "PUT", true)
}

function testPOSTChunked() {
  httpMethod(false, "POST", true)
}

function testPOSTSSLChunked() {
  httpMethod(true, "POST", true)
}

function testHEADChunked() {
  httpMethod(false, "HEAD", true)
}

function testHEADSSLChunked() {
  httpMethod(true, "HEAD", true)
}

function testOPTIONSChunked() {
  httpMethod(false, "OPTIONS", true)
}

function testOPTIONSSSLChunked() {
  httpMethod(true, "OPTIONS", true)
}

function testDELETEChunked() {
  httpMethod(false, "DELETE", true)
}

function testDELETESSLChunked() {
  httpMethod(true, "DELETE", true)
}

function testTRACEChunked() {
  httpMethod(false, "TRACE", true)
}

function testTRACESSLChunked() {
  httpMethod(true, "TRACE", true)
}

function testCONNECTChunked() {
  httpMethod(false, "CONNECT", true)
}

function testCONNECTSSLChunked() {
  httpMethod(true, "CONNECT", true)
}

function testPATCHChunked() {
  httpMethod(false, "PATCH", true)
}

function testPATCHSSLChunked() {
  httpMethod(true, "PATCH", true)
}

function httpMethod(ssl, method, chunked) {

  if (ssl) {
    server.ssl(true);
    server.keyStorePath('./src/test/keystores/server-keystore.jks');
    server.keyStorePassword('wibble');
    server.trustStorePath('./src/test/keystores/server-truststore.jks');
    server.trustStorePassword('wibble');
    server.clientAuthRequired(true);
  }

  var path = "/someurl/blah.html";
  var query = "param1=vparam1&param2=vparam2";
  var uri = (ssl ? "https" : "http") +"://localhost:" + port + path + "?" + query;

  var statusCode = 200;
  var statusMessage = 'gerbils';

  server.requestHandler(function(req) {
    vassert.assertTrue(req.version() == 'HTTP_1_1');
    vassert.assertTrue(req.method() == method);
    vassert.assertTrue(uri == req.uri());
    vassert.assertTrue(req.path() == path);
    vassert.assertTrue(req.query() == query);

    var headers = req.headers();
    var params  = req.params();

    vassert.assertEquals(headers.get('header1'), 'vheader1');
    vassert.assertEquals(headers.get('header2'), 'vheader2');

    vassert.assertTrue(headers.contains('header1'));
    vassert.assertTrue(headers.contains('header2'));
    vassert.assertTrue(headers.contains('header3'));

    vassert.assertTrue(!headers.isEmpty());

    vassert.assertEquals(params.get('param1'), 'vparam1');
    vassert.assertEquals(params.get('param2'), 'vparam2');

    headers.remove('header3');
    vassert.assertTrue(!headers.contains('header3'));

    req.response.headers().set('rheader1',  'vrheader1');
    req.response.putHeader('rheader2', 'vrheader2');
    if (method !== 'CONNECT') {
      req.response.statusCode(statusCode);
    }
    req.response.statusMessage(statusMessage);
    var body = new vertx.Buffer(0);
    req.dataHandler(function(data) {
      body.appendBuffer(data);
    });
    if (method !== 'HEAD' && method !== 'CONNECT') {
      req.response.chunked(chunked);
    }
    req.endHandler(function() {
      if (!chunked) {
        req.response.headers().set('Content-Length',  '' + body.length());
      }
      if (method !== 'HEAD' && method !== 'CONNECT') {
        req.response.write(body);
        if (chunked) {
          req.response.trailers().set('trailer1', 'vtrailer1');
          req.response.putTrailer('trailer2', 'vtrailer2');
        }
      }
      req.response.end();
    });
  });
  server.listen(port, "0.0.0.0", function(err, serv) {
    vassert.assertTrue(err === null);
    if (ssl) {
      client.ssl(true);
      client.keyStorePath('./src/test/keystores/client-keystore.jks');
      client.keyStorePassword('wibble');
      client.trustStorePath('./src/test/keystores/client-truststore.jks');
      client.trustStorePassword('wibble');
    }

    var sent_buff = tu.generateRandomBuffer(1000);

    var request = client.request(method, uri, function(resp) {
      vassert.assertTrue(200 === resp.statusCode());
      vassert.assertTrue('vrheader1' === resp.headers().get('rheader1'));
      vassert.assertTrue('vrheader2' === resp.headers().get('rheader2'));
      var body = new vertx.Buffer(0);
      resp.dataHandler(function(data) {
        tu.checkThread();
        body.appendBuffer(data);
      });

      resp.endHandler(function() {
        tu.checkThread();
        if (method !== 'HEAD' && method !== 'CONNECT') {
          vassert.assertTrue(tu.buffersEqual(sent_buff, body));
          if (chunked) {
            vassert.assertTrue('vtrailer1' === resp.trailers().get('trailer1'));
            vassert.assertTrue('vtrailer2' === resp.trailers().get('trailer2'));
          }
        }
        resp.headers().clear();
        vassert.assertTrue(resp.headers().isEmpty());
        vassert.testComplete();
      });
    });

    request.chunked(chunked);
    request.putHeader('header1', 'vheader1');
    request.headers().set('header2', 'vheader2');
    if (!chunked) {
      request.putHeader('Content-Length', '' + sent_buff.length())
    }
 
    request.headers().add('header3', 'vheader3_1').add('header3', 'vheader3')
    var headers = request.headers();
    var size = headers.size()
    var names = headers.names()
    var names_count = 0
    vassert.assertTrue(size == names.length)

    headers.forEach(function(k, v) {
      vassert.assertTrue(request.headers().getAll(k).indexOf(v) > -1);
    })

    request.write(sent_buff);

    request.end();
  });
}

vertxTest.startTests(this);

function vertxStop() {
  client.close();
  server.close();
}

