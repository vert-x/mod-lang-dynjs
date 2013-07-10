package org.dynjs.vertx;

import org.dynjs.runtime.DynJS;
import org.dynjs.runtime.ExecutionContext;
import org.dynjs.runtime.InitializationListener;
import org.dynjs.runtime.Runner;
import org.vertx.java.platform.Verticle;

import java.io.*;

public class DynJSVerticle extends Verticle {
    protected final DynJS runtime;
    protected final String scriptName;
    protected ExecutionContext rootContext;

    public DynJSVerticle(DynJSVerticleFactory factory, String scriptName) {
        this.runtime = factory.getRuntime();
        this.scriptName = scriptName;
    }

    protected ExecutionContext initializeRootContext() {
        return ExecutionContext.createGlobalExecutionContext(runtime, new InitializationListener() {
            @Override
            public void initialize(ExecutionContext context) {
                rootContext = context;
            }
        });
    }

    @Override
    public void start() {
        rootContext = initializeRootContext();
        runtime.clearModuleCache();

        File scriptFile = new File(scriptName);
        ClassLoader old = Thread.currentThread().getContextClassLoader();
        Thread.currentThread().setContextClassLoader(runtime.getConfig().getClassLoader());
        Runner runner = runtime.newRunner();
        try {
            if (scriptFile.exists()) {
                runner.withSource(scriptFile).execute();
            } else {
                InputStream is = runtime.getConfig().getClassLoader().getResourceAsStream(scriptName);
                if (is == null) {
                    throw new FileNotFoundException("Cannot find script: " + scriptName);
                }
                BufferedReader reader = new BufferedReader(new InputStreamReader(is));
                runner.withSource(reader).execute();
                try {
                    is.close();
                } catch (IOException e) {
                    // ignore
                }
            }
        } catch (Exception e) {
            System.err.println("Error loading script: " + scriptName + ". " + e.getLocalizedMessage());
            throw new RuntimeException(e);
        } finally {
            Thread.currentThread().setContextClassLoader(old);
        }
    }

    @Override
    public void stop() {
        try {
            Runner runner = rootContext.getGlobalObject().getRuntime().newRunner();
            runner.withContext(rootContext).withSource("(vertxStop ? vertxStop() : null)").execute();
        } catch (Exception e) {
        }
    }
}
