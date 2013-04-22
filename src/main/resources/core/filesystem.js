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

if (!vertx.fileSystem) {
  vertx.fileSystem = {};

  (function() {
    var j_fs = vertx.__vertx.fileSystem();

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

    vertx.fileSystem.copy = function(from, to, arg2, arg3) {
      var handler;
      var recursive;
      if (arguments.length === 4) {
        handler = arg3;
        recursive = arg2;
      } else {
        handler = arg2;
        recursive = false;
      }
      j_fs.copy(from, to, recursive, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.copySync = function(from, to, recursive) {
      if (!recursive) recursive = false;
      j_fs.copySync(from, to, recursive);
      return vertx.fileSystem;
    }

    vertx.fileSystem.move = function(from, to, handler) {
      j_fs.move(from, to, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.moveSync = function(from, to) {
      j_fs.moveSync(from, to);
      return vertx.fileSystem;
    }

    vertx.fileSystem.truncate = function(path, len, handler) {
      j_fs.truncate(path, len, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.truncateSync = function(path, len) {
      j_fs.truncateSync(path, len);
      return vertx.fileSystem;
    }

    vertx.fileSystem.chmod = function(path, perms, arg2, arg3) {
      var handler;
      var dirPerms;
      if (arguments.length === 4) {
        handler = arg3;
        dirPerms = arg2;
      } else {
        handler = arg2;
        dirPerms = null;
      }
      j_fs.chmod(path, perms, dirPerms, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.chmodSync = function(path, perms, dirPerms) {
      if (!dirPerms) dirPerms = null;
      j_fs.chmodSync(path, perms, dirPerms);
      return vertx.fileSystem;
    }

    vertx.fileSystem.props = function(path, handler) {
      j_fs.props(path, wrapPropsHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.propsSync = function(path) {
      var j_props = j_fs.propsSync(path);
      return convertProps(j_props);
    }

    vertx.fileSystem.lprops = function(path, handler) {
      j_fs.lprops(path, wrapPropsHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.lpropsSync = function(path) {
      var j_props = j_fs.lpropsSync(path);
      return convertProps(j_props);
    }

    vertx.fileSystem.link = function(link, existing, handler) {
      j_fs.link(link, existing, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.linkSync = function(link, existing) {
      j_fs.linkSync(link, existing);
      return vertx.fileSystem;
    }

    vertx.fileSystem.symlink = function(link, existing, handler) {
      j_fs.symlink(link, existing, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.symlinkSync = function(link, existing) {
      j_fs.symlinkSync(link, existing);
      return vertx.fileSystem;
    }

    vertx.fileSystem.unlink = function(link, handler) {
      j_fs.unlink(link, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.unlinkSync = function(link) {
      j_fs.unlinkSync(link);
      return vertx.fileSystem;
    }

    vertx.fileSystem.readSymlink = function(link, handler) {
      j_fs.readSymlink(link, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.readSymlinkSync = function(link, handler) {
      return j_fs.readSymlinkSync(link);
    }

    vertx.fileSystem.delete = function(path, arg1, arg2) {
      var handler;
      var recursive;
      if (arguments.length === 3) {
        handler = arg2;
        recursive = arg1;
      } else {
        handler = arg1;
        recursive = false;
      }
      j_fs.delete(path, recursive, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.deleteSync = function(path, recursive) {
      if (!recursive) recursive = false;
      j_fs.deleteSync(path, recursive);
      return vertx.fileSystem;
    }

    vertx.fileSystem.mkdir = function(path, arg1, arg2, arg3) {
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
          createParents = arg2;
          perms = null;
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
      j_fs.mkdir(path, perms, createParents, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.mkdirSync = function(path, arg1, arg2) {
      var createParents;
      var perms;
      switch (arguments.length) {
        case 2:
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
      j_fs.mkdirSync(path, perms, createParents);
      return vertx.fileSystem;
    }

    vertx.fileSystem.readDir = function(path, arg1, arg2) {
      var filter;
      var handler;
      if (arguments.length === 3) {
        handler = arg2;
        filter = arg1;
      } else {
        handler = arg1;
        filter = null;
      }
      j_fs.readDir(path, filter, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.readDirSync = function(path, filter) {
      if (!filter) filter = false;
      return j_fs.readDirSync(path, filter);
    }

    vertx.fileSystem.readFile = function(path, handler) {
      j_fs.readFile(path, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.readFileSync = function(path) {
      return j_fs.readFileSync(path);
      return vertx.fileSystem;
    }

    vertx.fileSystem.writeFile = function(path, data, handler) {
      if (typeof data === 'string') {
        data = new org.vertx.java.core.buffer.Buffer(data);
      }
      j_fs.writeFile(path, data, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.writeFileSync = function(path, data) {
      if (typeof data === 'string') {
        data = new org.vertx.java.core.buffer.Buffer(data);
      }
      j_fs.writeFileSync(path, data);
      return vertx.fileSystem;
    }

    vertx.fileSystem.OPEN_READ = 1;
    vertx.fileSystem.OPEN_WRITE = 2;
    vertx.fileSystem.CREATE_NEW = 4;

    vertx.fileSystem.openSync = function(path, arg1, arg2, arg3) {

      // TODO combine this code with the similar code in open
      var openFlags;
      var flush;
      var perms;
      var handler;
      switch (arguments.length) {
        case 1:
          openFlags = vertx.fileSystem.OPEN_READ | vertx.fileSystem.OPEN_WRITE
                    | vertx.fileSystem.CREATE_NEW;
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

      var read = (openFlags & vertx.fileSystem.OPEN_READ) == vertx.fileSystem.OPEN_READ;
      var write = (openFlags & vertx.fileSystem.OPEN_WRITE) == vertx.fileSystem.OPEN_WRITE;
      var createNew = (openFlags & vertx.fileSystem.CREATE_NEW) == vertx.fileSystem.CREATE_NEW;

      var asyncFile = j_fs.openSync(path, perms, read, write, createNew, flush);

      return wrapAsyncFile(asyncFile);
    }

    vertx.fileSystem.open = function(path, arg1, arg2, arg3, arg4) {

      var openFlags;
      var flush;
      var perms;
      var handler;
      switch (arguments.length) {
        case 2:
          openFlags = vertx.fileSystem.OPEN_READ | vertx.fileSystem.OPEN_WRITE
                    | vertx.fileSystem.CREATE_NEW;
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

      var read = (openFlags & vertx.fileSystem.OPEN_READ) == vertx.fileSystem.OPEN_READ;
      var write = (openFlags & vertx.fileSystem.OPEN_WRITE) == vertx.fileSystem.OPEN_WRITE;
      var createNew = (openFlags & vertx.fileSystem.CREATE_NEW) == vertx.fileSystem.CREATE_NEW;

      j_fs.open(path, perms, read, write, createNew, flush, function(asyncResult) {
        if (asyncResult.succeeded()) {
          var j_af = asyncResult.result();
          var wrapped = wrapAsyncFile(j_af);
          handler(null, wrapped);
        } else {
          handler(asyncResult.cause(), null);
        }
      });
      return vertx.fileSystem;
    }

    load('core/read_stream.js');
    load('core/write_stream.js');

    function wrapAsyncFile(j_af) {
      var asf = {
        close: function(handler) {
          if (handler) {
            j_af.close(wrapHandler(handler))
          } else {
            j_af.close();
          }
        },

        write: function(buffer, position, handler) {
          j_af.write(buffer, position, wrapHandler(handler));
          return asf;
        },

        read: function(buffer, offset, position, length, handler) {
          j_af.read(buffer, offset, position, length, wrapHandler(handler));
          return asf;
        },

        flush: function(handler) {
          if (handler) {
            j_af.flush(wrapHandler(handler));
          } else {
            j_af.flush();
          }
        }
      };

      writeStream(asf, j_af);
      readStream(asf, j_af);
      return asf;
    }

    vertx.fileSystem.createFile = function(path, handler) {
      j_fs.createFile(path, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.createFileSync = function(path) {
      j_fs.createFileSync(path);
      return vertx.fileSystem;
    }

    vertx.fileSystem.exists = function(path, handler) {
      j_fs.exists(path, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.existsSync = function(path) {
      return j_fs.existsSync(path);
    }

    vertx.fileSystem.fsProps = function(path, handler) {
      j_fs.fsProps(path, wrapHandler(handler));
      return vertx.fileSystem;
    }

    vertx.fileSystem.fsPropsSync = function(path) {
      return j_fs.fsPropsSync(path);
    }

  })();
}
