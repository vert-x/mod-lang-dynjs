[![Build Status](https://secure.travis-ci.org/vert-x/mod-lang-dynjs.png) ](http://travis-ci.org/vert-x/mod-lang-dynjs)

[![Build Status](https://buildhive.cloudbees.com/job/vert-x/job/mod-lang-dynjs/badge/icon) ](https://buildhive.cloudbees.com/job/vert-x/job/mod-lang-dynjs/)

# Javascript on Vert.x with DynJS

Use [DynJS](http://github.com/dynjs/dynjs) instead of Rhino on vert.x 2.0.

## API Documentation

The Javascript 
[API docs](https://projectodd.ci.cloudbees.com/view/DynJS/job/mod-lang-dynjs/lastSuccessfulBuild/artifact/target/docs/index.html)
are on the CI server.

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

Enjoy. And if you have any problems, hit us on on freenode at #dynjs or #vertx.
And you can file any reproducible issues in our
[Jira](http://jira.codehaus.org/browse/DYNJS).
