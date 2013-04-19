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


if (!vertx.env) {
  vertx.env = vertx.container.env();
}

if (!vertx.config) {
  conf = vertx.container.config();
  vertx.config =  conf == null ? null : JSON.parse(conf.encode());
}

if (!vertx.logger) {
  vertx.logger = vertx.container.logger();

  // Add a console object which will be familiar to JavaScript devs
  vertx.console = {
    // TODO this should take varargs and allow formatting a la sprintf
    log: function(msg) {
      stdout.println(msg);
    },
    warn: function(msg) {
      stderr.println(msg);
    },
    error: function(msg) {
      stderr.println(msg);
    }
  };
}

if (!vertx.deployVerticle) {
  (function() {

    load('helpers.js');

    var VERTICLE = 0;
    var WORKER = 1;
    var MODULE = 2;

    function deploy(deployType, name, args) {

      var doneHandler = getArgValue('function', args);
      var multiThreaded = getArgValue('boolean', args);
      var instances = getArgValue('number', args);
      var config = getArgValue('object', args);
      if (config != null) {
        // Convert to Java Json Object
        var str = JSON.stringify(config);
        config = new org.vertx.java.core.json.JsonObject(str);
      }
      if (doneHandler != null) {
        doneHandler = adaptAsyncResultHandler(doneHandler);
      }
      if (multiThreaded === null) {
        multiThreaded = false;
      }
      if (instances === null) {
        instances = 1;
      }
      
      switch (deployType) {
        case VERTICLE: {
          vertx.container.deployVerticle(name, config, instances, doneHandler);
          break;
        }
        case WORKER: {
          vertx.container.deployWorkerVerticle(name, config, instances, multiThreaded, doneHandler);
          break;
        }
        case MODULE: {
          vertx.container.deployModule(name, config, instances, doneHandler);
          break;
        }
      }
    }

    vertx.deployVerticle = function(main) {
      var args = Array.prototype.slice.call(arguments);
      args.shift();
      deploy(VERTICLE, main, args);
    }

    vertx.deployWorkerVerticle = function(main, config, instances, doneHandler) {
      var args = Array.prototype.slice.call(arguments);
      args.shift();
      deploy(WORKER, main, args);
    }

    vertx.deployModule = function(moduleName, config, instances, doneHandler) {
      var args = Array.prototype.slice.call(arguments);
      args.shift();
      deploy(MODULE, main, args);
    }

    vertx.undeployVerticle = function(name, doneHandler) {
      if (doneHandler) {
        doneHandler = adaptAsyncResultHandler(doneHandler);
      } else {
        doneHandler = null;
      }
      vertx.container.undeployVerticle(name, doneHandler);
    }

    vertx.undeployModule = function(name, doneHandler) {
      if (doneHandler) {
        doneHandler = adaptAsyncResultHandler(doneHandler);
      } else {
        doneHandler = null;
      }
      vertx.container.undeployModule(name, doneHandler);
    }

    vertx.exit = function() {
      vertx.container.exit();
    }

  })();
}



