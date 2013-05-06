[![Build Status](https://secure.travis-ci.org/dynjs/dynjs-vertx-module.png)](http://travis-ci.org/dynjs/dynjs-vertx-module)

[![Build Status](https://buildhive.cloudbees.com/job/dynjs/job/dynjs-vertx-module/badge/icon)](https://buildhive.cloudbees.com/job/dynjs/job/dynjs-vertx-module/)

# Javascript on Vert.x with DynJS

Use [DynJS](http://github.com/dynjs/dynjs) instead of Rhino on vert.x 2.0.

## Usage

We intend for DynJS to be the default Javascript runtime in vert.x 2.0, but
that is not currently the case, and since vert.x 2.0 is not currently released,
you'll need to build it.

    $ git clone https://github.com/vert-x/vert.x.git
    $ cd vert.x
    $ ./gradlew collectDeps
    $ ./gradelew distTar

This will put the complete vert.x installation in
`build/vert.x-2.0.0-SNAPSHOT`. Just update your `$PATH` to include
`/path/to/repo/vert.x/build/vert.x-2.0.0-SNAPSHOT/bin`. 

By default, vert.x runs Javascript with Rhino. Change this by creating a
`langs.properties` file at the root of your project that looks like this.

    dynjs=org.dynjs~lang-dynjs~1.0.0-SNAPSHOT:org.dynjs.vertx.DynJSVerticleFactory
    .js=dynjs

## Why Use DynJS instead of Rhino

I'd love to tell you that it's faster, but I don't know this for sure yet. We
have yet to run any performance benchmarks. For now, though, consider some of
the cool things you can do with Java interop in DynJS that just aren't
possible. For example, you can bind a Java instance method to a Javascript
object.

    var internalCache = new java.util.HashMap();
    internalCache.put('foo', 'bar');

    var publicCache = {};
    publicCache.lookup = internalCache.get.bind(internalCache);

    publicCache.lookup('foo'); // returns 'bar'

This little bit of code creates a Java `HashMap` instance, and binds
`HashMap#get` to a plain old javascript object. How cool is that? Imagine the
possibilities. We use this trick in a few places throught the vert.x API
implementation. 
    

Enjoy. And if you have any problems, hit us on on freenode at #dynjs or #vertx. And you can file any reproducible issues in our [Jira](http://jira.codehaus.org/browse/DYNJS).
