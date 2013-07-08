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
import org.dynjs.runtime.LexicalEnvironment;
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

    public static Container container;
    public static Vertx vertx;

    private DynJS runtime;
    private Config config;
    private ClassLoader mcl;
    private GlobalObjectFactory globalObjectFactory = new DynJSGlobalObjectFactory();
    
    @Override
    public void init(Vertx vertx, Container container, ClassLoader classloader) {
        this.mcl = classloader;
        DynJSVerticleFactory.container = container;
        DynJSVerticleFactory.vertx = vertx;
        
        this.config = new Config(getClassLoader());
        this.config.setGlobalObjectFactory(getGlobalObjectFactory());
        this.runtime = new DynJS(this.config);
    }

    @Override
    public Verticle createVerticle(String main) throws Exception {
        return new DynJSVerticle(this, main);
    }

    @Override
    public void reportException(Logger logger, Throwable t) {
        logger.error("Exception in DynJS JavaScript verticle", t);
    }

    @Override
    public void close() {
    }
    
    public DynJS getRuntime() {
        return this.runtime;
    }
    
    public Config getConfig() {
        return this.config;
    }
    
    protected GlobalObjectFactory getGlobalObjectFactory() {
        return globalObjectFactory;
    }

    protected ClassLoader getClassLoader() {
        return this.mcl;
    }

    protected Object loadScript(ExecutionContext context, String scriptName)
            throws FileNotFoundException {
        if (scriptName == null) {
            return null;
        }
        File scriptFile = new File(scriptName);
        ClassLoader old = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(runtime.getConfig().getClassLoader());
        Object ret = null;
        Runner runner = context.getGlobalObject().getRuntime().newRunner();
        try {
            LexicalEnvironment localEnv = context.getVariableEnvironment();
            localEnv.getRecord().createMutableBinding( context, "__vertxload", true );
            localEnv.getRecord().setMutableBinding(context, "__vertxload", "true", false );
            if (scriptFile.exists()) {
                context.getGlobalObject().addLoadPath(scriptFile.getParent());
                ret = runner.withContext(context).withSource(scriptFile).execute();
            } else {
                InputStream is = runtime.getConfig().getClassLoader().getResourceAsStream(scriptName);
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
        } catch (Exception e) {
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
            globalObject.defineReadOnlyGlobalProperty("stdout", System.out);
            globalObject.defineReadOnlyGlobalProperty("stderr", System.err);
            globalObject.defineGlobalProperty("global", globalObject);
            globalObject.defineGlobalProperty("runtime", runtime);
            globalObject.defineGlobalProperty("load", new AbstractNativeFunction(globalObject) {
                @Override
                public Object call(ExecutionContext context, Object self, Object... args) {
                    try {
                        return loadScript(context, (String) args[0]);
                    } catch (FileNotFoundException e) {
                        throw new ThrowException(context, e);
                    }
                }
            });
            globalObject.defineGlobalProperty("__jvertx", vertx);
            globalObject.defineGlobalProperty("__jcontainer", container);
            return globalObject;
        }
    }

}
