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

if (typeof module === 'undefined') {
  throw "Use require() to load Vert.x API modules"
}

var jfs = __jvertx.fileSystem();

var fileSystem = {};

load("read_stream.js");
load("write_stream.js");

function wrapHandler(handler) {
  return function(asyncResult) {
    if (asyncResult.succeeded()) {
      handler(null, asyncResult.result());
    } else {
      handler(asyncResult.cause(), null);
    }
  }
}

function wrapPropsHandler(handler) {
  return function(asyncResult) {
    if (asyncResult.succeeded()) {
      var jsProps = convertProps(asyncResult.result());
      handler(null, jsProps);
    } else {
      handler(asyncResult.cause(), null);
    }
  }
}

function convertProps(j_props) {
  return {
    creationTime: j_props.creationTime().getTime(),
    lastAccessTime: j_props.lastAccessTime().getTime(),
    lastModifiedTime: j_props.lastModifiedTime().getTime(),
    isDirectory: j_props.isDirectory(),
    isOther: j_props.isOther(),
    isRegularFile: j_props.isRegularFile(),
    isSymbolicLink: j_props.isSymbolicLink(),
    size: j_props.size()
  }
}

fileSystem.copy = function(from, to, arg2, arg3) {
  var handler;
  var recursive;
  if (arguments.length === 4) {
    handler = arg3;
    recursive = arg2;
  } else {
    handler = arg2;
    recursive = false;
  }
  jfs.copy(from, to, recursive, wrapHandler(handler));
  return fileSystem;
}

fileSystem.copySync = function(from, to, recursive) {
  if (!recursive) recursive = false;
  jfs.copySync(from, to, recursive);
  return fileSystem;
}

fileSystem.move = function(from, to, handler) {
  jfs.move(from, to, wrapHandler(handler));
  return fileSystem;
}

fileSystem.moveSync = function(from, to) {
  jfs.moveSync(from, to);
  return fileSystem;
}

fileSystem.truncate = function(path, len, handler) {
  jfs.truncate(path, len, wrapHandler(handler));
  return fileSystem;
}

fileSystem.truncateSync = function(path, len) {
  jfs.truncateSync(path, len);
  return fileSystem;
}

fileSystem.chmod = function(path, perms, arg2, arg3) {
  var handler;
  var dirPerms;
  if (arguments.length === 4) {
    handler = arg3;
    dirPerms = arg2;
  } else {
    handler = arg2;
    dirPerms = null;
  }
  jfs.chmod(path, perms, dirPerms, wrapHandler(handler));
  return fileSystem;
}

fileSystem.chmodSync = function(path, perms, dirPerms) {
  if (!dirPerms) dirPerms = null;
  jfs.chmodSync(path, perms, dirPerms);
  return fileSystem;
}

fileSystem.props = function(path, handler) {
  jfs.props(path, wrapPropsHandler(handler));
  return fileSystem;
}

fileSystem.propsSync = function(path) {
  var j_props = jfs.propsSync(path);
  return convertProps(j_props);
}

fileSystem.lprops = function(path, handler) {
  jfs.lprops(path, wrapPropsHandler(handler));
  return fileSystem;
}

fileSystem.lpropsSync = function(path) {
  var j_props = jfs.lpropsSync(path);
  return convertProps(j_props);
}

fileSystem.link = function(link, existing, handler) {
  jfs.link(link, existing, wrapHandler(handler));
  return fileSystem;
}

fileSystem.linkSync = function(link, existing) {
  jfs.linkSync(link, existing);
  return fileSystem;
}

fileSystem.symlink = function(link, existing, handler) {
  jfs.symlink(link, existing, wrapHandler(handler));
  return fileSystem;
}

fileSystem.symlinkSync = function(link, existing) {
  jfs.symlinkSync(link, existing);
  return fileSystem;
}

fileSystem.unlink = function(link, handler) {
  jfs.unlink(link, wrapHandler(handler));
  return fileSystem;
}

fileSystem.unlinkSync = function(link) {
  jfs.unlinkSync(link);
  return fileSystem;
}

fileSystem.readSymlink = function(link, handler) {
  jfs.readSymlink(link, wrapHandler(handler));
  return fileSystem;
}

fileSystem.readSymlinkSync = function(link, handler) {
  return jfs.readSymlinkSync(link);
}

fileSystem.delete = function(path, arg1, arg2) {
  var handler;
  var recursive;
  if (arguments.length === 3) {
    handler = arg2;
    recursive = arg1;
  } else {
    handler = arg1;
    recursive = false;
  }
  jfs.delete(path, recursive, wrapHandler(handler));
  return fileSystem;
}

fileSystem.deleteSync = function(path, recursive) {
  if (!recursive) recursive = false;
  jfs.deleteSync(path, recursive);
  return fileSystem;
}

fileSystem.mkDir = function(path, arg1, arg2, arg3) {
  var createParents;
  var perms;
  var handler;
  switch (arguments.length) {
    case 2:
      createParents = false;
      perms = null;
      handler = arg1;
      break;
    case 3:
      if (typeof(arg1) === 'boolean') {
        createParents = arg1;
        perms=null;
      } else {
        createParents = false;
        perms = arg1;
      }
      handler = arg2;
      break;
    case 4:
      createParents = arg1;
      perms = arg2;
      handler = arg3;
      break;
    default:
      throw 'Invalid number of arguments';
  }
  jfs.mkdir(path, perms, createParents, wrapHandler(handler));
  return fileSystem;
}

fileSystem.mkDirSync = function(path, arg1, arg2) {
  var createParents;
  var perms;
  switch (arguments.length) {
    case 1:
      createParents = false;
      perms = null;
      break;
    case 2:
      createParents = arg1;
      perms = null;
      break;
    case 3:
      createParents = arg1;
      perms = arg2;
      break;
    default:
      throw 'Invalid number of arguments';
  }
  jfs.mkdirSync(path, perms, createParents);
  return fileSystem;
}

fileSystem.readDir = function(path, arg1, arg2) {
  var filter;
  var handler;
  if (arguments.length === 3) {
    handler = arg2;
    filter = arg1;
  } else {
    handler = arg1;
    filter = null;
  }
  jfs.readDir(path, filter, wrapHandler(handler));
  return fileSystem;
}

fileSystem.readDirSync = function(path, filter) {
  if (!filter) filter = false;
  return jfs.readDirSync(path, filter);
}

fileSystem.readFile = function(path, handler) {
  jfs.readFile(path, wrapHandler(handler));
  return fileSystem;
}

fileSystem.readFileSync = function(path) {
  return jfs.readFileSync(path);
}

fileSystem.writeFile = function(path, data, handler) {
  if (typeof data === 'string') {
    data = new org.vertx.java.core.buffer.Buffer(data);
  }
  jfs.writeFile(path, data, wrapHandler(handler));
  return fileSystem;
}

fileSystem.writeFileSync = function(path, data) {
  if (typeof data === 'string') {
    data = new org.vertx.java.core.buffer.Buffer(data);
  }
  jfs.writeFileSync(path, data);
  return fileSystem;
}

fileSystem.OPEN_READ = 1;
fileSystem.OPEN_WRITE = 2;
fileSystem.CREATE_NEW = 4;

fileSystem.openSync = function(path, arg1, arg2, arg3) {

  // TODO combine this code with the similar code in open
  var openFlags;
  var flush;
  var perms;
  var handler;
  switch (arguments.length) {
    case 1:
      openFlags = fileSystem.OPEN_READ | fileSystem.OPEN_WRITE
                | fileSystem.CREATE_NEW;
      flush = false;
      perms = null;
      break;
    case 2:
      openFlags = arg1;
      flush = false;
      perms = null;
      break;
    case 3:
      openFlags = arg1;
      flush = arg2;
      perms = null;
      break;
    case 4:
      openFlags = arg1;
      flush = arg2;
      perms = arg3;
      break;
    default:
      throw 'Invalid number of arguments';
  }

  var read = (openFlags & fileSystem.OPEN_READ) == fileSystem.OPEN_READ;
  var write = (openFlags & fileSystem.OPEN_WRITE) == fileSystem.OPEN_WRITE;
  var createNew = (openFlags & fileSystem.CREATE_NEW) == fileSystem.CREATE_NEW;

  var asyncFile = jfs.openSync(path, perms, read, write, createNew, flush);

  return wrapAsyncFile(asyncFile);
}

fileSystem.open = function(path, arg1, arg2, arg3, arg4) {

  var openFlags;
  var flush;
  var perms;
  var handler;
  switch (arguments.length) {
    case 2:
      openFlags = fileSystem.OPEN_READ | fileSystem.OPEN_WRITE
                | fileSystem.CREATE_NEW;
      flush = false;
      perms = null;
      handler = arg1;
      break;
    case 3:
      openFlags = arg1;
      flush = false;
      perms = null;
        handler = arg2;
      break;
    case 4:
      openFlags = arg1;
      flush = arg2;
      perms = null;
      handler = arg3;
      break;
    case 5:
      openFlags = arg1;
      flush = arg2;
      perms = arg3;
      handler = arg4;
      break;
    default:
      throw 'Invalid number of arguments';
  }

  var read = (openFlags & fileSystem.OPEN_READ) == fileSystem.OPEN_READ;
  var write = (openFlags & fileSystem.OPEN_WRITE) == fileSystem.OPEN_WRITE;
  var createNew = (openFlags & fileSystem.CREATE_NEW) == fileSystem.CREATE_NEW;

  jfs.open(path, perms, read, write, createNew, flush, function(asyncResult) {
    if (asyncResult.succeeded()) {
      var jaf = asyncResult.result();
      var wrapped = wrapAsyncFile(jaf);
      handler(null, wrapped);
    } else {
      handler(asyncResult.cause(), null);
    }
  });
  return fileSystem;
}

function wrapAsyncFile(jaf) {
  var asf = {
    close: function(handler) {
      if (handler) {
        jaf.close(wrapHandler(handler))
      } else {
        jaf.close();
      }
    },

    write: function(buffer, position, handler) {
      jaf.write(buffer, position, wrapHandler(handler));
      return asf;
    },

    read: function(buffer, offset, position, length, handler) {
      jaf.read(buffer, offset, position, length, wrapHandler(handler));
      return asf;
    },

    flush: function(handler) {
      if (handler) {
        jaf.flush(wrapHandler(handler));
      } else {
        jaf.flush();
      }
    }
  };
  writeStream(asf, jaf);
  readStream(asf, jaf);
  return asf;
}

fileSystem.createFile = function(path, handler) {
  jfs.createFile(path, wrapHandler(handler));
  return fileSystem;
}

fileSystem.createFileSync = function(path) {
  jfs.createFileSync(path);
  return fileSystem;
}

fileSystem.exists = function(path, handler) {
  jfs.exists(path, wrapHandler(handler));
  return fileSystem;
}

fileSystem.existsSync = function(path) {
  return jfs.existsSync(path);
}

fileSystem.fsProps = function(path, handler) {
  jfs.fsProps(path, wrapHandler(handler));
  return fileSystem;
}

fileSystem.fsPropsSync = function(path) {
  return jfs.fsPropsSync(path);
}

module.exports = fileSystem;
