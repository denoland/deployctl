"use strict";
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// dist/script/deno/stable/variables/errors.js
var require_errors = __commonJS({
  "dist/script/deno/stable/variables/errors.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WriteZero = exports2.UnexpectedEof = exports2.TimedOut = exports2.PermissionDenied = exports2.NotFound = exports2.NotConnected = exports2.InvalidData = exports2.Interrupted = exports2.Http = exports2.ConnectionReset = exports2.ConnectionRefused = exports2.ConnectionAborted = exports2.Busy = exports2.BrokenPipe = exports2.BadResource = exports2.AlreadyExists = exports2.AddrNotAvailable = exports2.AddrInUse = void 0;
    var AddrInUse = class extends Error {
    };
    exports2.AddrInUse = AddrInUse;
    var AddrNotAvailable = class extends Error {
    };
    exports2.AddrNotAvailable = AddrNotAvailable;
    var AlreadyExists = class extends Error {
    };
    exports2.AlreadyExists = AlreadyExists;
    var BadResource = class extends Error {
    };
    exports2.BadResource = BadResource;
    var BrokenPipe = class extends Error {
    };
    exports2.BrokenPipe = BrokenPipe;
    var Busy = class extends Error {
    };
    exports2.Busy = Busy;
    var ConnectionAborted = class extends Error {
    };
    exports2.ConnectionAborted = ConnectionAborted;
    var ConnectionRefused = class extends Error {
    };
    exports2.ConnectionRefused = ConnectionRefused;
    var ConnectionReset = class extends Error {
    };
    exports2.ConnectionReset = ConnectionReset;
    var Http = class extends Error {
    };
    exports2.Http = Http;
    var Interrupted = class extends Error {
    };
    exports2.Interrupted = Interrupted;
    var InvalidData = class extends Error {
    };
    exports2.InvalidData = InvalidData;
    var NotConnected = class extends Error {
    };
    exports2.NotConnected = NotConnected;
    var NotFound = class extends Error {
      code = "ENOENT";
    };
    exports2.NotFound = NotFound;
    var PermissionDenied = class extends Error {
    };
    exports2.PermissionDenied = PermissionDenied;
    var TimedOut = class extends Error {
    };
    exports2.TimedOut = TimedOut;
    var UnexpectedEof = class extends Error {
    };
    exports2.UnexpectedEof = UnexpectedEof;
    var WriteZero = class extends Error {
    };
    exports2.WriteZero = WriteZero;
  }
});

// dist/script/deno/internal/errorMap.js
var require_errorMap = __commonJS({
  "dist/script/deno/internal/errorMap.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    var errors = __importStar2(require_errors());
    var mapper = (Ctor) => (err) => Object.assign(new Ctor(err.message), {
      stack: err.stack
    });
    var map = {
      EEXIST: mapper(errors.AlreadyExists),
      ENOENT: mapper(errors.NotFound),
      EBADF: mapper(errors.BadResource)
    };
    var isNodeErr = (e) => {
      return e instanceof Error && "code" in e;
    };
    function mapError(e) {
      if (!isNodeErr(e))
        return e;
      return map[e.code]?.(e) || e;
    }
    exports2.default = mapError;
  }
});

// dist/script/deno/stable/functions/stat.js
var require_stat = __commonJS({
  "dist/script/deno/stable/functions/stat.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.stat = exports2.denoifyFileInfo = void 0;
    var promises_1 = require("fs/promises");
    var os = __importStar2(require("os"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var isWindows = os.platform() === "win32";
    function denoifyFileInfo(s) {
      return {
        atime: s.atime,
        birthtime: s.birthtime,
        blksize: isWindows ? null : s.blksize,
        blocks: isWindows ? null : s.blocks,
        dev: s.dev,
        gid: isWindows ? null : s.gid,
        ino: isWindows ? null : s.ino,
        isDirectory: s.isDirectory(),
        isFile: s.isFile(),
        isSymlink: s.isSymbolicLink(),
        isBlockDevice: isWindows ? null : s.isBlockDevice(),
        isCharDevice: isWindows ? null : s.isCharacterDevice(),
        isFifo: isWindows ? null : s.isFIFO(),
        isSocket: isWindows ? null : s.isSocket(),
        mode: isWindows ? null : s.mode,
        mtime: s.mtime,
        nlink: isWindows ? null : s.nlink,
        rdev: isWindows ? null : s.rdev,
        size: s.size,
        uid: isWindows ? null : s.uid
      };
    }
    exports2.denoifyFileInfo = denoifyFileInfo;
    var stat = async (path) => {
      try {
        return denoifyFileInfo(await (0, promises_1.stat)(path));
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.stat = stat;
  }
});

// dist/script/deno/stable/functions/fstat.js
var require_fstat = __commonJS({
  "dist/script/deno/stable/functions/fstat.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fstat = void 0;
    var fs = __importStar2(require("fs"));
    var util_1 = require("util");
    var stat_js_1 = require_stat();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var nodeFstat = (0, util_1.promisify)(fs.fstat);
    var fstat = async function(fd) {
      try {
        return (0, stat_js_1.denoifyFileInfo)(await nodeFstat(fd));
      } catch (err) {
        throw (0, errorMap_js_1.default)(err);
      }
    };
    exports2.fstat = fstat;
  }
});

// dist/script/deno/stable/functions/fstatSync.js
var require_fstatSync = __commonJS({
  "dist/script/deno/stable/functions/fstatSync.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fstatSync = void 0;
    var fs_1 = require("fs");
    var stat_js_1 = require_stat();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var fstatSync = function fstatSync2(fd) {
      try {
        return (0, stat_js_1.denoifyFileInfo)((0, fs_1.fstatSync)(fd));
      } catch (err) {
        throw (0, errorMap_js_1.default)(err);
      }
    };
    exports2.fstatSync = fstatSync;
  }
});

// dist/script/deno/stable/functions/ftruncate.js
var require_ftruncate = __commonJS({
  "dist/script/deno/stable/functions/ftruncate.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ftruncate = void 0;
    var fs_1 = require("fs");
    var util_1 = require("util");
    var _ftruncate = (0, util_1.promisify)(fs_1.ftruncate);
    exports2.ftruncate = _ftruncate;
  }
});

// dist/script/deno/stable/functions/ftruncateSync.js
var require_ftruncateSync = __commonJS({
  "dist/script/deno/stable/functions/ftruncateSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ftruncateSync = void 0;
    var fs_1 = require("fs");
    exports2.ftruncateSync = fs_1.ftruncateSync;
  }
});

// dist/script/deno/stable/functions/fdatasync.js
var require_fdatasync = __commonJS({
  "dist/script/deno/stable/functions/fdatasync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fdatasync = void 0;
    var fs_1 = require("fs");
    var util_1 = require("util");
    var _fdatasync = (0, util_1.promisify)(fs_1.fdatasync);
    exports2.fdatasync = _fdatasync;
  }
});

// dist/script/deno/stable/functions/fdatasyncSync.js
var require_fdatasyncSync = __commonJS({
  "dist/script/deno/stable/functions/fdatasyncSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fdatasyncSync = void 0;
    var fs_1 = require("fs");
    exports2.fdatasyncSync = fs_1.fdatasyncSync;
  }
});

// dist/script/deno/stable/functions/read.js
var require_read = __commonJS({
  "dist/script/deno/stable/functions/read.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = void 0;
    var util_1 = require("util");
    var fs_1 = require("fs");
    var _read = (0, util_1.promisify)(fs_1.read);
    var read = async function read2(rid, buffer) {
      if (buffer == null) {
        throw new TypeError("Buffer must not be null.");
      }
      if (buffer.length === 0) {
        return 0;
      }
      const { bytesRead } = await _read(rid, buffer, 0, buffer.length, null);
      return bytesRead === 0 ? null : bytesRead;
    };
    exports2.read = read;
  }
});

// dist/script/deno/stable/functions/readSync.js
var require_readSync = __commonJS({
  "dist/script/deno/stable/functions/readSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readSync = void 0;
    var fs = __importStar2(require("fs"));
    var readSync = (fd, buffer) => {
      const bytesRead = fs.readSync(fd, buffer);
      return bytesRead === 0 ? null : bytesRead;
    };
    exports2.readSync = readSync;
  }
});

// dist/script/deno/stable/functions/write.js
var require_write = __commonJS({
  "dist/script/deno/stable/functions/write.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.write = void 0;
    var fs = __importStar2(require("fs"));
    var util_1 = require("util");
    var nodeWrite = (0, util_1.promisify)(fs.write);
    var write = async (fd, data) => {
      const { bytesWritten } = await nodeWrite(fd, data);
      return bytesWritten;
    };
    exports2.write = write;
  }
});

// dist/script/deno/stable/functions/writeSync.js
var require_writeSync = __commonJS({
  "dist/script/deno/stable/functions/writeSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.writeSync = void 0;
    var fs = __importStar2(require("fs"));
    exports2.writeSync = fs.writeSync;
  }
});

// dist/script/deno/stable/classes/FsFile.js
var require_FsFile = __commonJS({
  "dist/script/deno/stable/classes/FsFile.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.File = exports2.FsFile = void 0;
    var fs = __importStar2(require("fs"));
    var stream = __importStar2(require("stream"));
    var fstat_js_1 = require_fstat();
    var fstatSync_js_1 = require_fstatSync();
    var ftruncate_js_1 = require_ftruncate();
    var ftruncateSync_js_1 = require_ftruncateSync();
    var fdatasync_js_1 = require_fdatasync();
    var fdatasyncSync_js_1 = require_fdatasyncSync();
    var read_js_1 = require_read();
    var readSync_js_1 = require_readSync();
    var write_js_1 = require_write();
    var writeSync_js_1 = require_writeSync();
    Symbol.dispose ??= Symbol("Symbol.dispose");
    Symbol.asyncDispose ??= Symbol("Symbol.asyncDispose");
    var FsFile = class {
      rid;
      #closed = false;
      constructor(rid) {
        this.rid = rid;
      }
      [Symbol.dispose]() {
        if (!this.#closed) {
          this.close();
        }
      }
      async write(p) {
        return await (0, write_js_1.write)(this.rid, p);
      }
      writeSync(p) {
        return (0, writeSync_js_1.writeSync)(this.rid, p);
      }
      async truncate(len) {
        await (0, ftruncate_js_1.ftruncate)(this.rid, len);
      }
      truncateSync(len) {
        return (0, ftruncateSync_js_1.ftruncateSync)(this.rid, len);
      }
      read(p) {
        return (0, read_js_1.read)(this.rid, p);
      }
      readSync(p) {
        return (0, readSync_js_1.readSync)(this.rid, p);
      }
      seek(_offset, _whence) {
        throw new Error("Method not implemented.");
      }
      seekSync(_offset, _whence) {
        throw new Error("Method not implemented.");
      }
      async stat() {
        return await (0, fstat_js_1.fstat)(this.rid);
      }
      statSync() {
        return (0, fstatSync_js_1.fstatSync)(this.rid);
      }
      sync() {
        throw new Error("Method not implemented.");
      }
      syncSync() {
        throw new Error("Method not implemented.");
      }
      syncData() {
        return (0, fdatasync_js_1.fdatasync)(this.rid);
      }
      syncDataSync() {
        return (0, fdatasyncSync_js_1.fdatasyncSync)(this.rid);
      }
      utime(_atime, _mtime) {
        throw new Error("Method not implemented.");
      }
      utimeSync(_atime, _mtime) {
        throw new Error("Method not implemented.");
      }
      close() {
        this.#closed = true;
        fs.closeSync(this.rid);
      }
      #readableStream;
      get readable() {
        if (this.#readableStream == null) {
          const nodeStream = fs.createReadStream(null, {
            fd: this.rid,
            autoClose: false
          });
          this.#readableStream = stream.Readable.toWeb(nodeStream);
        }
        return this.#readableStream;
      }
      #writableStream;
      get writable() {
        if (this.#writableStream == null) {
          const nodeStream = fs.createWriteStream(null, {
            fd: this.rid,
            autoClose: false
          });
          this.#writableStream = stream.Writable.toWeb(nodeStream);
        }
        return this.#writableStream;
      }
    };
    exports2.FsFile = FsFile;
    var File = FsFile;
    exports2.File = File;
  }
});

// dist/script/deno/stable/classes/PermissionStatus.js
var require_PermissionStatus = __commonJS({
  "dist/script/deno/stable/classes/PermissionStatus.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PermissionStatus = void 0;
    var PermissionStatus = class extends EventTarget {
      state;
      onchange = null;
      partial = false;
      /** @internal */
      constructor(state) {
        super();
        this.state = state;
      }
    };
    exports2.PermissionStatus = PermissionStatus;
  }
});

// dist/script/deno/stable/classes/Permissions.js
var require_Permissions = __commonJS({
  "dist/script/deno/stable/classes/Permissions.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Permissions = void 0;
    var PermissionStatus_js_1 = require_PermissionStatus();
    var Permissions = class {
      query(desc) {
        return Promise.resolve(this.querySync(desc));
      }
      querySync(_desc) {
        return new PermissionStatus_js_1.PermissionStatus("granted");
      }
      revoke(desc) {
        return Promise.resolve(this.revokeSync(desc));
      }
      revokeSync(_desc) {
        return new PermissionStatus_js_1.PermissionStatus("denied");
      }
      request(desc) {
        return this.query(desc);
      }
      requestSync(desc) {
        return this.querySync(desc);
      }
    };
    exports2.Permissions = Permissions;
  }
});

// dist/script/deno/stable/classes.js
var require_classes = __commonJS({
  "dist/script/deno/stable/classes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.PermissionStatus = exports2.Permissions = exports2.FsFile = exports2.File = void 0;
    var FsFile_js_1 = require_FsFile();
    Object.defineProperty(exports2, "File", { enumerable: true, get: function() {
      return FsFile_js_1.File;
    } });
    Object.defineProperty(exports2, "FsFile", { enumerable: true, get: function() {
      return FsFile_js_1.FsFile;
    } });
    var Permissions_js_1 = require_Permissions();
    Object.defineProperty(exports2, "Permissions", { enumerable: true, get: function() {
      return Permissions_js_1.Permissions;
    } });
    var PermissionStatus_js_1 = require_PermissionStatus();
    Object.defineProperty(exports2, "PermissionStatus", { enumerable: true, get: function() {
      return PermissionStatus_js_1.PermissionStatus;
    } });
  }
});

// dist/script/deno/stable/enums/SeekMode.js
var require_SeekMode = __commonJS({
  "dist/script/deno/stable/enums/SeekMode.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SeekMode = void 0;
    var SeekMode;
    (function(SeekMode2) {
      SeekMode2[SeekMode2["Start"] = 0] = "Start";
      SeekMode2[SeekMode2["Current"] = 1] = "Current";
      SeekMode2[SeekMode2["End"] = 2] = "End";
    })(SeekMode || (exports2.SeekMode = SeekMode = {}));
  }
});

// dist/script/deno/stable/enums.js
var require_enums = __commonJS({
  "dist/script/deno/stable/enums.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SeekMode = void 0;
    var SeekMode_js_1 = require_SeekMode();
    Object.defineProperty(exports2, "SeekMode", { enumerable: true, get: function() {
      return SeekMode_js_1.SeekMode;
    } });
  }
});

// dist/script/deno/stable/variables/build.js
var require_build = __commonJS({
  "dist/script/deno/stable/variables/build.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.build = void 0;
    var os = __importStar2(require("os"));
    var arch = process.arch === "arm64" ? "aarch64" : "x86_64";
    exports2.build = {
      arch,
      os: /* @__PURE__ */ ((p) => p === "win32" ? "windows" : p === "darwin" ? "darwin" : "linux")(os.platform()),
      vendor: "pc",
      target: ((p) => p === "win32" ? `${arch}-pc-windows-msvc` : p === "darwin" ? `${arch}-apple-darwin` : `${arch}-unknown-linux-gnu`)(os.platform())
    };
  }
});

// dist/script/deno/stable/variables/customInspect.js
var require_customInspect = __commonJS({
  "dist/script/deno/stable/variables/customInspect.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.customInspect = void 0;
    exports2.customInspect = Symbol.for("nodejs.util.inspect.custom");
  }
});

// dist/script/deno/stable/variables/env.js
var require_env = __commonJS({
  "dist/script/deno/stable/variables/env.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.env = void 0;
    exports2.env = {
      get(key) {
        assertValidKey(key);
        return process.env[key];
      },
      set(key, value) {
        assertValidKey(key);
        assertValidValue(value);
        process.env[key] = value;
      },
      has(key) {
        assertValidKey(key);
        return key in process.env;
      },
      delete(key) {
        assertValidKey(key);
        delete process.env[key];
      },
      // @ts-expect-error https://github.com/denoland/deno/issues/10267
      toObject() {
        return { ...process.env };
      }
    };
    var invalidKeyChars = ["=", "\0"].map((c) => c.charCodeAt(0));
    var invalidValueChar = "\0".charCodeAt(0);
    function assertValidKey(key) {
      if (key.length === 0) {
        throw new TypeError("Key is an empty string.");
      }
      for (let i = 0; i < key.length; i++) {
        if (invalidKeyChars.includes(key.charCodeAt(i))) {
          const char = key.charCodeAt(i) === "\0".charCodeAt(0) ? "\\0" : key[i];
          throw new TypeError(`Key contains invalid characters: "${char}"`);
        }
      }
    }
    function assertValidValue(value) {
      for (let i = 0; i < value.length; i++) {
        if (value.charCodeAt(i) === invalidValueChar) {
          throw new TypeError('Value contains invalid characters: "\\0"');
        }
      }
    }
  }
});

// dist/script/deno/stable/variables/mainModule.js
var require_mainModule = __commonJS({
  "dist/script/deno/stable/variables/mainModule.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.mainModule = void 0;
    var path_1 = require("path");
    var url_1 = require("url");
    exports2.mainModule = (0, url_1.pathToFileURL)(process.argv[1] ?? (0, path_1.join)(process.cwd(), "$deno$repl.ts")).href;
  }
});

// dist/script/deno/stable/variables/metrics.js
var require_metrics = __commonJS({
  "dist/script/deno/stable/variables/metrics.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.metrics = void 0;
    var metrics = function metrics2() {
      return {
        opsDispatched: 0,
        opsDispatchedSync: 0,
        opsDispatchedAsync: 0,
        opsDispatchedAsyncUnref: 0,
        opsCompleted: 0,
        opsCompletedSync: 0,
        opsCompletedAsync: 0,
        opsCompletedAsyncUnref: 0,
        bytesSentControl: 0,
        bytesSentData: 0,
        bytesReceived: 0,
        ops: {}
      };
    };
    exports2.metrics = metrics;
  }
});

// dist/script/deno/stable/variables/noColor.js
var require_noColor = __commonJS({
  "dist/script/deno/stable/variables/noColor.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.noColor = void 0;
    exports2.noColor = process.env.NO_COLOR !== void 0;
  }
});

// dist/script/deno/stable/variables/permissions.js
var require_permissions = __commonJS({
  "dist/script/deno/stable/variables/permissions.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.permissions = void 0;
    var Permissions_js_1 = require_Permissions();
    exports2.permissions = new Permissions_js_1.Permissions();
  }
});

// dist/script/deno/stable/variables/pid.js
var require_pid = __commonJS({
  "dist/script/deno/stable/variables/pid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.pid = void 0;
    exports2.pid = process.pid;
  }
});

// dist/script/deno/stable/variables/ppid.js
var require_ppid = __commonJS({
  "dist/script/deno/stable/variables/ppid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ppid = void 0;
    exports2.ppid = process.ppid;
  }
});

// dist/script/deno/stable/variables/resources.js
var require_resources = __commonJS({
  "dist/script/deno/stable/variables/resources.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resources = void 0;
    var resources = function resources2() {
      console.warn([
        "Deno.resources() shim returns a dummy object that does not update.",
        "If you think this is a mistake, raise an issue at https://github.com/denoland/node_deno_shims/issues"
      ].join("\n"));
      return {};
    };
    exports2.resources = resources;
  }
});

// dist/script/deno/stable/variables/std.js
var require_std = __commonJS({
  "dist/script/deno/stable/variables/std.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.stderr = exports2.stdout = exports2.stdin = void 0;
    var stream_1 = __importDefault(require("stream"));
    var tty_1 = __importDefault(require("tty"));
    var readSync_js_1 = require_readSync();
    var writeSync_js_1 = require_writeSync();
    function chain(fn, cleanup) {
      let prev;
      return function _fn(...args) {
        const curr = (prev || Promise.resolve()).then(() => fn(...args)).finally(cleanup || (() => {
        })).then((result) => {
          if (prev === curr)
            prev = void 0;
          return result;
        });
        return prev = curr;
      };
    }
    var stdinReadable;
    exports2.stdin = {
      rid: 0,
      isTerminal() {
        return tty_1.default.isatty(this.rid);
      },
      read: chain((p) => {
        return new Promise((resolve, reject) => {
          process.stdin.resume();
          process.stdin.on("error", onerror);
          process.stdin.once("readable", () => {
            process.stdin.off("error", onerror);
            const data = process.stdin.read(p.length) ?? process.stdin.read();
            if (data) {
              p.set(data);
              resolve(data.length > 0 ? data.length : null);
            } else {
              resolve(null);
            }
          });
          function onerror(error) {
            reject(error);
            process.stdin.off("error", onerror);
          }
        });
      }, () => process.stdin.pause()),
      get readable() {
        if (stdinReadable == null) {
          stdinReadable = stream_1.default.Readable.toWeb(process.stdin);
        }
        return stdinReadable;
      },
      readSync(buffer) {
        return (0, readSync_js_1.readSync)(this.rid, buffer);
      },
      close() {
        process.stdin.destroy();
      },
      setRaw(mode, options) {
        if (options?.cbreak) {
          throw new Error("The cbreak option is not implemented.");
        }
        process.stdin.setRawMode(mode);
      }
    };
    var stdoutWritable;
    exports2.stdout = {
      rid: 1,
      isTerminal() {
        return tty_1.default.isatty(this.rid);
      },
      write: chain((p) => {
        return new Promise((resolve) => {
          const result = process.stdout.write(p);
          if (!result) {
            process.stdout.once("drain", () => resolve(p.length));
          } else {
            resolve(p.length);
          }
        });
      }),
      get writable() {
        if (stdoutWritable == null) {
          stdoutWritable = stream_1.default.Writable.toWeb(process.stdout);
        }
        return stdoutWritable;
      },
      writeSync(data) {
        return (0, writeSync_js_1.writeSync)(this.rid, data);
      },
      close() {
        process.stdout.destroy();
      }
    };
    var stderrWritable;
    exports2.stderr = {
      rid: 2,
      isTerminal() {
        return tty_1.default.isatty(this.rid);
      },
      write: chain((p) => {
        return new Promise((resolve) => {
          const result = process.stderr.write(p);
          if (!result) {
            process.stderr.once("drain", () => resolve(p.length));
          } else {
            resolve(p.length);
          }
        });
      }),
      get writable() {
        if (stderrWritable == null) {
          stderrWritable = stream_1.default.Writable.toWeb(process.stderr);
        }
        return stderrWritable;
      },
      writeSync(data) {
        return (0, writeSync_js_1.writeSync)(this.rid, data);
      },
      close() {
        process.stderr.destroy();
      }
    };
  }
});

// dist/script/deno/internal/version.js
var require_version = __commonJS({
  "dist/script/deno/internal/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.typescript = exports2.deno = void 0;
    exports2.deno = "1.40.2";
    exports2.typescript = "5.3.3";
  }
});

// dist/script/deno/stable/variables/version.js
var require_version2 = __commonJS({
  "dist/script/deno/stable/variables/version.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version = void 0;
    var version_js_1 = require_version();
    exports2.version = {
      deno: version_js_1.deno,
      typescript: version_js_1.typescript,
      v8: process.versions.v8
    };
  }
});

// dist/script/deno/stable/variables.js
var require_variables = __commonJS({
  "dist/script/deno/stable/variables.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.version = exports2.resources = exports2.ppid = exports2.pid = exports2.permissions = exports2.noColor = exports2.metrics = exports2.mainModule = exports2.errors = exports2.env = exports2.customInspect = exports2.build = void 0;
    var build_js_1 = require_build();
    Object.defineProperty(exports2, "build", { enumerable: true, get: function() {
      return build_js_1.build;
    } });
    var customInspect_js_1 = require_customInspect();
    Object.defineProperty(exports2, "customInspect", { enumerable: true, get: function() {
      return customInspect_js_1.customInspect;
    } });
    var env_js_1 = require_env();
    Object.defineProperty(exports2, "env", { enumerable: true, get: function() {
      return env_js_1.env;
    } });
    exports2.errors = __importStar2(require_errors());
    var mainModule_js_1 = require_mainModule();
    Object.defineProperty(exports2, "mainModule", { enumerable: true, get: function() {
      return mainModule_js_1.mainModule;
    } });
    var metrics_js_1 = require_metrics();
    Object.defineProperty(exports2, "metrics", { enumerable: true, get: function() {
      return metrics_js_1.metrics;
    } });
    var noColor_js_1 = require_noColor();
    Object.defineProperty(exports2, "noColor", { enumerable: true, get: function() {
      return noColor_js_1.noColor;
    } });
    var permissions_js_1 = require_permissions();
    Object.defineProperty(exports2, "permissions", { enumerable: true, get: function() {
      return permissions_js_1.permissions;
    } });
    var pid_js_1 = require_pid();
    Object.defineProperty(exports2, "pid", { enumerable: true, get: function() {
      return pid_js_1.pid;
    } });
    var ppid_js_1 = require_ppid();
    Object.defineProperty(exports2, "ppid", { enumerable: true, get: function() {
      return ppid_js_1.ppid;
    } });
    var resources_js_1 = require_resources();
    Object.defineProperty(exports2, "resources", { enumerable: true, get: function() {
      return resources_js_1.resources;
    } });
    __exportStar(require_std(), exports2);
    var version_js_1 = require_version2();
    Object.defineProperty(exports2, "version", { enumerable: true, get: function() {
      return version_js_1.version;
    } });
  }
});

// dist/script/deno/stable/functions/addSignalListener.js
var require_addSignalListener = __commonJS({
  "dist/script/deno/stable/functions/addSignalListener.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.addSignalListener = void 0;
    var process_1 = __importDefault(require("process"));
    function denoSignalToNodeJs(signal) {
      if (signal === "SIGEMT") {
        throw new Error("SIGEMT is not supported");
      }
      return signal;
    }
    var addSignalListener = (signal, handler) => {
      process_1.default.addListener(denoSignalToNodeJs(signal), handler);
    };
    exports2.addSignalListener = addSignalListener;
  }
});

// dist/script/deno/stable/functions/chdir.js
var require_chdir = __commonJS({
  "dist/script/deno/stable/functions/chdir.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.chdir = void 0;
    var url_1 = require("url");
    var errorMap_js_1 = __importDefault(require_errorMap());
    var variables_js_1 = require_variables();
    var chdir = function(path) {
      try {
        return process.chdir(path instanceof URL ? (0, url_1.fileURLToPath)(path) : path);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new variables_js_1.errors.NotFound(`No such file or directory (os error 2), chdir '${path}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.chdir = chdir;
  }
});

// dist/script/deno/stable/functions/chmod.js
var require_chmod = __commonJS({
  "dist/script/deno/stable/functions/chmod.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.chmod = void 0;
    var fs = __importStar2(require("fs/promises"));
    exports2.chmod = fs.chmod;
  }
});

// dist/script/deno/stable/functions/chmodSync.js
var require_chmodSync = __commonJS({
  "dist/script/deno/stable/functions/chmodSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.chmodSync = void 0;
    var fs = __importStar2(require("fs"));
    exports2.chmodSync = fs.chmodSync;
  }
});

// dist/script/deno/stable/functions/chown.js
var require_chown = __commonJS({
  "dist/script/deno/stable/functions/chown.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.chown = void 0;
    var fs = __importStar2(require("fs/promises"));
    var chown = async (path, uid, gid) => await fs.chown(path, uid ?? -1, gid ?? -1);
    exports2.chown = chown;
  }
});

// dist/script/deno/stable/functions/chownSync.js
var require_chownSync = __commonJS({
  "dist/script/deno/stable/functions/chownSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.chownSync = void 0;
    var fs = __importStar2(require("fs"));
    var chownSync = (path, uid, gid) => fs.chownSync(path, uid ?? -1, gid ?? -1);
    exports2.chownSync = chownSync;
  }
});

// dist/script/deno/stable/functions/close.js
var require_close = __commonJS({
  "dist/script/deno/stable/functions/close.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.close = void 0;
    var fs = __importStar2(require("fs"));
    exports2.close = fs.closeSync;
  }
});

// dist/script/deno/internal/Conn.js
var require_Conn = __commonJS({
  "dist/script/deno/internal/Conn.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TlsConn = exports2.Conn = void 0;
    var net_1 = require("net");
    var events_1 = require("events");
    var FsFile_js_1 = require_FsFile();
    var Conn = class extends FsFile_js_1.FsFile {
      rid;
      localAddr;
      remoteAddr;
      #socket;
      constructor(rid, localAddr, remoteAddr, socket) {
        super(rid);
        this.rid = rid;
        this.localAddr = localAddr;
        this.remoteAddr = remoteAddr;
        this.#socket = socket || new net_1.Socket({ fd: rid });
      }
      [Symbol.dispose]() {
        this.close();
      }
      async closeWrite() {
        await new Promise((resolve) => this.#socket.end(resolve));
      }
      setNoDelay(enable) {
        this.#socket.setNoDelay(enable);
      }
      setKeepAlive(enable) {
        this.#socket.setKeepAlive(enable);
      }
      ref() {
        this.#socket.ref();
      }
      unref() {
        this.#socket.unref();
      }
      async read(p) {
        try {
          return await super.read(p);
        } catch (error) {
          if (!(error instanceof Error && "code" in error && error.code == "EAGAIN")) {
            throw error;
          }
        }
        await (0, events_1.once)(this.#socket, "readable");
        return await super.read(p);
      }
    };
    exports2.Conn = Conn;
    var TlsConn = class extends Conn {
      handshake() {
        console.warn("@deno/shim-deno: Handshake is not supported.");
        return Promise.resolve({
          alpnProtocol: null
        });
      }
    };
    exports2.TlsConn = TlsConn;
  }
});

// dist/script/deno/stable/functions/connect.js
var require_connect = __commonJS({
  "dist/script/deno/stable/functions/connect.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.connect = void 0;
    var net_1 = require("net");
    var Conn_js_1 = require_Conn();
    var connect = function connect2(options) {
      if (options.transport === "unix") {
        throw new Error("Unstable UnixConnectOptions is not implemented");
      }
      const { transport = "tcp", hostname = "127.0.0.1", port } = options;
      if (transport !== "tcp") {
        throw new Error("Deno.connect is only implemented for transport: tcp");
      }
      const socket = (0, net_1.createConnection)({ port, host: hostname });
      socket.on("error", (err) => console.error(err));
      return new Promise((resolve) => {
        socket.once("connect", () => {
          const rid = socket._handle.fd;
          const localAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.localAddress,
            port: socket.localPort,
            transport: "tcp"
          };
          const remoteAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.remoteAddress,
            port: socket.remotePort,
            transport: "tcp"
          };
          resolve(new Conn_js_1.Conn(rid, localAddr, remoteAddr, socket));
        });
      });
    };
    exports2.connect = connect;
  }
});

// dist/script/deno/stable/functions/readTextFile.js
var require_readTextFile = __commonJS({
  "dist/script/deno/stable/functions/readTextFile.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readTextFile = void 0;
    var promises_1 = require("fs/promises");
    var errorMap_js_1 = __importDefault(require_errorMap());
    var readTextFile = async (path, { signal } = {}) => {
      try {
        return await (0, promises_1.readFile)(path, { encoding: "utf8", signal });
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.readTextFile = readTextFile;
  }
});

// dist/script/deno/stable/functions/connectTls.js
var require_connectTls = __commonJS({
  "dist/script/deno/stable/functions/connectTls.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.connectTls = void 0;
    var tls_1 = require("tls");
    var Conn_js_1 = require_Conn();
    var readTextFile_js_1 = require_readTextFile();
    var connectTls = async function connectTls2({ port, hostname = "127.0.0.1", certFile }) {
      const cert = certFile && await (0, readTextFile_js_1.readTextFile)(certFile);
      const socket = (0, tls_1.connect)({ port, host: hostname, cert });
      return new Promise((resolve) => {
        socket.on("connect", () => {
          const rid = socket._handle.fd;
          const localAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.localAddress,
            port: socket.localPort,
            transport: "tcp"
          };
          const remoteAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.remoteAddress,
            port: socket.remotePort,
            transport: "tcp"
          };
          resolve(new Conn_js_1.TlsConn(rid, localAddr, remoteAddr, socket));
        });
      });
    };
    exports2.connectTls = connectTls;
  }
});

// dist/script/deno/stable/functions/consoleSize.js
var require_consoleSize = __commonJS({
  "dist/script/deno/stable/functions/consoleSize.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.consoleSize = void 0;
    var consoleSize = function consoleSize2() {
      const pipes = [process.stderr, process.stdout];
      for (const pipe of pipes) {
        if (pipe.columns != null) {
          const { columns, rows } = pipe;
          return { columns, rows };
        }
      }
      throw new Error("The handle is invalid.");
    };
    exports2.consoleSize = consoleSize;
  }
});

// dist/script/deno/internal/consts.js
var require_consts = __commonJS({
  "dist/script/deno/internal/consts.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DEFAULT_BUFFER_SIZE = void 0;
    exports2.DEFAULT_BUFFER_SIZE = 32 * 1024;
  }
});

// dist/script/deno/stable/functions/copy.js
var require_copy = __commonJS({
  "dist/script/deno/stable/functions/copy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.copy = void 0;
    var consts_js_1 = require_consts();
    var copy = async function copy2(src, dst, options) {
      let n = 0;
      const bufSize = options?.bufSize ?? consts_js_1.DEFAULT_BUFFER_SIZE;
      const b = new Uint8Array(bufSize);
      let gotEOF = false;
      while (gotEOF === false) {
        const result = await src.read(b);
        if (result === null) {
          gotEOF = true;
        } else {
          let nwritten = 0;
          while (nwritten < result) {
            nwritten += await dst.write(b.subarray(nwritten, result));
          }
          n += nwritten;
        }
      }
      return n;
    };
    exports2.copy = copy;
  }
});

// dist/script/deno/stable/functions/copyFile.js
var require_copyFile = __commonJS({
  "dist/script/deno/stable/functions/copyFile.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.copyFile = void 0;
    var fs = __importStar2(require("fs/promises"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var errors = __importStar2(require_errors());
    var copyFile = async (src, dest) => {
      try {
        await fs.copyFile(src, dest);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new errors.NotFound(`File not found, copy '${src}' -> '${dest}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.copyFile = copyFile;
  }
});

// dist/script/deno/stable/functions/copyFileSync.js
var require_copyFileSync = __commonJS({
  "dist/script/deno/stable/functions/copyFileSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.copyFileSync = void 0;
    var fs = __importStar2(require("fs"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var errors = __importStar2(require_errors());
    var copyFileSync = (src, dest) => {
      try {
        fs.copyFileSync(src, dest);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new errors.NotFound(`File not found, copy '${src}' -> '${dest}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.copyFileSync = copyFileSync;
  }
});

// dist/script/deno/internal/fs_flags.js
var require_fs_flags = __commonJS({
  "dist/script/deno/internal/fs_flags.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.getFsFlag = exports2.getCreationFlag = exports2.getAccessFlag = void 0;
    var errors = __importStar2(require_errors());
    var fs_1 = require("fs");
    var os_1 = __importDefault(require("os"));
    var { O_APPEND, O_CREAT, O_EXCL, O_RDONLY, O_RDWR, O_TRUNC, O_WRONLY } = fs_1.constants;
    function getAccessFlag(opts) {
      if (opts.read && !opts.write && !opts.append)
        return O_RDONLY;
      if (!opts.read && opts.write && !opts.append)
        return O_WRONLY;
      if (opts.read && opts.write && !opts.append)
        return O_RDWR;
      if (!opts.read && opts.append)
        return O_WRONLY | O_APPEND;
      if (opts.read && opts.append)
        return O_RDWR | O_APPEND;
      if (!opts.read && !opts.write && !opts.append) {
        throw new errors.BadResource("EINVAL: One of 'read', 'write', 'append' is required to open file.");
      }
      throw new errors.BadResource("EINVAL: Invalid fs flags.");
    }
    exports2.getAccessFlag = getAccessFlag;
    function getCreationFlag(opts) {
      if (!opts.write && !opts.append) {
        if (opts.truncate || opts.create || opts.createNew) {
          throw new errors.BadResource("EINVAL: One of 'write', 'append' is required to 'truncate', 'create' or 'createNew' file.");
        }
      }
      if (opts.append) {
        if (opts.truncate && !opts.createNew) {
          throw new errors.BadResource("EINVAL: unexpected 'truncate': true and 'createNew': false when 'append' is true.");
        }
      }
      if (!opts.create && !opts.truncate && !opts.createNew)
        return 0;
      if (opts.create && !opts.truncate && !opts.createNew)
        return O_CREAT;
      if (!opts.create && opts.truncate && !opts.createNew) {
        if (os_1.default.platform() === "win32") {
          return O_CREAT | O_TRUNC;
        } else {
          return O_TRUNC;
        }
      }
      if (opts.create && opts.truncate && !opts.createNew) {
        return O_CREAT | O_TRUNC;
      }
      if (opts.createNew)
        return O_CREAT | O_EXCL;
      throw new errors.BadResource("EINVAL: Invalid fs flags.");
    }
    exports2.getCreationFlag = getCreationFlag;
    function getFsFlag(flags) {
      return getAccessFlag(flags) | getCreationFlag(flags);
    }
    exports2.getFsFlag = getFsFlag;
  }
});

// dist/script/deno/stable/functions/open.js
var require_open = __commonJS({
  "dist/script/deno/stable/functions/open.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.open = void 0;
    var fs_1 = require("fs");
    var util_1 = require("util");
    var FsFile_js_1 = require_FsFile();
    var fs_flags_js_1 = require_fs_flags();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var nodeOpen = (0, util_1.promisify)(fs_1.open);
    var open = async function open2(path, { read, write, append, truncate, create, createNew, mode = 438 } = {
      read: true
    }) {
      const flagMode = (0, fs_flags_js_1.getFsFlag)({
        read,
        write,
        append,
        truncate,
        create,
        createNew
      });
      try {
        const fd = await nodeOpen(path, flagMode, mode);
        return new FsFile_js_1.File(fd);
      } catch (err) {
        throw (0, errorMap_js_1.default)(err);
      }
    };
    exports2.open = open;
  }
});

// dist/script/deno/stable/functions/create.js
var require_create = __commonJS({
  "dist/script/deno/stable/functions/create.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.create = void 0;
    var open_js_1 = require_open();
    var create = async function create2(path) {
      return await (0, open_js_1.open)(path, { write: true, create: true, truncate: true });
    };
    exports2.create = create;
  }
});

// dist/script/deno/stable/functions/openSync.js
var require_openSync = __commonJS({
  "dist/script/deno/stable/functions/openSync.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.openSync = void 0;
    var fs_1 = require("fs");
    var FsFile_js_1 = require_FsFile();
    var fs_flags_js_1 = require_fs_flags();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var openSync = function openSync2(path, { read, write, append, truncate, create, createNew, mode = 438 } = {
      read: true
    }) {
      const flagMode = (0, fs_flags_js_1.getFsFlag)({
        read,
        write,
        append,
        truncate,
        create,
        createNew
      });
      try {
        const fd = (0, fs_1.openSync)(path, flagMode, mode);
        return new FsFile_js_1.File(fd);
      } catch (err) {
        throw (0, errorMap_js_1.default)(err);
      }
    };
    exports2.openSync = openSync;
  }
});

// dist/script/deno/stable/functions/createSync.js
var require_createSync = __commonJS({
  "dist/script/deno/stable/functions/createSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createSync = void 0;
    var openSync_js_1 = require_openSync();
    var createSync = function createSync2(path) {
      return (0, openSync_js_1.openSync)(path, {
        create: true,
        truncate: true,
        read: true,
        write: true
      });
    };
    exports2.createSync = createSync;
  }
});

// dist/script/deno/stable/functions/cwd.js
var require_cwd = __commonJS({
  "dist/script/deno/stable/functions/cwd.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.cwd = void 0;
    exports2.cwd = process.cwd;
  }
});

// dist/script/deno/stable/functions/execPath.js
var require_execPath = __commonJS({
  "dist/script/deno/stable/functions/execPath.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.execPath = void 0;
    var which_1 = __importDefault(require("which"));
    var execPath = () => which_1.default.sync("deno");
    exports2.execPath = execPath;
  }
});

// dist/script/deno/stable/functions/exit.js
var require_exit = __commonJS({
  "dist/script/deno/stable/functions/exit.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.exit = void 0;
    var exit = function exit2(code) {
      return process.exit(code);
    };
    exports2.exit = exit;
  }
});

// dist/script/deno/stable/functions/fsync.js
var require_fsync = __commonJS({
  "dist/script/deno/stable/functions/fsync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fsync = void 0;
    var fs_1 = require("fs");
    var util_1 = require("util");
    var fsync = function fsync2(rid) {
      return (0, util_1.promisify)(fs_1.fsync)(rid);
    };
    exports2.fsync = fsync;
  }
});

// dist/script/deno/stable/functions/fsyncSync.js
var require_fsyncSync = __commonJS({
  "dist/script/deno/stable/functions/fsyncSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.fsyncSync = void 0;
    var fs_1 = require("fs");
    var fsyncSync = function fsyncSync2(rid) {
      return (0, fs_1.fsyncSync)(rid);
    };
    exports2.fsyncSync = fsyncSync;
  }
});

// dist/script/deno/stable/functions/gid.js
var require_gid = __commonJS({
  "dist/script/deno/stable/functions/gid.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.gid = void 0;
    var process_1 = __importDefault(require("process"));
    exports2.gid = process_1.default.getgid ?? (() => null);
  }
});

// dist/script/deno/stable/functions/hostname.js
var require_hostname = __commonJS({
  "dist/script/deno/stable/functions/hostname.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.hostname = void 0;
    var os = __importStar2(require("os"));
    var hostname = function hostname2() {
      return os.hostname();
    };
    exports2.hostname = hostname;
  }
});

// dist/script/deno/stable/functions/inspect.js
var require_inspect = __commonJS({
  "dist/script/deno/stable/functions/inspect.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.inspect = void 0;
    var util = __importStar2(require("util"));
    var inspect = (value, options = {}) => util.inspect(value, options);
    exports2.inspect = inspect;
  }
});

// dist/script/deno/stable/functions/kill.js
var require_kill = __commonJS({
  "dist/script/deno/stable/functions/kill.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.kill = void 0;
    var os_1 = __importDefault(require("os"));
    var process_1 = __importDefault(require("process"));
    var kill = function(pid, signo) {
      if (pid < 0 && os_1.default.platform() === "win32") {
        throw new TypeError("Invalid pid");
      }
      process_1.default.kill(pid, signo);
    };
    exports2.kill = kill;
  }
});

// dist/script/deno/stable/functions/link.js
var require_link = __commonJS({
  "dist/script/deno/stable/functions/link.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.link = void 0;
    var fs = __importStar2(require("fs/promises"));
    exports2.link = fs.link;
  }
});

// dist/script/deno/stable/functions/linkSync.js
var require_linkSync = __commonJS({
  "dist/script/deno/stable/functions/linkSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.linkSync = void 0;
    var fs = __importStar2(require("fs"));
    exports2.linkSync = fs.linkSync;
  }
});

// dist/script/deno/internal/Listener.js
var require_Listener = __commonJS({
  "dist/script/deno/internal/Listener.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Listener = void 0;
    var close_js_1 = require_close();
    var errors = __importStar2(require_errors());
    var Listener = class {
      rid;
      addr;
      #listener;
      constructor(rid, addr, listener) {
        this.rid = rid;
        this.addr = addr;
        this.#listener = listener;
      }
      [Symbol.dispose]() {
        this.close();
      }
      async accept() {
        if (!this.#listener) {
          throw new errors.BadResource("Listener not initialised");
        }
        const result = await this.#listener.next();
        if (result.done) {
          throw new errors.BadResource("Server not listening");
        }
        return result.value;
      }
      async next() {
        let conn;
        try {
          conn = await this.accept();
        } catch (error) {
          if (error instanceof errors.BadResource) {
            return { value: void 0, done: true };
          }
          throw error;
        }
        return { value: conn, done: false };
      }
      return(value) {
        this.close();
        return Promise.resolve({ value, done: true });
      }
      close() {
        (0, close_js_1.close)(this.rid);
      }
      ref() {
        throw new Error("Not implemented");
      }
      unref() {
        throw new Error("Not implemented");
      }
      [Symbol.asyncIterator]() {
        return this;
      }
    };
    exports2.Listener = Listener;
  }
});

// dist/script/deno/stable/functions/listen.js
var require_listen = __commonJS({
  "dist/script/deno/stable/functions/listen.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.listen = void 0;
    var net_1 = require("net");
    var Conn_js_1 = require_Conn();
    var Listener_js_1 = require_Listener();
    async function* _listen(server, waitFor) {
      await waitFor;
      while (server.listening) {
        yield new Promise((resolve) => server.once("connection", (socket) => {
          socket.on("error", (err) => console.error(err));
          const rid = socket._handle.fd;
          const localAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.localAddress,
            port: socket.localPort,
            transport: "tcp"
          };
          const remoteAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.remoteAddress,
            port: socket.remotePort,
            transport: "tcp"
          };
          resolve(new Conn_js_1.Conn(rid, localAddr, remoteAddr));
        }));
      }
    }
    var listen = function listen2(options) {
      if (options.transport === "unix") {
        throw new Error("Unstable UnixListenOptions is not implemented");
      }
      const { port, hostname = "0.0.0.0", transport = "tcp" } = options;
      if (transport !== "tcp") {
        throw new Error("Deno.listen is only implemented for transport: tcp");
      }
      const server = (0, net_1.createServer)();
      const waitFor = new Promise((resolve) => (
        // server._handle.fd is assigned immediately on .listen()
        server.listen(port, hostname, resolve)
      ));
      const listener = new Listener_js_1.Listener(server._handle.fd, {
        hostname,
        port,
        transport: "tcp"
      }, _listen(server, waitFor));
      return listener;
    };
    exports2.listen = listen;
  }
});

// dist/script/deno/stable/functions/readTextFileSync.js
var require_readTextFileSync = __commonJS({
  "dist/script/deno/stable/functions/readTextFileSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readTextFileSync = void 0;
    var fs = __importStar2(require("fs"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var readTextFileSync = function(path) {
      try {
        return fs.readFileSync(path, "utf8");
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.readTextFileSync = readTextFileSync;
  }
});

// dist/script/deno/stable/functions/listenTls.js
var require_listenTls = __commonJS({
  "dist/script/deno/stable/functions/listenTls.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.listenTls = void 0;
    var tls_1 = require("tls");
    var Conn_js_1 = require_Conn();
    var Listener_js_1 = require_Listener();
    var readTextFileSync_js_1 = require_readTextFileSync();
    async function* _listen(server, waitFor) {
      await waitFor;
      while (server.listening) {
        yield new Promise((resolve) => server.once("secureConnection", (socket) => {
          socket.on("error", (err) => console.error(err));
          const rid = socket._handle.fd;
          const localAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.localAddress,
            port: socket.localPort,
            transport: "tcp"
          };
          const remoteAddr = {
            // cannot be undefined while socket is connected
            hostname: socket.remoteAddress,
            port: socket.remotePort,
            transport: "tcp"
          };
          resolve(new Conn_js_1.TlsConn(rid, localAddr, remoteAddr));
        }));
      }
    }
    var listenTls = function listen({ port, hostname = "0.0.0.0", transport = "tcp", certFile, keyFile }) {
      if (transport !== "tcp") {
        throw new Error("Deno.listen is only implemented for transport: tcp");
      }
      const [cert, key] = [certFile, keyFile].map((f) => f == null ? void 0 : (0, readTextFileSync_js_1.readTextFileSync)(f));
      const server = (0, tls_1.createServer)({ cert, key });
      const waitFor = new Promise((resolve) => (
        // server._handle.fd is assigned immediately on .listen()
        server.listen(port, hostname, resolve)
      ));
      const listener = new Listener_js_1.Listener(server._handle.fd, {
        hostname,
        port,
        transport: "tcp"
      }, _listen(server, waitFor));
      return listener;
    };
    exports2.listenTls = listenTls;
  }
});

// dist/script/deno/stable/functions/loadavg.js
var require_loadavg = __commonJS({
  "dist/script/deno/stable/functions/loadavg.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.loadavg = void 0;
    var os = __importStar2(require("os"));
    var loadavg = function loadavg2() {
      return os.loadavg();
    };
    exports2.loadavg = loadavg;
  }
});

// dist/script/deno/stable/functions/lstat.js
var require_lstat = __commonJS({
  "dist/script/deno/stable/functions/lstat.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.lstat = void 0;
    var fs = __importStar2(require("fs/promises"));
    var stat_js_1 = require_stat();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var lstat = async (path) => {
      try {
        return (0, stat_js_1.denoifyFileInfo)(await fs.lstat(path));
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.lstat = lstat;
  }
});

// dist/script/deno/stable/functions/lstatSync.js
var require_lstatSync = __commonJS({
  "dist/script/deno/stable/functions/lstatSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.lstatSync = void 0;
    var fs = __importStar2(require("fs"));
    var stat_js_1 = require_stat();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var lstatSync = (path) => {
      try {
        return (0, stat_js_1.denoifyFileInfo)(fs.lstatSync(path));
      } catch (err) {
        throw (0, errorMap_js_1.default)(err);
      }
    };
    exports2.lstatSync = lstatSync;
  }
});

// dist/script/deno/stable/functions/makeTempDir.js
var require_makeTempDir = __commonJS({
  "dist/script/deno/stable/functions/makeTempDir.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.makeTempDir = void 0;
    var promises_1 = require("fs/promises");
    var path_1 = require("path");
    var os_1 = require("os");
    var makeTempDir = function makeTempDir2({ prefix = "" } = {}) {
      return (0, promises_1.mkdtemp)((0, path_1.join)((0, os_1.tmpdir)(), prefix || "/"));
    };
    exports2.makeTempDir = makeTempDir;
  }
});

// dist/script/deno/stable/functions/makeTempDirSync.js
var require_makeTempDirSync = __commonJS({
  "dist/script/deno/stable/functions/makeTempDirSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.makeTempDirSync = void 0;
    var fs_1 = require("fs");
    var path_1 = require("path");
    var os_1 = require("os");
    var makeTempDirSync = function makeTempDirSync2({ prefix = "" } = {}) {
      return (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), prefix || "/"));
    };
    exports2.makeTempDirSync = makeTempDirSync;
  }
});

// dist/script/deno/internal/random_id.js
var require_random_id = __commonJS({
  "dist/script/deno/internal/random_id.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.randomId = void 0;
    var randomId = () => {
      const n = (Math.random() * 1048575 * 1e6).toString(16);
      return "" + n.slice(0, 6);
    };
    exports2.randomId = randomId;
  }
});

// dist/script/deno/stable/functions/writeTextFile.js
var require_writeTextFile = __commonJS({
  "dist/script/deno/stable/functions/writeTextFile.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.writeTextFile = void 0;
    var fs = __importStar2(require("fs/promises"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var fs_flags_js_1 = require_fs_flags();
    var writeTextFile = async function writeTextFile2(path, data, { append = false, create = true, createNew = false, mode, signal } = {}) {
      const truncate = create && !append;
      const flag = (0, fs_flags_js_1.getFsFlag)({
        append,
        create,
        createNew,
        truncate,
        write: true
      });
      try {
        await fs.writeFile(path, data, { flag, mode, signal });
        if (mode !== void 0)
          await fs.chmod(path, mode);
      } catch (error) {
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.writeTextFile = writeTextFile;
  }
});

// dist/script/deno/stable/functions/makeTempFile.js
var require_makeTempFile = __commonJS({
  "dist/script/deno/stable/functions/makeTempFile.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.makeTempFile = void 0;
    var os_1 = require("os");
    var path_1 = require("path");
    var random_id_js_1 = require_random_id();
    var writeTextFile_js_1 = require_writeTextFile();
    var makeTempFile = async function makeTempFile2({ prefix = "" } = {}) {
      const name = (0, path_1.join)((0, os_1.tmpdir)(), prefix, (0, random_id_js_1.randomId)());
      await (0, writeTextFile_js_1.writeTextFile)(name, "");
      return name;
    };
    exports2.makeTempFile = makeTempFile;
  }
});

// dist/script/deno/stable/functions/writeTextFileSync.js
var require_writeTextFileSync = __commonJS({
  "dist/script/deno/stable/functions/writeTextFileSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.writeTextFileSync = void 0;
    var fs = __importStar2(require("fs"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var writeTextFileSync = (path, data, { append = false, create = true, mode } = {}) => {
      const flag = create ? append ? "a" : "w" : "r+";
      try {
        fs.writeFileSync(path, data, { flag, mode });
        if (mode !== void 0)
          fs.chmodSync(path, mode);
      } catch (error) {
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.writeTextFileSync = writeTextFileSync;
  }
});

// dist/script/deno/stable/functions/makeTempFileSync.js
var require_makeTempFileSync = __commonJS({
  "dist/script/deno/stable/functions/makeTempFileSync.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.makeTempFileSync = void 0;
    var os_1 = require("os");
    var path_1 = require("path");
    var random_id_js_1 = require_random_id();
    var writeTextFileSync_js_1 = require_writeTextFileSync();
    var makeTempFileSync = function makeTempFileSync2({ prefix = "" } = {}) {
      const name = (0, path_1.join)((0, os_1.tmpdir)(), prefix, (0, random_id_js_1.randomId)());
      (0, writeTextFileSync_js_1.writeTextFileSync)(name, "");
      return name;
    };
    exports2.makeTempFileSync = makeTempFileSync;
  }
});

// dist/script/deno/stable/functions/memoryUsage.js
var require_memoryUsage = __commonJS({
  "dist/script/deno/stable/functions/memoryUsage.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.memoryUsage = void 0;
    exports2.memoryUsage = process.memoryUsage;
  }
});

// dist/script/deno/stable/functions/mkdir.js
var require_mkdir = __commonJS({
  "dist/script/deno/stable/functions/mkdir.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.mkdir = void 0;
    var promises_1 = require("fs/promises");
    var errorMap_js_1 = __importDefault(require_errorMap());
    var variables_js_1 = require_variables();
    var mkdir = async function mkdir2(path, options) {
      try {
        await (0, promises_1.mkdir)(path, options);
      } catch (error) {
        if (error?.code === "EEXIST") {
          throw new variables_js_1.errors.AlreadyExists(`File exists (os error 17), mkdir '${path}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.mkdir = mkdir;
  }
});

// dist/script/deno/stable/functions/mkdirSync.js
var require_mkdirSync = __commonJS({
  "dist/script/deno/stable/functions/mkdirSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.mkdirSync = void 0;
    var fs = __importStar2(require("fs"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var variables_js_1 = require_variables();
    var mkdirSync = (path, options) => {
      try {
        fs.mkdirSync(path, options);
      } catch (error) {
        if (error?.code === "EEXIST") {
          throw new variables_js_1.errors.AlreadyExists(`File exists (os error 17), mkdir '${path}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.mkdirSync = mkdirSync;
  }
});

// dist/script/deno/stable/functions/osRelease.js
var require_osRelease = __commonJS({
  "dist/script/deno/stable/functions/osRelease.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.osRelease = void 0;
    var os_1 = require("os");
    var osRelease = function osRelease2() {
      return (0, os_1.release)();
    };
    exports2.osRelease = osRelease;
  }
});

// dist/script/deno/stable/functions/osUptime.js
var require_osUptime = __commonJS({
  "dist/script/deno/stable/functions/osUptime.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.osUptime = void 0;
    var os_1 = require("os");
    var osUptime = function osUptime2() {
      return (0, os_1.uptime)();
    };
    exports2.osUptime = osUptime;
  }
});

// dist/script/deno/stable/functions/readDir.js
var require_readDir = __commonJS({
  "dist/script/deno/stable/functions/readDir.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readDir = void 0;
    var promises_1 = require("fs/promises");
    var errorMap_js_1 = __importDefault(require_errorMap());
    var readDir = async function* readDir2(path) {
      try {
        for await (const e of await (0, promises_1.opendir)(String(path))) {
          const ent = {
            name: e.name,
            isFile: e.isFile(),
            isDirectory: e.isDirectory(),
            isSymlink: e.isSymbolicLink()
          };
          yield ent;
        }
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.readDir = readDir;
  }
});

// dist/script/deno/stable/functions/readDirSync.js
var require_readDirSync = __commonJS({
  "dist/script/deno/stable/functions/readDirSync.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readDirSync = void 0;
    var fs_1 = require("fs");
    var errorMap_js_1 = __importDefault(require_errorMap());
    var readDirSync = function* readDir(path) {
      try {
        for (const e of (0, fs_1.readdirSync)(String(path), { withFileTypes: true })) {
          const ent = {
            name: e.name,
            isFile: e.isFile(),
            isDirectory: e.isDirectory(),
            isSymlink: e.isSymbolicLink()
          };
          yield ent;
        }
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.readDirSync = readDirSync;
  }
});

// dist/script/deno/stable/functions/readFile.js
var require_readFile = __commonJS({
  "dist/script/deno/stable/functions/readFile.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readFile = void 0;
    var promises_1 = require("fs/promises");
    var errorMap_js_1 = __importDefault(require_errorMap());
    var readFile = async function readFile2(path, { signal } = {}) {
      try {
        const buf = await (0, promises_1.readFile)(path, { signal });
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.readFile = readFile;
  }
});

// dist/script/deno/stable/functions/readFileSync.js
var require_readFileSync = __commonJS({
  "dist/script/deno/stable/functions/readFileSync.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readFileSync = void 0;
    var fs_1 = require("fs");
    var errorMap_js_1 = __importDefault(require_errorMap());
    var readFileSync = function readFileSync2(path) {
      try {
        const buf = (0, fs_1.readFileSync)(path);
        return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.readFileSync = readFileSync;
  }
});

// dist/script/deno/stable/functions/readLink.js
var require_readLink = __commonJS({
  "dist/script/deno/stable/functions/readLink.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readLink = void 0;
    var fs = __importStar2(require("fs/promises"));
    exports2.readLink = fs.readlink;
  }
});

// dist/script/deno/stable/functions/readLinkSync.js
var require_readLinkSync = __commonJS({
  "dist/script/deno/stable/functions/readLinkSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.readLinkSync = void 0;
    var fs = __importStar2(require("fs"));
    exports2.readLinkSync = fs.readlinkSync;
  }
});

// dist/script/deno/stable/functions/realPath.js
var require_realPath = __commonJS({
  "dist/script/deno/stable/functions/realPath.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.realPath = void 0;
    var fs = __importStar2(require("fs/promises"));
    exports2.realPath = fs.realpath;
  }
});

// dist/script/deno/stable/functions/realPathSync.js
var require_realPathSync = __commonJS({
  "dist/script/deno/stable/functions/realPathSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.realPathSync = void 0;
    var fs = __importStar2(require("fs"));
    exports2.realPathSync = fs.realpathSync;
  }
});

// dist/script/deno/stable/functions/remove.js
var require_remove = __commonJS({
  "dist/script/deno/stable/functions/remove.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.remove = void 0;
    var promises_1 = require("fs/promises");
    var remove = async function remove2(path, options = {}) {
      const innerOptions = options.recursive ? { recursive: true, force: true } : {};
      try {
        return await (0, promises_1.rm)(path, innerOptions);
      } catch (err) {
        if (err.code === "ERR_FS_EISDIR") {
          return await (0, promises_1.rmdir)(path, innerOptions);
        } else {
          throw err;
        }
      }
    };
    exports2.remove = remove;
  }
});

// dist/script/deno/stable/functions/removeSignalListener.js
var require_removeSignalListener = __commonJS({
  "dist/script/deno/stable/functions/removeSignalListener.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.removeSignalListener = void 0;
    var process_1 = __importDefault(require("process"));
    var removeSignalListener = (signal, handler) => {
      process_1.default.removeListener(signal, handler);
    };
    exports2.removeSignalListener = removeSignalListener;
  }
});

// dist/script/deno/stable/functions/removeSync.js
var require_removeSync = __commonJS({
  "dist/script/deno/stable/functions/removeSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.removeSync = void 0;
    var fs = __importStar2(require("fs"));
    var removeSync = (path, options = {}) => {
      const innerOptions = options.recursive ? { recursive: true, force: true } : {};
      try {
        fs.rmSync(path, innerOptions);
      } catch (err) {
        if (err.code === "ERR_FS_EISDIR") {
          fs.rmdirSync(path, innerOptions);
        } else {
          throw err;
        }
      }
    };
    exports2.removeSync = removeSync;
  }
});

// dist/script/deno/stable/functions/rename.js
var require_rename = __commonJS({
  "dist/script/deno/stable/functions/rename.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.rename = void 0;
    var promises_1 = require("fs/promises");
    var rename = function rename2(oldpath, newpath) {
      return (0, promises_1.rename)(oldpath, newpath);
    };
    exports2.rename = rename;
  }
});

// dist/script/deno/stable/functions/renameSync.js
var require_renameSync = __commonJS({
  "dist/script/deno/stable/functions/renameSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.renameSync = void 0;
    var fs = __importStar2(require("fs"));
    exports2.renameSync = fs.renameSync;
  }
});

// dist/script/deno/stable/functions/resolveDns.js
var require_resolveDns = __commonJS({
  "dist/script/deno/stable/functions/resolveDns.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.resolveDns = void 0;
    var dns_1 = __importDefault(require("dns"));
    var resolveDns = function resolveDns2(query, recordType, options) {
      if (options) {
        throw Error(`resolveDns option not implemnted yet`);
      }
      switch (recordType) {
        case "A":
        case "AAAA":
        case "CNAME":
        case "NS":
        case "PTR":
          return new Promise((resolve, reject) => {
            dns_1.default.resolve(query, recordType, (err, addresses) => {
              if (err) {
                reject(err);
              } else {
                resolve(addresses);
              }
            });
          });
        case "ANAME":
        case "CAA":
        case "MX":
        case "NAPTR":
        case "SOA":
        case "SRV":
        case "TXT":
        default:
          throw Error(`resolveDns type ${recordType} not implemnted yet`);
      }
    };
    exports2.resolveDns = resolveDns;
  }
});

// dist/script/deno/internal/streams.js
var require_streams = __commonJS({
  "dist/script/deno/internal/streams.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.StreamWriter = exports2.BufferStreamReader = void 0;
    var BufferStreamReader = class {
      #stream;
      #error;
      #ended = false;
      #pendingActions = [];
      constructor(stream) {
        this.#stream = stream;
        this.#stream.pause();
        this.#stream.on("error", (error) => {
          this.#error = error;
          this.#runPendingActions();
        });
        this.#stream.on("readable", () => {
          this.#runPendingActions();
        });
        this.#stream.on("end", () => {
          this.#ended = true;
          this.#runPendingActions();
        });
      }
      readAll() {
        return new Promise((resolve, reject) => {
          const chunks = [];
          const action = () => {
            if (this.#error) {
              reject(this.#error);
              return;
            }
            const buffer = this.#stream.read();
            if (buffer != null) {
              chunks.push(buffer);
              this.#pendingActions.push(action);
            } else if (this.#ended) {
              const result = Buffer.concat(chunks);
              resolve(result);
            } else {
              this.#pendingActions.push(action);
            }
          };
          action();
        });
      }
      read(p) {
        return new Promise((resolve, reject) => {
          const action = () => {
            if (this.#error) {
              reject(this.#error);
              return;
            }
            const readBuffer = this.#stream.read(p.byteLength);
            if (readBuffer && readBuffer.byteLength > 0) {
              readBuffer.copy(p, 0, 0, readBuffer.byteLength);
              resolve(readBuffer.byteLength);
              return;
            }
            if (this.#ended) {
              resolve(null);
            } else {
              this.#pendingActions.push(action);
            }
          };
          action();
        });
      }
      #runPendingActions() {
        const errors = [];
        for (const action of this.#pendingActions.splice(0)) {
          try {
            action();
          } catch (err) {
            errors.push(err);
          }
        }
        if (errors.length > 0) {
          throw errors.length > 1 ? new globalThis.AggregateError(errors) : errors[0];
        }
      }
    };
    exports2.BufferStreamReader = BufferStreamReader;
    var StreamWriter = class {
      #stream;
      constructor(stream) {
        this.#stream = stream;
      }
      write(p) {
        return new Promise((resolve, reject) => {
          this.#stream.write(p, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve(p.byteLength);
            }
          });
        });
      }
    };
    exports2.StreamWriter = StreamWriter;
  }
});

// dist/script/deno/stable/functions/run.js
var require_run = __commonJS({
  "dist/script/deno/stable/functions/run.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Process = exports2.run = void 0;
    var child_process_1 = __importDefault(require("child_process"));
    var fs_1 = __importDefault(require("fs"));
    var os_1 = __importDefault(require("os"));
    var url_1 = __importDefault(require("url"));
    var events_1 = require("events");
    var which_1 = __importDefault(require("which"));
    var streams_js_1 = require_streams();
    var errors = __importStar2(require_errors());
    var run = function run2(options) {
      const [cmd, ...args] = options.cmd;
      if (options.cwd && !fs_1.default.existsSync(options.cwd)) {
        throw new Error("The directory name is invalid.");
      }
      const commandName = getCmd(cmd);
      if (!which_1.default.sync(commandName, { nothrow: true })) {
        throw new errors.NotFound("The system cannot find the file specified.");
      }
      const process2 = child_process_1.default.spawn(commandName, args, {
        cwd: options.cwd,
        env: getEnv(options),
        uid: options.uid,
        gid: options.gid,
        shell: false,
        stdio: [
          getStdio(options.stdin, "in"),
          getStdio(options.stdout, "out"),
          getStdio(options.stderr, "out")
        ]
      });
      return new Process(process2);
    };
    exports2.run = run;
    function getStdio(value, kind) {
      if (value === "inherit" || value == null) {
        return "inherit";
      } else if (value === "piped") {
        return "pipe";
      } else if (value === "null") {
        return "ignore";
      } else if (typeof value === "number") {
        switch (kind) {
          case "in":
            return fs_1.default.createReadStream(null, { fd: value });
          case "out":
            return fs_1.default.createWriteStream(null, { fd: value });
          default: {
            const _assertNever = kind;
            throw new Error("Unreachable.");
          }
        }
      } else {
        const _assertNever = value;
        throw new Error("Unknown value.");
      }
    }
    function getCmd(firstArg) {
      if (firstArg instanceof URL) {
        return url_1.default.fileURLToPath(firstArg);
      } else {
        return firstArg;
      }
    }
    function getEnv(options) {
      const env = options.env ?? {};
      for (const name in process.env) {
        if (!Object.prototype.hasOwnProperty.call(env, name)) {
          if (options.clearEnv) {
            if (os_1.default.platform() === "win32") {
              env[name] = "";
            } else {
              delete env[name];
            }
          } else {
            env[name] = process.env[name];
          }
        }
      }
      return env;
    }
    var Process = class {
      #process;
      #stderr;
      #stdout;
      #stdin;
      #status;
      #receivedStatus = false;
      /** @internal */
      constructor(process2) {
        this.#process = process2;
        this.#stdout = ProcessReadStream.fromNullable(this.#process.stdout) ?? null;
        this.#stderr = ProcessReadStream.fromNullable(this.#process.stderr) ?? null;
        this.#stdin = ProcessWriteStream.fromNullable(this.#process.stdin) ?? null;
        this.#status = (0, events_1.once)(process2, "exit");
      }
      get rid() {
        return NaN;
      }
      get pid() {
        return this.#process.pid;
      }
      get stdin() {
        return this.#stdin;
      }
      get stdout() {
        return this.#stdout;
      }
      get stderr() {
        return this.#stderr;
      }
      async status() {
        const [receivedCode, signalName] = await this.#status;
        const signal = signalName ? os_1.default.constants.signals[signalName] : receivedCode > 128 ? receivedCode - 128 : void 0;
        const code = receivedCode != null ? receivedCode : signal != null ? 128 + signal : void 0;
        const success = code === 0;
        this.#receivedStatus = true;
        return { code, signal, success };
      }
      async output() {
        if (!this.#stdout) {
          throw new TypeError("stdout was not piped");
        }
        const result = await this.#stdout.readAll();
        this.#stdout.close();
        return result;
      }
      async stderrOutput() {
        if (!this.#stderr) {
          throw new TypeError("stderr was not piped");
        }
        const result = await this.#stderr.readAll();
        this.#stderr.close();
        return result;
      }
      close() {
        this.#process.unref();
        this.#process.kill();
      }
      kill(signo = "SIGTERM") {
        if (this.#receivedStatus) {
          throw new errors.NotFound("entity not found");
        }
        this.#process.kill(signo);
      }
    };
    exports2.Process = Process;
    var ProcessReadStream = class _ProcessReadStream {
      #stream;
      #bufferStreamReader;
      #closed = false;
      constructor(stream) {
        this.#stream = stream;
        this.#bufferStreamReader = new streams_js_1.BufferStreamReader(stream);
      }
      static fromNullable(stream) {
        return stream ? new _ProcessReadStream(stream) : void 0;
      }
      readAll() {
        if (this.#closed) {
          return Promise.resolve(new Uint8Array(0));
        } else {
          return this.#bufferStreamReader.readAll();
        }
      }
      read(p) {
        if (this.#closed) {
          return Promise.resolve(null);
        } else {
          return this.#bufferStreamReader.read(p);
        }
      }
      close() {
        this.#closed = true;
        this.#stream.destroy();
      }
      get readable() {
        throw new Error("Not implemented.");
      }
      get writable() {
        throw new Error("Not implemented.");
      }
    };
    var ProcessWriteStream = class _ProcessWriteStream {
      #stream;
      #streamWriter;
      #closed = false;
      constructor(stream) {
        this.#stream = stream;
        this.#streamWriter = new streams_js_1.StreamWriter(stream);
      }
      static fromNullable(stream) {
        return stream ? new _ProcessWriteStream(stream) : void 0;
      }
      write(p) {
        if (this.#closed) {
          return Promise.resolve(0);
        } else {
          return this.#streamWriter.write(p);
        }
      }
      close() {
        this.#closed = true;
        this.#stream.end();
      }
    };
  }
});

// dist/script/deno/stable/functions/shutdown.js
var require_shutdown = __commonJS({
  "dist/script/deno/stable/functions/shutdown.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.shutdown = void 0;
    var net_1 = require("net");
    var shutdown = async function shutdown2(rid) {
      await new Promise((resolve) => new net_1.Socket({ fd: rid }).end(resolve));
    };
    exports2.shutdown = shutdown;
  }
});

// dist/script/deno/stable/functions/statSync.js
var require_statSync = __commonJS({
  "dist/script/deno/stable/functions/statSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.statSync = void 0;
    var fs = __importStar2(require("fs"));
    var stat_js_1 = require_stat();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var statSync = (path) => {
      try {
        return (0, stat_js_1.denoifyFileInfo)(fs.statSync(path));
      } catch (err) {
        throw (0, errorMap_js_1.default)(err);
      }
    };
    exports2.statSync = statSync;
  }
});

// dist/script/deno/stable/functions/symlink.js
var require_symlink = __commonJS({
  "dist/script/deno/stable/functions/symlink.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.symlink = void 0;
    var fs = __importStar2(require("fs/promises"));
    var symlink = async (oldpath, newpath, options) => await fs.symlink(oldpath, newpath, options?.type);
    exports2.symlink = symlink;
  }
});

// dist/script/deno/stable/functions/symlinkSync.js
var require_symlinkSync = __commonJS({
  "dist/script/deno/stable/functions/symlinkSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.symlinkSync = void 0;
    var fs = __importStar2(require("fs"));
    var symlinkSync = (oldpath, newpath, options) => fs.symlinkSync(oldpath, newpath, options?.type);
    exports2.symlinkSync = symlinkSync;
  }
});

// dist/script/deno/stable/functions/test.js
var require_test = __commonJS({
  "dist/script/deno/stable/functions/test.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.test = void 0;
    var shim_deno_test_1 = require("@deno/shim-deno-test");
    Object.defineProperty(exports2, "test", { enumerable: true, get: function() {
      return shim_deno_test_1.test;
    } });
  }
});

// dist/script/deno/stable/functions/truncate.js
var require_truncate = __commonJS({
  "dist/script/deno/stable/functions/truncate.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.truncate = void 0;
    var fs = __importStar2(require("fs/promises"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var variables_js_1 = require_variables();
    var truncate = async (name, len) => {
      try {
        return await fs.truncate(name, len);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new variables_js_1.errors.NotFound(`No such file or directory (os error 2), truncate '${name}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.truncate = truncate;
  }
});

// dist/script/deno/stable/functions/truncateSync.js
var require_truncateSync = __commonJS({
  "dist/script/deno/stable/functions/truncateSync.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.truncateSync = void 0;
    var fs = __importStar2(require("fs"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var variables_js_1 = require_variables();
    var truncateSync = (name, len) => {
      try {
        return fs.truncateSync(name, len);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new variables_js_1.errors.NotFound(`No such file or directory (os error 2), truncate '${name}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.truncateSync = truncateSync;
  }
});

// dist/script/deno/stable/functions/uid.js
var require_uid = __commonJS({
  "dist/script/deno/stable/functions/uid.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.uid = void 0;
    var process_1 = __importDefault(require("process"));
    exports2.uid = process_1.default.getuid ?? (() => null);
  }
});

// dist/script/deno/internal/iterutil.js
var require_iterutil = __commonJS({
  "dist/script/deno/internal/iterutil.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.merge = exports2.filterAsync = exports2.mapAsync = exports2.map = void 0;
    function* map(iter, f) {
      for (const i of iter) {
        yield f(i);
      }
    }
    exports2.map = map;
    async function* mapAsync(iter, f) {
      for await (const i of iter) {
        yield f(i);
      }
    }
    exports2.mapAsync = mapAsync;
    async function* filterAsync(iter, filter) {
      for await (const i of iter) {
        if (filter(i)) {
          yield i;
        }
      }
    }
    exports2.filterAsync = filterAsync;
    async function* merge(iterables) {
      const racers = new Map(map(map(iterables, (iter) => iter[Symbol.asyncIterator]()), (iter) => [iter, iter.next()]));
      while (racers.size > 0) {
        const winner = await Promise.race(map(racers.entries(), ([iter, prom]) => prom.then((result) => ({ result, iter }))));
        if (winner.result.done) {
          racers.delete(winner.iter);
        } else {
          yield await winner.result.value;
          racers.set(winner.iter, winner.iter.next());
        }
      }
    }
    exports2.merge = merge;
  }
});

// dist/script/deno/stable/functions/watchFs.js
var require_watchFs = __commonJS({
  "dist/script/deno/stable/functions/watchFs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.watchFs = void 0;
    var promises_1 = require("fs/promises");
    var path_1 = require("path");
    var iterutil_js_1 = require_iterutil();
    var watchFs = function watchFs2(paths, options = { recursive: true }) {
      paths = Array.isArray(paths) ? paths : [paths];
      const ac = new AbortController();
      const { signal } = ac;
      const rid = -1;
      const masterWatcher = (0, iterutil_js_1.merge)(paths.map((path) => (0, iterutil_js_1.mapAsync)((0, iterutil_js_1.filterAsync)((0, promises_1.watch)(path, { recursive: options?.recursive, signal }), (info) => info.filename != null), (info) => ({
        kind: "modify",
        paths: [(0, path_1.resolve)(path, info.filename)]
      }))));
      function close() {
        ac.abort();
      }
      return Object.assign(masterWatcher, {
        rid,
        close,
        [Symbol.dispose]: close
      });
    };
    exports2.watchFs = watchFs;
  }
});

// dist/script/deno/stable/functions/writeFile.js
var require_writeFile = __commonJS({
  "dist/script/deno/stable/functions/writeFile.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __setModuleDefault2 = exports2 && exports2.__setModuleDefault || (Object.create ? function(o, v) {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    } : function(o, v) {
      o["default"] = v;
    });
    var __importStar2 = exports2 && exports2.__importStar || function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k in mod)
          if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
            __createBinding2(result, mod, k);
      }
      __setModuleDefault2(result, mod);
      return result;
    };
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.writeFile = void 0;
    var fs = __importStar2(require("fs/promises"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var fs_flags_js_1 = require_fs_flags();
    var writeFile = async function writeFile2(path, data, { append = false, create = true, createNew = false, mode, signal } = {}) {
      const truncate = create && !append;
      const flag = (0, fs_flags_js_1.getFsFlag)({ append, create, createNew, truncate, write: true });
      try {
        await fs.writeFile(path, data, { flag, signal });
        if (mode != null)
          await fs.chmod(path, mode);
      } catch (error) {
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.writeFile = writeFile;
  }
});

// dist/script/deno/stable/functions/writeFileSync.js
var require_writeFileSync = __commonJS({
  "dist/script/deno/stable/functions/writeFileSync.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.writeFileSync = void 0;
    var os_1 = require("os");
    var openSync_js_1 = require_openSync();
    var errorMap_js_1 = __importDefault(require_errorMap());
    var statSync_js_1 = require_statSync();
    var chmodSync_js_1 = require_chmodSync();
    var writeFileSync = function writeFileSync2(path, data, options = {}) {
      try {
        if (options.create !== void 0) {
          const create = !!options.create;
          if (!create) {
            (0, statSync_js_1.statSync)(path);
          }
        }
        const openOptions = {
          write: true,
          create: true,
          createNew: options.createNew,
          append: !!options.append,
          truncate: !options.append
        };
        const file = (0, openSync_js_1.openSync)(path, openOptions);
        if (options.mode !== void 0 && options.mode !== null && (0, os_1.platform)() !== "win32") {
          (0, chmodSync_js_1.chmodSync)(path, options.mode);
        }
        let nwritten = 0;
        while (nwritten < data.length) {
          nwritten += file.writeSync(data.subarray(nwritten));
        }
        file.close();
      } catch (e) {
        throw (0, errorMap_js_1.default)(e);
      }
    };
    exports2.writeFileSync = writeFileSync;
  }
});

// dist/script/deno/stable/variables/args.js
var require_args = __commonJS({
  "dist/script/deno/stable/variables/args.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.args = void 0;
    exports2.args = process.argv.slice(2);
  }
});

// dist/script/deno/stable/functions.js
var require_functions = __commonJS({
  "dist/script/deno/stable/functions.js"(exports2) {
    "use strict";
    var __importDefault = exports2 && exports2.__importDefault || function(mod) {
      return mod && mod.__esModule ? mod : { "default": mod };
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.read = exports2.osUptime = exports2.osRelease = exports2.openSync = exports2.open = exports2.mkdirSync = exports2.mkdir = exports2.memoryUsage = exports2.makeTempFileSync = exports2.makeTempFile = exports2.makeTempDirSync = exports2.makeTempDir = exports2.lstatSync = exports2.lstat = exports2.loadavg = exports2.listenTls = exports2.listen = exports2.linkSync = exports2.link = exports2.kill = exports2.inspect = exports2.hostname = exports2.gid = exports2.ftruncateSync = exports2.ftruncate = exports2.fsyncSync = exports2.fsync = exports2.fstatSync = exports2.fstat = exports2.fdatasyncSync = exports2.fdatasync = exports2.exit = exports2.execPath = exports2.cwd = exports2.createSync = exports2.create = exports2.copyFileSync = exports2.copyFile = exports2.copy = exports2.consoleSize = exports2.connectTls = exports2.connect = exports2.close = exports2.chownSync = exports2.chown = exports2.chmodSync = exports2.chmod = exports2.chdir = exports2.addSignalListener = exports2.isatty = void 0;
    exports2.utimeSync = exports2.utime = exports2.futimeSync = exports2.futime = exports2.args = exports2.writeTextFileSync = exports2.writeTextFile = exports2.writeSync = exports2.writeFileSync = exports2.writeFile = exports2.write = exports2.watchFs = exports2.uid = exports2.truncateSync = exports2.truncate = exports2.test = exports2.symlinkSync = exports2.symlink = exports2.statSync = exports2.stat = exports2.shutdown = exports2.run = exports2.Process = exports2.resolveDns = exports2.renameSync = exports2.rename = exports2.removeSync = exports2.removeSignalListener = exports2.remove = exports2.realPathSync = exports2.realPath = exports2.readTextFileSync = exports2.readTextFile = exports2.readSync = exports2.readLinkSync = exports2.readLink = exports2.readFileSync = exports2.readFile = exports2.readDirSync = exports2.readDir = void 0;
    var fs_1 = __importDefault(require("fs"));
    var errorMap_js_1 = __importDefault(require_errorMap());
    var variables_js_1 = require_variables();
    var tty_1 = require("tty");
    Object.defineProperty(exports2, "isatty", { enumerable: true, get: function() {
      return tty_1.isatty;
    } });
    var addSignalListener_js_1 = require_addSignalListener();
    Object.defineProperty(exports2, "addSignalListener", { enumerable: true, get: function() {
      return addSignalListener_js_1.addSignalListener;
    } });
    var chdir_js_1 = require_chdir();
    Object.defineProperty(exports2, "chdir", { enumerable: true, get: function() {
      return chdir_js_1.chdir;
    } });
    var chmod_js_1 = require_chmod();
    Object.defineProperty(exports2, "chmod", { enumerable: true, get: function() {
      return chmod_js_1.chmod;
    } });
    var chmodSync_js_1 = require_chmodSync();
    Object.defineProperty(exports2, "chmodSync", { enumerable: true, get: function() {
      return chmodSync_js_1.chmodSync;
    } });
    var chown_js_1 = require_chown();
    Object.defineProperty(exports2, "chown", { enumerable: true, get: function() {
      return chown_js_1.chown;
    } });
    var chownSync_js_1 = require_chownSync();
    Object.defineProperty(exports2, "chownSync", { enumerable: true, get: function() {
      return chownSync_js_1.chownSync;
    } });
    var close_js_1 = require_close();
    Object.defineProperty(exports2, "close", { enumerable: true, get: function() {
      return close_js_1.close;
    } });
    var connect_js_1 = require_connect();
    Object.defineProperty(exports2, "connect", { enumerable: true, get: function() {
      return connect_js_1.connect;
    } });
    var connectTls_js_1 = require_connectTls();
    Object.defineProperty(exports2, "connectTls", { enumerable: true, get: function() {
      return connectTls_js_1.connectTls;
    } });
    var consoleSize_js_1 = require_consoleSize();
    Object.defineProperty(exports2, "consoleSize", { enumerable: true, get: function() {
      return consoleSize_js_1.consoleSize;
    } });
    var copy_js_1 = require_copy();
    Object.defineProperty(exports2, "copy", { enumerable: true, get: function() {
      return copy_js_1.copy;
    } });
    var copyFile_js_1 = require_copyFile();
    Object.defineProperty(exports2, "copyFile", { enumerable: true, get: function() {
      return copyFile_js_1.copyFile;
    } });
    var copyFileSync_js_1 = require_copyFileSync();
    Object.defineProperty(exports2, "copyFileSync", { enumerable: true, get: function() {
      return copyFileSync_js_1.copyFileSync;
    } });
    var create_js_1 = require_create();
    Object.defineProperty(exports2, "create", { enumerable: true, get: function() {
      return create_js_1.create;
    } });
    var createSync_js_1 = require_createSync();
    Object.defineProperty(exports2, "createSync", { enumerable: true, get: function() {
      return createSync_js_1.createSync;
    } });
    var cwd_js_1 = require_cwd();
    Object.defineProperty(exports2, "cwd", { enumerable: true, get: function() {
      return cwd_js_1.cwd;
    } });
    var execPath_js_1 = require_execPath();
    Object.defineProperty(exports2, "execPath", { enumerable: true, get: function() {
      return execPath_js_1.execPath;
    } });
    var exit_js_1 = require_exit();
    Object.defineProperty(exports2, "exit", { enumerable: true, get: function() {
      return exit_js_1.exit;
    } });
    var fdatasync_js_1 = require_fdatasync();
    Object.defineProperty(exports2, "fdatasync", { enumerable: true, get: function() {
      return fdatasync_js_1.fdatasync;
    } });
    var fdatasyncSync_js_1 = require_fdatasyncSync();
    Object.defineProperty(exports2, "fdatasyncSync", { enumerable: true, get: function() {
      return fdatasyncSync_js_1.fdatasyncSync;
    } });
    var fstat_js_1 = require_fstat();
    Object.defineProperty(exports2, "fstat", { enumerable: true, get: function() {
      return fstat_js_1.fstat;
    } });
    var fstatSync_js_1 = require_fstatSync();
    Object.defineProperty(exports2, "fstatSync", { enumerable: true, get: function() {
      return fstatSync_js_1.fstatSync;
    } });
    var fsync_js_1 = require_fsync();
    Object.defineProperty(exports2, "fsync", { enumerable: true, get: function() {
      return fsync_js_1.fsync;
    } });
    var fsyncSync_js_1 = require_fsyncSync();
    Object.defineProperty(exports2, "fsyncSync", { enumerable: true, get: function() {
      return fsyncSync_js_1.fsyncSync;
    } });
    var ftruncate_js_1 = require_ftruncate();
    Object.defineProperty(exports2, "ftruncate", { enumerable: true, get: function() {
      return ftruncate_js_1.ftruncate;
    } });
    var ftruncateSync_js_1 = require_ftruncateSync();
    Object.defineProperty(exports2, "ftruncateSync", { enumerable: true, get: function() {
      return ftruncateSync_js_1.ftruncateSync;
    } });
    var gid_js_1 = require_gid();
    Object.defineProperty(exports2, "gid", { enumerable: true, get: function() {
      return gid_js_1.gid;
    } });
    var hostname_js_1 = require_hostname();
    Object.defineProperty(exports2, "hostname", { enumerable: true, get: function() {
      return hostname_js_1.hostname;
    } });
    var inspect_js_1 = require_inspect();
    Object.defineProperty(exports2, "inspect", { enumerable: true, get: function() {
      return inspect_js_1.inspect;
    } });
    var kill_js_1 = require_kill();
    Object.defineProperty(exports2, "kill", { enumerable: true, get: function() {
      return kill_js_1.kill;
    } });
    var link_js_1 = require_link();
    Object.defineProperty(exports2, "link", { enumerable: true, get: function() {
      return link_js_1.link;
    } });
    var linkSync_js_1 = require_linkSync();
    Object.defineProperty(exports2, "linkSync", { enumerable: true, get: function() {
      return linkSync_js_1.linkSync;
    } });
    var listen_js_1 = require_listen();
    Object.defineProperty(exports2, "listen", { enumerable: true, get: function() {
      return listen_js_1.listen;
    } });
    var listenTls_js_1 = require_listenTls();
    Object.defineProperty(exports2, "listenTls", { enumerable: true, get: function() {
      return listenTls_js_1.listenTls;
    } });
    var loadavg_js_1 = require_loadavg();
    Object.defineProperty(exports2, "loadavg", { enumerable: true, get: function() {
      return loadavg_js_1.loadavg;
    } });
    var lstat_js_1 = require_lstat();
    Object.defineProperty(exports2, "lstat", { enumerable: true, get: function() {
      return lstat_js_1.lstat;
    } });
    var lstatSync_js_1 = require_lstatSync();
    Object.defineProperty(exports2, "lstatSync", { enumerable: true, get: function() {
      return lstatSync_js_1.lstatSync;
    } });
    var makeTempDir_js_1 = require_makeTempDir();
    Object.defineProperty(exports2, "makeTempDir", { enumerable: true, get: function() {
      return makeTempDir_js_1.makeTempDir;
    } });
    var makeTempDirSync_js_1 = require_makeTempDirSync();
    Object.defineProperty(exports2, "makeTempDirSync", { enumerable: true, get: function() {
      return makeTempDirSync_js_1.makeTempDirSync;
    } });
    var makeTempFile_js_1 = require_makeTempFile();
    Object.defineProperty(exports2, "makeTempFile", { enumerable: true, get: function() {
      return makeTempFile_js_1.makeTempFile;
    } });
    var makeTempFileSync_js_1 = require_makeTempFileSync();
    Object.defineProperty(exports2, "makeTempFileSync", { enumerable: true, get: function() {
      return makeTempFileSync_js_1.makeTempFileSync;
    } });
    var memoryUsage_js_1 = require_memoryUsage();
    Object.defineProperty(exports2, "memoryUsage", { enumerable: true, get: function() {
      return memoryUsage_js_1.memoryUsage;
    } });
    var mkdir_js_1 = require_mkdir();
    Object.defineProperty(exports2, "mkdir", { enumerable: true, get: function() {
      return mkdir_js_1.mkdir;
    } });
    var mkdirSync_js_1 = require_mkdirSync();
    Object.defineProperty(exports2, "mkdirSync", { enumerable: true, get: function() {
      return mkdirSync_js_1.mkdirSync;
    } });
    var open_js_1 = require_open();
    Object.defineProperty(exports2, "open", { enumerable: true, get: function() {
      return open_js_1.open;
    } });
    var openSync_js_1 = require_openSync();
    Object.defineProperty(exports2, "openSync", { enumerable: true, get: function() {
      return openSync_js_1.openSync;
    } });
    var osRelease_js_1 = require_osRelease();
    Object.defineProperty(exports2, "osRelease", { enumerable: true, get: function() {
      return osRelease_js_1.osRelease;
    } });
    var osUptime_js_1 = require_osUptime();
    Object.defineProperty(exports2, "osUptime", { enumerable: true, get: function() {
      return osUptime_js_1.osUptime;
    } });
    var read_js_1 = require_read();
    Object.defineProperty(exports2, "read", { enumerable: true, get: function() {
      return read_js_1.read;
    } });
    var readDir_js_1 = require_readDir();
    Object.defineProperty(exports2, "readDir", { enumerable: true, get: function() {
      return readDir_js_1.readDir;
    } });
    var readDirSync_js_1 = require_readDirSync();
    Object.defineProperty(exports2, "readDirSync", { enumerable: true, get: function() {
      return readDirSync_js_1.readDirSync;
    } });
    var readFile_js_1 = require_readFile();
    Object.defineProperty(exports2, "readFile", { enumerable: true, get: function() {
      return readFile_js_1.readFile;
    } });
    var readFileSync_js_1 = require_readFileSync();
    Object.defineProperty(exports2, "readFileSync", { enumerable: true, get: function() {
      return readFileSync_js_1.readFileSync;
    } });
    var readLink_js_1 = require_readLink();
    Object.defineProperty(exports2, "readLink", { enumerable: true, get: function() {
      return readLink_js_1.readLink;
    } });
    var readLinkSync_js_1 = require_readLinkSync();
    Object.defineProperty(exports2, "readLinkSync", { enumerable: true, get: function() {
      return readLinkSync_js_1.readLinkSync;
    } });
    var readSync_js_1 = require_readSync();
    Object.defineProperty(exports2, "readSync", { enumerable: true, get: function() {
      return readSync_js_1.readSync;
    } });
    var readTextFile_js_1 = require_readTextFile();
    Object.defineProperty(exports2, "readTextFile", { enumerable: true, get: function() {
      return readTextFile_js_1.readTextFile;
    } });
    var readTextFileSync_js_1 = require_readTextFileSync();
    Object.defineProperty(exports2, "readTextFileSync", { enumerable: true, get: function() {
      return readTextFileSync_js_1.readTextFileSync;
    } });
    var realPath_js_1 = require_realPath();
    Object.defineProperty(exports2, "realPath", { enumerable: true, get: function() {
      return realPath_js_1.realPath;
    } });
    var realPathSync_js_1 = require_realPathSync();
    Object.defineProperty(exports2, "realPathSync", { enumerable: true, get: function() {
      return realPathSync_js_1.realPathSync;
    } });
    var remove_js_1 = require_remove();
    Object.defineProperty(exports2, "remove", { enumerable: true, get: function() {
      return remove_js_1.remove;
    } });
    var removeSignalListener_js_1 = require_removeSignalListener();
    Object.defineProperty(exports2, "removeSignalListener", { enumerable: true, get: function() {
      return removeSignalListener_js_1.removeSignalListener;
    } });
    var removeSync_js_1 = require_removeSync();
    Object.defineProperty(exports2, "removeSync", { enumerable: true, get: function() {
      return removeSync_js_1.removeSync;
    } });
    var rename_js_1 = require_rename();
    Object.defineProperty(exports2, "rename", { enumerable: true, get: function() {
      return rename_js_1.rename;
    } });
    var renameSync_js_1 = require_renameSync();
    Object.defineProperty(exports2, "renameSync", { enumerable: true, get: function() {
      return renameSync_js_1.renameSync;
    } });
    var resolveDns_js_1 = require_resolveDns();
    Object.defineProperty(exports2, "resolveDns", { enumerable: true, get: function() {
      return resolveDns_js_1.resolveDns;
    } });
    var run_js_1 = require_run();
    Object.defineProperty(exports2, "Process", { enumerable: true, get: function() {
      return run_js_1.Process;
    } });
    Object.defineProperty(exports2, "run", { enumerable: true, get: function() {
      return run_js_1.run;
    } });
    var shutdown_js_1 = require_shutdown();
    Object.defineProperty(exports2, "shutdown", { enumerable: true, get: function() {
      return shutdown_js_1.shutdown;
    } });
    var stat_js_1 = require_stat();
    Object.defineProperty(exports2, "stat", { enumerable: true, get: function() {
      return stat_js_1.stat;
    } });
    var statSync_js_1 = require_statSync();
    Object.defineProperty(exports2, "statSync", { enumerable: true, get: function() {
      return statSync_js_1.statSync;
    } });
    var symlink_js_1 = require_symlink();
    Object.defineProperty(exports2, "symlink", { enumerable: true, get: function() {
      return symlink_js_1.symlink;
    } });
    var symlinkSync_js_1 = require_symlinkSync();
    Object.defineProperty(exports2, "symlinkSync", { enumerable: true, get: function() {
      return symlinkSync_js_1.symlinkSync;
    } });
    var test_js_1 = require_test();
    Object.defineProperty(exports2, "test", { enumerable: true, get: function() {
      return test_js_1.test;
    } });
    var truncate_js_1 = require_truncate();
    Object.defineProperty(exports2, "truncate", { enumerable: true, get: function() {
      return truncate_js_1.truncate;
    } });
    var truncateSync_js_1 = require_truncateSync();
    Object.defineProperty(exports2, "truncateSync", { enumerable: true, get: function() {
      return truncateSync_js_1.truncateSync;
    } });
    var uid_js_1 = require_uid();
    Object.defineProperty(exports2, "uid", { enumerable: true, get: function() {
      return uid_js_1.uid;
    } });
    var watchFs_js_1 = require_watchFs();
    Object.defineProperty(exports2, "watchFs", { enumerable: true, get: function() {
      return watchFs_js_1.watchFs;
    } });
    var write_js_1 = require_write();
    Object.defineProperty(exports2, "write", { enumerable: true, get: function() {
      return write_js_1.write;
    } });
    var writeFile_js_1 = require_writeFile();
    Object.defineProperty(exports2, "writeFile", { enumerable: true, get: function() {
      return writeFile_js_1.writeFile;
    } });
    var writeFileSync_js_1 = require_writeFileSync();
    Object.defineProperty(exports2, "writeFileSync", { enumerable: true, get: function() {
      return writeFileSync_js_1.writeFileSync;
    } });
    var writeSync_js_1 = require_writeSync();
    Object.defineProperty(exports2, "writeSync", { enumerable: true, get: function() {
      return writeSync_js_1.writeSync;
    } });
    var writeTextFile_js_1 = require_writeTextFile();
    Object.defineProperty(exports2, "writeTextFile", { enumerable: true, get: function() {
      return writeTextFile_js_1.writeTextFile;
    } });
    var writeTextFileSync_js_1 = require_writeTextFileSync();
    Object.defineProperty(exports2, "writeTextFileSync", { enumerable: true, get: function() {
      return writeTextFileSync_js_1.writeTextFileSync;
    } });
    var args_js_1 = require_args();
    Object.defineProperty(exports2, "args", { enumerable: true, get: function() {
      return args_js_1.args;
    } });
    var futime = async function(rid, atime, mtime) {
      try {
        await new Promise((resolve, reject) => {
          fs_1.default.futimes(rid, atime, mtime, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        });
      } catch (error) {
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.futime = futime;
    var futimeSync = function(rid, atime, mtime) {
      try {
        fs_1.default.futimesSync(rid, atime, mtime);
      } catch (error) {
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.futimeSync = futimeSync;
    var utime = async function(path, atime, mtime) {
      try {
        await fs_1.default.promises.utimes(path, atime, mtime);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new variables_js_1.errors.NotFound(`No such file or directory (os error 2), utime '${path}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.utime = utime;
    var utimeSync = function(path, atime, mtime) {
      try {
        fs_1.default.utimesSync(path, atime, mtime);
      } catch (error) {
        if (error?.code === "ENOENT") {
          throw new variables_js_1.errors.NotFound(`No such file or directory (os error 2), utime '${path}'`);
        }
        throw (0, errorMap_js_1.default)(error);
      }
    };
    exports2.utimeSync = utimeSync;
  }
});

// dist/script/deno/stable/types.js
var require_types = __commonJS({
  "dist/script/deno/stable/types.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
  }
});

// dist/script/deno/stable/main.js
var require_main = __commonJS({
  "dist/script/deno/stable/main.js"(exports2) {
    "use strict";
    var __createBinding2 = exports2 && exports2.__createBinding || (Object.create ? function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    } : function(o, m, k, k2) {
      if (k2 === void 0)
        k2 = k;
      o[k2] = m[k];
    });
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m)
        if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p))
          __createBinding2(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    __exportStar(require_classes(), exports2);
    __exportStar(require_enums(), exports2);
    __exportStar(require_functions(), exports2);
    __exportStar(require_types(), exports2);
    __exportStar(require_variables(), exports2);
  }
});

// dist/script/index.js
var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = { enumerable: true, get: function() {
      return m[k];
    } };
  }
  Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
  if (k2 === void 0)
    k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
} : function(o, v) {
  o["default"] = v;
});
var __importStar = exports && exports.__importStar || function(mod) {
  if (mod && mod.__esModule)
    return mod;
  var result = {};
  if (mod != null) {
    for (var k in mod)
      if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
        __createBinding(result, mod, k);
  }
  __setModuleDefault(result, mod);
  return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deno = void 0;
exports.Deno = __importStar(require_main());
