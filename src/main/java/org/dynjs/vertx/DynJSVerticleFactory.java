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

import org.dynjs.Config;
import org.dynjs.runtime.*;
import org.vertx.java.core.Vertx;
import org.vertx.java.core.logging.Logger;
import org.vertx.java.platform.Container;
import org.vertx.java.platform.Verticle;
import org.vertx.java.platform.VerticleFactory;

/**
 * @author Lance Ball lball@redhat.com
 */
public class DynJSVerticleFactory implements VerticleFactory {

    private Container container;
    private ClassLoader classloader;
    private Vertx vertx;

    @Override
    public void init(Vertx vertx, Container container, ClassLoader classloader) {
        // Force DynJS to run in interpreted mode only - for now
        // System.setProperty("dynjs.compile.mode", "off");
        this.container   = container;
        this.classloader = classloader;
        this.vertx       = vertx;
    }

    @Override
    public Verticle createVerticle(String main) throws Exception {
        Config config = new Config(getClassLoader());
        config.setGlobalObjectFactory(new DynJSGlobalObjectFactory());
        return new DynJSVerticle(new DynJS(config), main);
    }

    @Override
    public void reportException(Logger logger, Throwable t) {
        logger.error("Exception in DynJS JavaScript verticle", t);
    }

    @Override
    public void close() {
    }
    
    protected ClassLoader getClassLoader() {
        return this.classloader;
    }

    public class DynJSGlobalObjectFactory implements GlobalObjectFactory {

        @Override
        public GlobalObject newGlobalObject(final DynJS runtime) {
            final GlobalObject globalObject = new GlobalObject(runtime);
            globalObject.defineGlobalProperty("__dirname", System.getProperty("user.dir"));
            globalObject.defineReadOnlyGlobalProperty("stdout", System.out);
            globalObject.defineReadOnlyGlobalProperty("stderr", System.err);
            globalObject.defineGlobalProperty("global", globalObject);
            globalObject.defineGlobalProperty("runtime", runtime);
            globalObject.defineGlobalProperty("__jvertx", vertx);
            globalObject.defineGlobalProperty("__jcontainer", container);
            return globalObject;
        }
    }

}
