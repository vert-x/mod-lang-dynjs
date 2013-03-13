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
import org.dynjs.exception.ThrowException;
import org.dynjs.runtime.AbstractNativeFunction;
import org.dynjs.runtime.DynJS;
import org.dynjs.runtime.DynObject;
import org.dynjs.runtime.ExecutionContext;
import org.dynjs.runtime.GlobalObject;
import org.dynjs.runtime.GlobalObjectFactory;
import org.dynjs.runtime.PropertyDescriptor;
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

    private ClassLoader mcl;
    private ExecutionContext rootContext;
    private GlobalObjectFactory globalObjectFactory;
    public static Container container;
    public static Vertx vertx;

    @Override
    public void init(Vertx vertx, Container container, ClassLoader classloader) {
        this.mcl = classloader;
        DynJSVerticleFactory.container = container;
        DynJSVerticleFactory.vertx = vertx;
    }

    @Override
    public Verticle createVerticle(String main) throws Exception {
        initializeRootContext();
        return new DynJSVerticle(main);
    }

    @Override
    public void reportException(Logger logger, Throwable t) {
        logger.error("Exception in DynJS JavaScript verticle", t);
    }
    
    @Override
    public void close() {
    }

    public GlobalObjectFactory getGlobalObjectFactory() {
        if (globalObjectFactory == null) {
            globalObjectFactory = new DynJSGlobalObjectFactory();
        }
        return globalObjectFactory;
    }

    public ExecutionContext getExecutionContext() {
        return this.rootContext;
    }

    protected void initializeRootContext() {
        Config config = new Config(this.mcl);
        config.setGlobalObjectFactory(getGlobalObjectFactory());
        rootContext = ExecutionContext.createGlobalExecutionContext(new DynJS(config));
    }

    protected Object loadScript(ExecutionContext context, String scriptName)
            throws FileNotFoundException {

        if (scriptName == null) {
            return null;
        }
        Runner runner = context.getGlobalObject().getRuntime().newRunner();
        File scriptFile = new File(scriptName);
        ClassLoader old = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(mcl);
        Object ret = null;
        try {
            if (scriptFile.exists()) {
                ret = runner.withContext(context).withSource(scriptFile).execute();
            } else {
                InputStream is = mcl.getResourceAsStream(scriptName);
                if (is == null) {
                    throw new FileNotFoundException("Cannot find script: " + scriptName);
                }
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                ret = runner.withContext(context).withSource(reader).execute();
                try {
                    is.close();
                } catch (IOException e) {
                    // ignore
                }
            }
        } catch(Exception e) {
            System.err.println("Error loading script: " + scriptName + ". " + e.getLocalizedMessage());
            throw e;
        } finally {
            Thread.currentThread().setContextClassLoader(old);
        }
        return ret;
    }

    protected class DynJSGlobalObjectFactory implements GlobalObjectFactory {

        @Override
        public GlobalObject newGlobalObject(final DynJS runtime) {
            final GlobalObject globalObject = new GlobalObject(runtime);
            globalObject.defineGlobalProperty("__dirname", System.getProperty("user.dir"));
            DynObject dynjs = new DynObject(globalObject);
            dynjs.defineOwnProperty(null, "global", new PropertyDescriptor() {
                {
                    set("Value", globalObject);
                    set("Writable", false);
                    set("Enumerable", true);
                    set("Configurable", true);
                }
            }, false);
            dynjs.defineOwnProperty(null, "runtime", new PropertyDescriptor() {
                {
                    set("Value", runtime);
                    set("Writable", false);
                    set("Enumerable", true);
                    set("Configurable", true);
                }
            }, false);
            globalObject.defineGlobalProperty("dynjs", dynjs);
            globalObject.defineReadOnlyGlobalProperty("stdout", System.out);
            globalObject.defineReadOnlyGlobalProperty("stderr", System.err);
            globalObject.defineGlobalProperty("global", globalObject);
            globalObject.defineGlobalProperty("runtime", runtime);
            globalObject.defineGlobalProperty("load", new AbstractNativeFunction(globalObject) {
                @Override
                public Object call(ExecutionContext context, Object self, Object... args) {
                    try {
                        // Use the root context, provided to the ctor, always
                        return loadScript(getExecutionContext(), (String) args[0]);
                    } catch (FileNotFoundException e) {
                        throw new ThrowException(context, e);
                    }
                }
            });
            return globalObject;
        }
    }

    protected class DynJSVerticle extends Verticle {

        private final String scriptName;

        public DynJSVerticle(String scriptName) {
            this.scriptName = scriptName;
        }

        @Override
        public void start() throws Exception {
            loadScript(rootContext, this.scriptName);
        }

        @Override
        public void stop() throws Exception {
            try {
                Runner runner = rootContext.getGlobalObject().getRuntime().newRunner();
                runner.withContext(rootContext).withSource("(vertxStop ? vertxStop() : null)").execute();
            } catch (Exception e) {
            }
        }
    }

}
