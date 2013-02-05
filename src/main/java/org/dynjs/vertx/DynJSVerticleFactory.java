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

package org.dynjs.vertx;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;

import org.dynjs.Config;
import org.dynjs.runtime.AbstractNativeFunction;
import org.dynjs.runtime.DynJS;
import org.dynjs.runtime.DynObject;
import org.dynjs.runtime.ExecutionContext;
import org.dynjs.runtime.GlobalObject;
import org.dynjs.runtime.GlobalObjectFactory;
import org.dynjs.runtime.Runner;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Container;
import org.vertx.java.platform.Verticle;
import org.vertx.java.platform.VerticleFactory;

/**
 * @author Lance Ball lball@redhat.com
 */
public class DynJSVerticleFactory implements VerticleFactory {

    private DynJS runtime;
    private ClassLoader mcl;
    public static Container container;
    public static Vertx vertx;

    @Override
    public void init(Vertx vertx, Container container, ClassLoader classloader) {
        this.mcl = classloader;
        DynJSVerticleFactory.container = container;
        DynJSVerticleFactory.vertx = vertx;
        Config config = new Config();
        config.setGlobalObjectFactory(new GlobalObjectFactory() {
            @Override
            public GlobalObject newGlobalObject(DynJS runtime) {
                final GlobalObject globalObject = new GlobalObject(runtime);
                globalObject.defineGlobalProperty("__dirname", System.getProperty("user.dir"));
                globalObject.defineGlobalProperty("vertx", new DynObject(globalObject));
                globalObject.defineGlobalProperty("load", new AbstractNativeFunction(globalObject) {
                    @Override
                    public Object call(ExecutionContext context, Object self, Object... args) {
                        try {
                            return loadScript(context, (String) args[0]);
                        } catch (FileNotFoundException e) {
                            e.printStackTrace();
                        }
                        return null;
                    }
                });
                return globalObject;
            }
        });
        runtime = new DynJS(config);
    }

    @Override
    public Verticle createVerticle(String main) throws Exception {
        Verticle app = new DynJSVerticle(main);
        return app;
    }

    @Override
    public void reportException(Logger logger, Throwable t) {
        logger.error("Exception in DynJS JavaScript verticle", t);
    }

    public Object loadScript(ExecutionContext context, String scriptName)
            throws FileNotFoundException {
        if (scriptName == null) {
            return null;
        }
        Runner runner = context.getGlobalObject().getRuntime().newRunner();
        File scriptFile = new File(scriptName);
        ExecutionContext parent = context.getParent();
        while (parent != null) {
            context = parent;
            parent = context.getParent();
        }
        if (scriptFile.exists()) {
            return runner.withContext(context).withSource(scriptFile).execute();
        } else {
            InputStream is = mcl.getResourceAsStream(scriptName);
            if (is == null) {
                throw new FileNotFoundException("Cannot find script: " + scriptName);
            }
            System.err.println("Loading script: " + scriptName);
            BufferedReader reader = new BufferedReader(new InputStreamReader(is));
            ClassLoader old = Thread.currentThread().getContextClassLoader();
            Thread.currentThread().setContextClassLoader(mcl);
            try {
                Object ret = runner.withContext(context).withSource(reader).execute();
                try {
                    is.close();
                } catch (IOException ignore) {
                }
                return ret;
            } finally {
                Thread.currentThread().setContextClassLoader(old);
            }
        }
    }

    private class DynJSVerticle extends Verticle {

        private final String scriptName;

        DynJSVerticle(String scriptName) {
            this.scriptName = scriptName;
        }

        @Override
        public void start() throws Exception {
            loadScript(runtime.getExecutionContext(), this.scriptName);
        }

        @Override
        public void stop() throws Exception {
            try {
                runtime.evaluate("(vertxStop ? vertxStop() : null)");
            } catch (Exception e) {
                // If not defined in global scope, we get an exception
            }
        }
    }

    @Override
    public void close() {
    }

}
