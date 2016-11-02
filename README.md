# Vert.x 2.x is **deprecated** - use instead https://github.com/vert-x3/vertx-lang-js

[![Build Status](https://secure.travis-ci.org/vert-x/mod-lang-dynjs.png) ](http://travis-ci.org/vert-x/mod-lang-dynjs)

Cloudbees [Build Status](https://vertx.ci.cloudbees.com/view/Javascript/job/vert.x-mod-lang-dynjs/)

## Javascript on Vert.x with DynJS

Use [DynJS](http://github.com/dynjs/dynjs) as your Javascript runtime instead of Rhino on vert.x 2.0.
This language module uses the vert.x Javascript API in [mod-lang-js](https://github.com/vert-x/mod-lang-js)
with the DynJS runtime. The API documentation is the same as for `lang-js` and `lang-rhino`, and can be found 
on the `lang-js` CI server.

[API Documentation](https://vertx.ci.cloudbees.com/view/Javascript/job/vert.x-mod-lang-js/lastSuccessfulBuild/artifact/target/docs/index.html)

### Usage

By default, vert.x runs Javascript with Rhino. Change this by creating a
`langs.properties` file at the root of your project that looks like this.

    dynjs=io.vertx~lang-dynjs~1.0.1:org.dynjs.vertx.DynJSVerticleFactory
    .js=dynjs

Enjoy. And if you have any problems, hit us on on freenode at #dynjs or #vertx.
