var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// dist/esm/deno/stable/main.js
var main_exports = {};
__export(main_exports, {
  File: () => File,
  FsFile: () => FsFile,
  PermissionStatus: () => PermissionStatus,
  Permissions: () => Permissions,
  Process: () => Process,
  SeekMode: () => SeekMode,
  addSignalListener: () => addSignalListener,
  args: () => args,
  build: () => build,
  chdir: () => chdir,
  chmod: () => chmod2,
  chmodSync: () => chmodSync2,
  chown: () => chown2,
  chownSync: () => chownSync2,
  close: () => close,
  connect: () => connect,
  connectTls: () => connectTls,
  consoleSize: () => consoleSize,
  copy: () => copy,
  copyFile: () => copyFile2,
  copyFileSync: () => copyFileSync2,
  create: () => create,
  createSync: () => createSync,
  customInspect: () => customInspect,
  cwd: () => cwd,
  env: () => env,
  errors: () => errors_exports,
  execPath: () => execPath,
  exit: () => exit,
  fdatasync: () => fdatasync,
  fdatasyncSync: () => fdatasyncSync,
  fstat: () => fstat2,
  fstatSync: () => fstatSync,
  fsync: () => fsync,
  fsyncSync: () => fsyncSync,
  ftruncate: () => ftruncate,
  ftruncateSync: () => ftruncateSync,
  futime: () => futime,
  futimeSync: () => futimeSync,
  gid: () => gid,
  hostname: () => hostname2,
  inspect: () => inspect2,
  isatty: () => isatty,
  kill: () => kill,
  link: () => link2,
  linkSync: () => linkSync2,
  listen: () => listen,
  listenTls: () => listenTls,
  loadavg: () => loadavg2,
  lstat: () => lstat2,
  lstatSync: () => lstatSync2,
  mainModule: () => mainModule,
  makeTempDir: () => makeTempDir,
  makeTempDirSync: () => makeTempDirSync,
  makeTempFile: () => makeTempFile,
  makeTempFileSync: () => makeTempFileSync,
  memoryUsage: () => memoryUsage,
  metrics: () => metrics,
  mkdir: () => mkdir,
  mkdirSync: () => mkdirSync2,
  noColor: () => noColor,
  open: () => open,
  openSync: () => openSync,
  osRelease: () => osRelease,
  osUptime: () => osUptime,
  permissions: () => permissions,
  pid: () => pid,
  ppid: () => ppid,
  read: () => read,
  readDir: () => readDir,
  readDirSync: () => readDirSync,
  readFile: () => readFile2,
  readFileSync: () => readFileSync2,
  readLink: () => readLink,
  readLinkSync: () => readLinkSync,
  readSync: () => readSync2,
  readTextFile: () => readTextFile,
  readTextFileSync: () => readTextFileSync,
  realPath: () => realPath,
  realPathSync: () => realPathSync,
  remove: () => remove,
  removeSignalListener: () => removeSignalListener,
  removeSync: () => removeSync,
  rename: () => rename,
  renameSync: () => renameSync2,
  resolveDns: () => resolveDns,
  resources: () => resources,
  run: () => run,
  shutdown: () => shutdown,
  stat: () => stat,
  statSync: () => statSync2,
  stderr: () => stderr,
  stdin: () => stdin,
  stdout: () => stdout,
  symlink: () => symlink2,
  symlinkSync: () => symlinkSync2,
  test: () => test,
  truncate: () => truncate2,
  truncateSync: () => truncateSync2,
  uid: () => uid,
  utime: () => utime,
  utimeSync: () => utimeSync,
  version: () => version,
  watchFs: () => watchFs,
  write: () => write2,
  writeFile: () => writeFile3,
  writeFileSync: () => writeFileSync2,
  writeSync: () => writeSync2,
  writeTextFile: () => writeTextFile,
  writeTextFileSync: () => writeTextFileSync
});

// dist/esm/deno/stable/classes/FsFile.js
import * as fs5 from "fs";
import * as stream from "stream";

// dist/esm/deno/stable/functions/fstat.js
import * as fs from "fs";
import { promisify } from "util";

// dist/esm/deno/stable/functions/stat.js
import { stat as nodeStat } from "fs/promises";
import * as os from "os";

// dist/esm/deno/stable/variables/errors.js
var errors_exports = {};
__export(errors_exports, {
  AddrInUse: () => AddrInUse,
  AddrNotAvailable: () => AddrNotAvailable,
  AlreadyExists: () => AlreadyExists,
  BadResource: () => BadResource,
  BrokenPipe: () => BrokenPipe,
  Busy: () => Busy,
  ConnectionAborted: () => ConnectionAborted,
  ConnectionRefused: () => ConnectionRefused,
  ConnectionReset: () => ConnectionReset,
  Http: () => Http,
  Interrupted: () => Interrupted,
  InvalidData: () => InvalidData,
  NotConnected: () => NotConnected,
  NotFound: () => NotFound,
  PermissionDenied: () => PermissionDenied,
  TimedOut: () => TimedOut,
  UnexpectedEof: () => UnexpectedEof,
  WriteZero: () => WriteZero
});
var AddrInUse = class extends Error {
};
var AddrNotAvailable = class extends Error {
};
var AlreadyExists = class extends Error {
};
var BadResource = class extends Error {
};
var BrokenPipe = class extends Error {
};
var Busy = class extends Error {
};
var ConnectionAborted = class extends Error {
};
var ConnectionRefused = class extends Error {
};
var ConnectionReset = class extends Error {
};
var Http = class extends Error {
};
var Interrupted = class extends Error {
};
var InvalidData = class extends Error {
};
var NotConnected = class extends Error {
};
var NotFound = class extends Error {
  code = "ENOENT";
};
var PermissionDenied = class extends Error {
};
var TimedOut = class extends Error {
};
var UnexpectedEof = class extends Error {
};
var WriteZero = class extends Error {
};

// dist/esm/deno/internal/errorMap.js
var mapper = (Ctor) => (err) => Object.assign(new Ctor(err.message), {
  stack: err.stack
});
var map = {
  EEXIST: mapper(AlreadyExists),
  ENOENT: mapper(NotFound),
  EBADF: mapper(BadResource)
};
var isNodeErr = (e) => {
  return e instanceof Error && "code" in e;
};
function mapError(e) {
  if (!isNodeErr(e))
    return e;
  return map[e.code]?.(e) || e;
}

// dist/esm/deno/stable/functions/stat.js
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
var stat = async (path) => {
  try {
    return denoifyFileInfo(await nodeStat(path));
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/fstat.js
var nodeFstat = promisify(fs.fstat);
var fstat2 = async function(fd) {
  try {
    return denoifyFileInfo(await nodeFstat(fd));
  } catch (err) {
    throw mapError(err);
  }
};

// dist/esm/deno/stable/functions/fstatSync.js
import { fstatSync as nodeFstatSync } from "fs";
var fstatSync = function fstatSync2(fd) {
  try {
    return denoifyFileInfo(nodeFstatSync(fd));
  } catch (err) {
    throw mapError(err);
  }
};

// dist/esm/deno/stable/functions/ftruncate.js
import { ftruncate as nodeftruncate } from "fs";
import { promisify as promisify2 } from "util";
var _ftruncate = promisify2(nodeftruncate);
var ftruncate = _ftruncate;

// dist/esm/deno/stable/functions/ftruncateSync.js
import { ftruncateSync as nodeftruncateSync } from "fs";
var ftruncateSync = nodeftruncateSync;

// dist/esm/deno/stable/functions/fdatasync.js
import { fdatasync as nodefdatasync } from "fs";
import { promisify as promisify3 } from "util";
var _fdatasync = promisify3(nodefdatasync);
var fdatasync = _fdatasync;

// dist/esm/deno/stable/functions/fdatasyncSync.js
import { fdatasyncSync as nodefdatasyncSync } from "fs";
var fdatasyncSync = nodefdatasyncSync;

// dist/esm/deno/stable/functions/read.js
import { promisify as promisify4 } from "util";
import { read as nodeRead } from "fs";
var _read = promisify4(nodeRead);
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

// dist/esm/deno/stable/functions/readSync.js
import * as fs2 from "fs";
var readSync2 = (fd, buffer) => {
  const bytesRead = fs2.readSync(fd, buffer);
  return bytesRead === 0 ? null : bytesRead;
};

// dist/esm/deno/stable/functions/write.js
import * as fs3 from "fs";
import { promisify as promisify5 } from "util";
var nodeWrite = promisify5(fs3.write);
var write2 = async (fd, data) => {
  const { bytesWritten } = await nodeWrite(fd, data);
  return bytesWritten;
};

// dist/esm/deno/stable/functions/writeSync.js
import * as fs4 from "fs";
var writeSync2 = fs4.writeSync;

// dist/esm/deno/stable/classes/FsFile.js
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
    return await write2(this.rid, p);
  }
  writeSync(p) {
    return writeSync2(this.rid, p);
  }
  async truncate(len) {
    await ftruncate(this.rid, len);
  }
  truncateSync(len) {
    return ftruncateSync(this.rid, len);
  }
  read(p) {
    return read(this.rid, p);
  }
  readSync(p) {
    return readSync2(this.rid, p);
  }
  seek(_offset, _whence) {
    throw new Error("Method not implemented.");
  }
  seekSync(_offset, _whence) {
    throw new Error("Method not implemented.");
  }
  async stat() {
    return await fstat2(this.rid);
  }
  statSync() {
    return fstatSync(this.rid);
  }
  sync() {
    throw new Error("Method not implemented.");
  }
  syncSync() {
    throw new Error("Method not implemented.");
  }
  syncData() {
    return fdatasync(this.rid);
  }
  syncDataSync() {
    return fdatasyncSync(this.rid);
  }
  utime(_atime, _mtime) {
    throw new Error("Method not implemented.");
  }
  utimeSync(_atime, _mtime) {
    throw new Error("Method not implemented.");
  }
  close() {
    this.#closed = true;
    fs5.closeSync(this.rid);
  }
  #readableStream;
  get readable() {
    if (this.#readableStream == null) {
      const nodeStream = fs5.createReadStream(null, {
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
      const nodeStream = fs5.createWriteStream(null, {
        fd: this.rid,
        autoClose: false
      });
      this.#writableStream = stream.Writable.toWeb(nodeStream);
    }
    return this.#writableStream;
  }
};
var File = FsFile;

// dist/esm/deno/stable/classes/PermissionStatus.js
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

// dist/esm/deno/stable/classes/Permissions.js
var Permissions = class {
  query(desc) {
    return Promise.resolve(this.querySync(desc));
  }
  querySync(_desc) {
    return new PermissionStatus("granted");
  }
  revoke(desc) {
    return Promise.resolve(this.revokeSync(desc));
  }
  revokeSync(_desc) {
    return new PermissionStatus("denied");
  }
  request(desc) {
    return this.query(desc);
  }
  requestSync(desc) {
    return this.querySync(desc);
  }
};

// dist/esm/deno/stable/enums/SeekMode.js
var SeekMode;
(function(SeekMode2) {
  SeekMode2[SeekMode2["Start"] = 0] = "Start";
  SeekMode2[SeekMode2["Current"] = 1] = "Current";
  SeekMode2[SeekMode2["End"] = 2] = "End";
})(SeekMode || (SeekMode = {}));

// dist/esm/deno/stable/functions.js
import fs34 from "fs";

// dist/esm/deno/stable/variables/build.js
import * as os2 from "os";
var arch = process.arch === "arm64" ? "aarch64" : "x86_64";
var build = {
  arch,
  os: /* @__PURE__ */ ((p) => p === "win32" ? "windows" : p === "darwin" ? "darwin" : "linux")(os2.platform()),
  vendor: "pc",
  target: ((p) => p === "win32" ? `${arch}-pc-windows-msvc` : p === "darwin" ? `${arch}-apple-darwin` : `${arch}-unknown-linux-gnu`)(os2.platform())
};

// dist/esm/deno/stable/variables/customInspect.js
var customInspect = Symbol.for("nodejs.util.inspect.custom");

// dist/esm/deno/stable/variables/env.js
var env = {
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

// dist/esm/deno/stable/variables/mainModule.js
import { join } from "path";
import { pathToFileURL } from "url";
var mainModule = pathToFileURL(process.argv[1] ?? join(process.cwd(), "$deno$repl.ts")).href;

// dist/esm/deno/stable/variables/metrics.js
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

// dist/esm/deno/stable/variables/noColor.js
var noColor = process.env.NO_COLOR !== void 0;

// dist/esm/deno/stable/variables/permissions.js
var permissions = new Permissions();

// dist/esm/deno/stable/variables/pid.js
var pid = process.pid;

// dist/esm/deno/stable/variables/ppid.js
var ppid = process.ppid;

// dist/esm/deno/stable/variables/resources.js
var resources = function resources2() {
  console.warn([
    "Deno.resources() shim returns a dummy object that does not update.",
    "If you think this is a mistake, raise an issue at https://github.com/denoland/node_deno_shims/issues"
  ].join("\n"));
  return {};
};

// dist/esm/deno/stable/variables/std.js
import stream2 from "stream";
import tty from "tty";
function chain(fn, cleanup) {
  let prev;
  return function _fn(...args2) {
    const curr = (prev || Promise.resolve()).then(() => fn(...args2)).finally(cleanup || (() => {
    })).then((result) => {
      if (prev === curr)
        prev = void 0;
      return result;
    });
    return prev = curr;
  };
}
var stdinReadable;
var stdin = {
  rid: 0,
  isTerminal() {
    return tty.isatty(this.rid);
  },
  read: chain((p) => {
    return new Promise((resolve2, reject) => {
      process.stdin.resume();
      process.stdin.on("error", onerror);
      process.stdin.once("readable", () => {
        process.stdin.off("error", onerror);
        const data = process.stdin.read(p.length) ?? process.stdin.read();
        if (data) {
          p.set(data);
          resolve2(data.length > 0 ? data.length : null);
        } else {
          resolve2(null);
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
      stdinReadable = stream2.Readable.toWeb(process.stdin);
    }
    return stdinReadable;
  },
  readSync(buffer) {
    return readSync2(this.rid, buffer);
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
var stdout = {
  rid: 1,
  isTerminal() {
    return tty.isatty(this.rid);
  },
  write: chain((p) => {
    return new Promise((resolve2) => {
      const result = process.stdout.write(p);
      if (!result) {
        process.stdout.once("drain", () => resolve2(p.length));
      } else {
        resolve2(p.length);
      }
    });
  }),
  get writable() {
    if (stdoutWritable == null) {
      stdoutWritable = stream2.Writable.toWeb(process.stdout);
    }
    return stdoutWritable;
  },
  writeSync(data) {
    return writeSync2(this.rid, data);
  },
  close() {
    process.stdout.destroy();
  }
};
var stderrWritable;
var stderr = {
  rid: 2,
  isTerminal() {
    return tty.isatty(this.rid);
  },
  write: chain((p) => {
    return new Promise((resolve2) => {
      const result = process.stderr.write(p);
      if (!result) {
        process.stderr.once("drain", () => resolve2(p.length));
      } else {
        resolve2(p.length);
      }
    });
  }),
  get writable() {
    if (stderrWritable == null) {
      stderrWritable = stream2.Writable.toWeb(process.stderr);
    }
    return stderrWritable;
  },
  writeSync(data) {
    return writeSync2(this.rid, data);
  },
  close() {
    process.stderr.destroy();
  }
};

// dist/esm/deno/internal/version.js
var deno = "1.40.2";
var typescript = "5.3.3";

// dist/esm/deno/stable/variables/version.js
var version = {
  deno,
  typescript,
  v8: process.versions.v8
};

// dist/esm/deno/stable/functions.js
import { isatty } from "tty";

// dist/esm/deno/stable/functions/addSignalListener.js
import ps from "process";
function denoSignalToNodeJs(signal) {
  if (signal === "SIGEMT") {
    throw new Error("SIGEMT is not supported");
  }
  return signal;
}
var addSignalListener = (signal, handler) => {
  ps.addListener(denoSignalToNodeJs(signal), handler);
};

// dist/esm/deno/stable/functions/chdir.js
import { fileURLToPath } from "url";
var chdir = function(path) {
  try {
    return process.chdir(path instanceof URL ? fileURLToPath(path) : path);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new errors_exports.NotFound(`No such file or directory (os error 2), chdir '${path}'`);
    }
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/chmod.js
import * as fs6 from "fs/promises";
var chmod2 = fs6.chmod;

// dist/esm/deno/stable/functions/chmodSync.js
import * as fs7 from "fs";
var chmodSync2 = fs7.chmodSync;

// dist/esm/deno/stable/functions/chown.js
import * as fs8 from "fs/promises";
var chown2 = async (path, uid2, gid2) => await fs8.chown(path, uid2 ?? -1, gid2 ?? -1);

// dist/esm/deno/stable/functions/chownSync.js
import * as fs9 from "fs";
var chownSync2 = (path, uid2, gid2) => fs9.chownSync(path, uid2 ?? -1, gid2 ?? -1);

// dist/esm/deno/stable/functions/close.js
import * as fs10 from "fs";
var close = fs10.closeSync;

// dist/esm/deno/stable/functions/connect.js
import { createConnection } from "net";

// dist/esm/deno/internal/Conn.js
import { Socket } from "net";
import { once } from "events";
var Conn = class extends FsFile {
  rid;
  localAddr;
  remoteAddr;
  #socket;
  constructor(rid, localAddr, remoteAddr, socket) {
    super(rid);
    this.rid = rid;
    this.localAddr = localAddr;
    this.remoteAddr = remoteAddr;
    this.#socket = socket || new Socket({ fd: rid });
  }
  [Symbol.dispose]() {
    this.close();
  }
  async closeWrite() {
    await new Promise((resolve2) => this.#socket.end(resolve2));
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
    await once(this.#socket, "readable");
    return await super.read(p);
  }
};
var TlsConn = class extends Conn {
  handshake() {
    console.warn("@deno/shim-deno: Handshake is not supported.");
    return Promise.resolve({
      alpnProtocol: null
    });
  }
};

// dist/esm/deno/stable/functions/connect.js
var connect = function connect2(options) {
  if (options.transport === "unix") {
    throw new Error("Unstable UnixConnectOptions is not implemented");
  }
  const { transport = "tcp", hostname: hostname4 = "127.0.0.1", port } = options;
  if (transport !== "tcp") {
    throw new Error("Deno.connect is only implemented for transport: tcp");
  }
  const socket = createConnection({ port, host: hostname4 });
  socket.on("error", (err) => console.error(err));
  return new Promise((resolve2) => {
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
      resolve2(new Conn(rid, localAddr, remoteAddr, socket));
    });
  });
};

// dist/esm/deno/stable/functions/connectTls.js
import { connect as tlsConnect } from "tls";

// dist/esm/deno/stable/functions/readTextFile.js
import { readFile } from "fs/promises";
var readTextFile = async (path, { signal } = {}) => {
  try {
    return await readFile(path, { encoding: "utf8", signal });
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/connectTls.js
var connectTls = async function connectTls2({ port, hostname: hostname4 = "127.0.0.1", certFile }) {
  const cert = certFile && await readTextFile(certFile);
  const socket = tlsConnect({ port, host: hostname4, cert });
  return new Promise((resolve2) => {
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
      resolve2(new TlsConn(rid, localAddr, remoteAddr, socket));
    });
  });
};

// dist/esm/deno/stable/functions/consoleSize.js
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

// dist/esm/deno/internal/consts.js
var DEFAULT_BUFFER_SIZE = 32 * 1024;

// dist/esm/deno/stable/functions/copy.js
var copy = async function copy2(src, dst, options) {
  let n = 0;
  const bufSize = options?.bufSize ?? DEFAULT_BUFFER_SIZE;
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

// dist/esm/deno/stable/functions/copyFile.js
import * as fs11 from "fs/promises";
var copyFile2 = async (src, dest) => {
  try {
    await fs11.copyFile(src, dest);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new NotFound(`File not found, copy '${src}' -> '${dest}'`);
    }
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/copyFileSync.js
import * as fs12 from "fs";
var copyFileSync2 = (src, dest) => {
  try {
    fs12.copyFileSync(src, dest);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new NotFound(`File not found, copy '${src}' -> '${dest}'`);
    }
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/open.js
import { open as _open } from "fs";
import { promisify as promisify6 } from "util";

// dist/esm/deno/internal/fs_flags.js
import { constants } from "fs";
import os3 from "os";
var { O_APPEND, O_CREAT, O_EXCL, O_RDONLY, O_RDWR, O_TRUNC, O_WRONLY } = constants;
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
    throw new BadResource("EINVAL: One of 'read', 'write', 'append' is required to open file.");
  }
  throw new BadResource("EINVAL: Invalid fs flags.");
}
function getCreationFlag(opts) {
  if (!opts.write && !opts.append) {
    if (opts.truncate || opts.create || opts.createNew) {
      throw new BadResource("EINVAL: One of 'write', 'append' is required to 'truncate', 'create' or 'createNew' file.");
    }
  }
  if (opts.append) {
    if (opts.truncate && !opts.createNew) {
      throw new BadResource("EINVAL: unexpected 'truncate': true and 'createNew': false when 'append' is true.");
    }
  }
  if (!opts.create && !opts.truncate && !opts.createNew)
    return 0;
  if (opts.create && !opts.truncate && !opts.createNew)
    return O_CREAT;
  if (!opts.create && opts.truncate && !opts.createNew) {
    if (os3.platform() === "win32") {
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
  throw new BadResource("EINVAL: Invalid fs flags.");
}
function getFsFlag(flags) {
  return getAccessFlag(flags) | getCreationFlag(flags);
}

// dist/esm/deno/stable/functions/open.js
var nodeOpen = promisify6(_open);
var open = async function open2(path, { read: read3, write: write3, append, truncate: truncate3, create: create3, createNew, mode = 438 } = {
  read: true
}) {
  const flagMode = getFsFlag({
    read: read3,
    write: write3,
    append,
    truncate: truncate3,
    create: create3,
    createNew
  });
  try {
    const fd = await nodeOpen(path, flagMode, mode);
    return new File(fd);
  } catch (err) {
    throw mapError(err);
  }
};

// dist/esm/deno/stable/functions/create.js
var create = async function create2(path) {
  return await open(path, { write: true, create: true, truncate: true });
};

// dist/esm/deno/stable/functions/openSync.js
import { openSync as nodeOpenSync } from "fs";
var openSync = function openSync2(path, { read: read3, write: write3, append, truncate: truncate3, create: create3, createNew, mode = 438 } = {
  read: true
}) {
  const flagMode = getFsFlag({
    read: read3,
    write: write3,
    append,
    truncate: truncate3,
    create: create3,
    createNew
  });
  try {
    const fd = nodeOpenSync(path, flagMode, mode);
    return new File(fd);
  } catch (err) {
    throw mapError(err);
  }
};

// dist/esm/deno/stable/functions/createSync.js
var createSync = function createSync2(path) {
  return openSync(path, {
    create: true,
    truncate: true,
    read: true,
    write: true
  });
};

// dist/esm/deno/stable/functions/cwd.js
var cwd = process.cwd;

// dist/esm/deno/stable/functions/execPath.js
import which from "which";
var execPath = () => which.sync("deno");

// dist/esm/deno/stable/functions/exit.js
var exit = function exit2(code) {
  return process.exit(code);
};

// dist/esm/deno/stable/functions/fsync.js
import { fsync as nodeFsync } from "fs";
import { promisify as promisify7 } from "util";
var fsync = function fsync2(rid) {
  return promisify7(nodeFsync)(rid);
};

// dist/esm/deno/stable/functions/fsyncSync.js
import { fsyncSync as nodeFsyncSync } from "fs";
var fsyncSync = function fsyncSync2(rid) {
  return nodeFsyncSync(rid);
};

// dist/esm/deno/stable/functions/gid.js
import ps2 from "process";
var gid = ps2.getgid ?? (() => null);

// dist/esm/deno/stable/functions/hostname.js
import * as os4 from "os";
var hostname2 = function hostname3() {
  return os4.hostname();
};

// dist/esm/deno/stable/functions/inspect.js
import * as util from "util";
var inspect2 = (value, options = {}) => util.inspect(value, options);

// dist/esm/deno/stable/functions/kill.js
import os5 from "os";
import ps3 from "process";
var kill = function(pid2, signo) {
  if (pid2 < 0 && os5.platform() === "win32") {
    throw new TypeError("Invalid pid");
  }
  ps3.kill(pid2, signo);
};

// dist/esm/deno/stable/functions/link.js
import * as fs13 from "fs/promises";
var link2 = fs13.link;

// dist/esm/deno/stable/functions/linkSync.js
import * as fs14 from "fs";
var linkSync2 = fs14.linkSync;

// dist/esm/deno/stable/functions/listen.js
import { createServer } from "net";

// dist/esm/deno/internal/Listener.js
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
      throw new BadResource("Listener not initialised");
    }
    const result = await this.#listener.next();
    if (result.done) {
      throw new BadResource("Server not listening");
    }
    return result.value;
  }
  async next() {
    let conn;
    try {
      conn = await this.accept();
    } catch (error) {
      if (error instanceof BadResource) {
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
    close(this.rid);
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

// dist/esm/deno/stable/functions/listen.js
async function* _listen(server, waitFor) {
  await waitFor;
  while (server.listening) {
    yield new Promise((resolve2) => server.once("connection", (socket) => {
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
      resolve2(new Conn(rid, localAddr, remoteAddr));
    }));
  }
}
var listen = function listen2(options) {
  if (options.transport === "unix") {
    throw new Error("Unstable UnixListenOptions is not implemented");
  }
  const { port, hostname: hostname4 = "0.0.0.0", transport = "tcp" } = options;
  if (transport !== "tcp") {
    throw new Error("Deno.listen is only implemented for transport: tcp");
  }
  const server = createServer();
  const waitFor = new Promise((resolve2) => (
    // server._handle.fd is assigned immediately on .listen()
    server.listen(port, hostname4, resolve2)
  ));
  const listener = new Listener(server._handle.fd, {
    hostname: hostname4,
    port,
    transport: "tcp"
  }, _listen(server, waitFor));
  return listener;
};

// dist/esm/deno/stable/functions/listenTls.js
import { createServer as createServer2 } from "tls";

// dist/esm/deno/stable/functions/readTextFileSync.js
import * as fs15 from "fs";
var readTextFileSync = function(path) {
  try {
    return fs15.readFileSync(path, "utf8");
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/listenTls.js
async function* _listen2(server, waitFor) {
  await waitFor;
  while (server.listening) {
    yield new Promise((resolve2) => server.once("secureConnection", (socket) => {
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
      resolve2(new TlsConn(rid, localAddr, remoteAddr));
    }));
  }
}
var listenTls = function listen3({ port, hostname: hostname4 = "0.0.0.0", transport = "tcp", certFile, keyFile }) {
  if (transport !== "tcp") {
    throw new Error("Deno.listen is only implemented for transport: tcp");
  }
  const [cert, key] = [certFile, keyFile].map((f) => f == null ? void 0 : readTextFileSync(f));
  const server = createServer2({ cert, key });
  const waitFor = new Promise((resolve2) => (
    // server._handle.fd is assigned immediately on .listen()
    server.listen(port, hostname4, resolve2)
  ));
  const listener = new Listener(server._handle.fd, {
    hostname: hostname4,
    port,
    transport: "tcp"
  }, _listen2(server, waitFor));
  return listener;
};

// dist/esm/deno/stable/functions/loadavg.js
import * as os6 from "os";
var loadavg2 = function loadavg3() {
  return os6.loadavg();
};

// dist/esm/deno/stable/functions/lstat.js
import * as fs16 from "fs/promises";
var lstat2 = async (path) => {
  try {
    return denoifyFileInfo(await fs16.lstat(path));
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/lstatSync.js
import * as fs17 from "fs";
var lstatSync2 = (path) => {
  try {
    return denoifyFileInfo(fs17.lstatSync(path));
  } catch (err) {
    throw mapError(err);
  }
};

// dist/esm/deno/stable/functions/makeTempDir.js
import { mkdtemp } from "fs/promises";
import { join as join2 } from "path";
import { tmpdir } from "os";
var makeTempDir = function makeTempDir2({ prefix = "" } = {}) {
  return mkdtemp(join2(tmpdir(), prefix || "/"));
};

// dist/esm/deno/stable/functions/makeTempDirSync.js
import { mkdtempSync } from "fs";
import { join as join3 } from "path";
import { tmpdir as tmpdir2 } from "os";
var makeTempDirSync = function makeTempDirSync2({ prefix = "" } = {}) {
  return mkdtempSync(join3(tmpdir2(), prefix || "/"));
};

// dist/esm/deno/stable/functions/makeTempFile.js
import { tmpdir as tmpdir3 } from "os";
import { join as join4 } from "path";

// dist/esm/deno/internal/random_id.js
var randomId = () => {
  const n = (Math.random() * 1048575 * 1e6).toString(16);
  return "" + n.slice(0, 6);
};

// dist/esm/deno/stable/functions/writeTextFile.js
import * as fs18 from "fs/promises";
var writeTextFile = async function writeTextFile2(path, data, { append = false, create: create3 = true, createNew = false, mode, signal } = {}) {
  const truncate3 = create3 && !append;
  const flag = getFsFlag({
    append,
    create: create3,
    createNew,
    truncate: truncate3,
    write: true
  });
  try {
    await fs18.writeFile(path, data, { flag, mode, signal });
    if (mode !== void 0)
      await fs18.chmod(path, mode);
  } catch (error) {
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/makeTempFile.js
var makeTempFile = async function makeTempFile2({ prefix = "" } = {}) {
  const name = join4(tmpdir3(), prefix, randomId());
  await writeTextFile(name, "");
  return name;
};

// dist/esm/deno/stable/functions/makeTempFileSync.js
import { tmpdir as tmpdir4 } from "os";
import { join as join5 } from "path";

// dist/esm/deno/stable/functions/writeTextFileSync.js
import * as fs19 from "fs";
var writeTextFileSync = (path, data, { append = false, create: create3 = true, mode } = {}) => {
  const flag = create3 ? append ? "a" : "w" : "r+";
  try {
    fs19.writeFileSync(path, data, { flag, mode });
    if (mode !== void 0)
      fs19.chmodSync(path, mode);
  } catch (error) {
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/makeTempFileSync.js
var makeTempFileSync = function makeTempFileSync2({ prefix = "" } = {}) {
  const name = join5(tmpdir4(), prefix, randomId());
  writeTextFileSync(name, "");
  return name;
};

// dist/esm/deno/stable/functions/memoryUsage.js
var memoryUsage = process.memoryUsage;

// dist/esm/deno/stable/functions/mkdir.js
import { mkdir as nodeMkdir } from "fs/promises";
var mkdir = async function mkdir2(path, options) {
  try {
    await nodeMkdir(path, options);
  } catch (error) {
    if (error?.code === "EEXIST") {
      throw new errors_exports.AlreadyExists(`File exists (os error 17), mkdir '${path}'`);
    }
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/mkdirSync.js
import * as fs20 from "fs";
var mkdirSync2 = (path, options) => {
  try {
    fs20.mkdirSync(path, options);
  } catch (error) {
    if (error?.code === "EEXIST") {
      throw new errors_exports.AlreadyExists(`File exists (os error 17), mkdir '${path}'`);
    }
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/osRelease.js
import { release } from "os";
var osRelease = function osRelease2() {
  return release();
};

// dist/esm/deno/stable/functions/osUptime.js
import { uptime } from "os";
var osUptime = function osUptime2() {
  return uptime();
};

// dist/esm/deno/stable/functions/readDir.js
import { opendir } from "fs/promises";
var readDir = async function* readDir2(path) {
  try {
    for await (const e of await opendir(String(path))) {
      const ent = {
        name: e.name,
        isFile: e.isFile(),
        isDirectory: e.isDirectory(),
        isSymlink: e.isSymbolicLink()
      };
      yield ent;
    }
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/readDirSync.js
import { readdirSync as nodeReadDir } from "fs";
var readDirSync = function* readDir3(path) {
  try {
    for (const e of nodeReadDir(String(path), { withFileTypes: true })) {
      const ent = {
        name: e.name,
        isFile: e.isFile(),
        isDirectory: e.isDirectory(),
        isSymlink: e.isSymbolicLink()
      };
      yield ent;
    }
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/readFile.js
import { readFile as nodeReadFile } from "fs/promises";
var readFile2 = async function readFile3(path, { signal } = {}) {
  try {
    const buf = await nodeReadFile(path, { signal });
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/readFileSync.js
import { readFileSync as nodeReadFile2 } from "fs";
var readFileSync2 = function readFileSync3(path) {
  try {
    const buf = nodeReadFile2(path);
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.length);
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/functions/readLink.js
import * as fs21 from "fs/promises";
var readLink = fs21.readlink;

// dist/esm/deno/stable/functions/readLinkSync.js
import * as fs22 from "fs";
var readLinkSync = fs22.readlinkSync;

// dist/esm/deno/stable/functions/realPath.js
import * as fs23 from "fs/promises";
var realPath = fs23.realpath;

// dist/esm/deno/stable/functions/realPathSync.js
import * as fs24 from "fs";
var realPathSync = fs24.realpathSync;

// dist/esm/deno/stable/functions/remove.js
import { rm, rmdir } from "fs/promises";
var remove = async function remove2(path, options = {}) {
  const innerOptions = options.recursive ? { recursive: true, force: true } : {};
  try {
    return await rm(path, innerOptions);
  } catch (err) {
    if (err.code === "ERR_FS_EISDIR") {
      return await rmdir(path, innerOptions);
    } else {
      throw err;
    }
  }
};

// dist/esm/deno/stable/functions/removeSignalListener.js
import ps4 from "process";
var removeSignalListener = (signal, handler) => {
  ps4.removeListener(signal, handler);
};

// dist/esm/deno/stable/functions/removeSync.js
import * as fs25 from "fs";
var removeSync = (path, options = {}) => {
  const innerOptions = options.recursive ? { recursive: true, force: true } : {};
  try {
    fs25.rmSync(path, innerOptions);
  } catch (err) {
    if (err.code === "ERR_FS_EISDIR") {
      fs25.rmdirSync(path, innerOptions);
    } else {
      throw err;
    }
  }
};

// dist/esm/deno/stable/functions/rename.js
import { rename as nodeRename } from "fs/promises";
var rename = function rename2(oldpath, newpath) {
  return nodeRename(oldpath, newpath);
};

// dist/esm/deno/stable/functions/renameSync.js
import * as fs26 from "fs";
var renameSync2 = fs26.renameSync;

// dist/esm/deno/stable/functions/resolveDns.js
import dns from "dns";
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
      return new Promise((resolve2, reject) => {
        dns.resolve(query, recordType, (err, addresses) => {
          if (err) {
            reject(err);
          } else {
            resolve2(addresses);
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

// dist/esm/deno/stable/functions/run.js
import childProcess from "child_process";
import fs27 from "fs";
import os7 from "os";
import url from "url";
import { once as once2 } from "events";
import which2 from "which";

// dist/esm/deno/internal/streams.js
var BufferStreamReader = class {
  #stream;
  #error;
  #ended = false;
  #pendingActions = [];
  constructor(stream3) {
    this.#stream = stream3;
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
    return new Promise((resolve2, reject) => {
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
          resolve2(result);
        } else {
          this.#pendingActions.push(action);
        }
      };
      action();
    });
  }
  read(p) {
    return new Promise((resolve2, reject) => {
      const action = () => {
        if (this.#error) {
          reject(this.#error);
          return;
        }
        const readBuffer = this.#stream.read(p.byteLength);
        if (readBuffer && readBuffer.byteLength > 0) {
          readBuffer.copy(p, 0, 0, readBuffer.byteLength);
          resolve2(readBuffer.byteLength);
          return;
        }
        if (this.#ended) {
          resolve2(null);
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
var StreamWriter = class {
  #stream;
  constructor(stream3) {
    this.#stream = stream3;
  }
  write(p) {
    return new Promise((resolve2, reject) => {
      this.#stream.write(p, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve2(p.byteLength);
        }
      });
    });
  }
};

// dist/esm/deno/stable/functions/run.js
var run = function run2(options) {
  const [cmd, ...args2] = options.cmd;
  if (options.cwd && !fs27.existsSync(options.cwd)) {
    throw new Error("The directory name is invalid.");
  }
  const commandName = getCmd(cmd);
  if (!which2.sync(commandName, { nothrow: true })) {
    throw new NotFound("The system cannot find the file specified.");
  }
  const process2 = childProcess.spawn(commandName, args2, {
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
        return fs27.createReadStream(null, { fd: value });
      case "out":
        return fs27.createWriteStream(null, { fd: value });
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
    return url.fileURLToPath(firstArg);
  } else {
    return firstArg;
  }
}
function getEnv(options) {
  const env2 = options.env ?? {};
  for (const name in process.env) {
    if (!Object.prototype.hasOwnProperty.call(env2, name)) {
      if (options.clearEnv) {
        if (os7.platform() === "win32") {
          env2[name] = "";
        } else {
          delete env2[name];
        }
      } else {
        env2[name] = process.env[name];
      }
    }
  }
  return env2;
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
    this.#status = once2(process2, "exit");
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
    const signal = signalName ? os7.constants.signals[signalName] : receivedCode > 128 ? receivedCode - 128 : void 0;
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
      throw new NotFound("entity not found");
    }
    this.#process.kill(signo);
  }
};
var ProcessReadStream = class _ProcessReadStream {
  #stream;
  #bufferStreamReader;
  #closed = false;
  constructor(stream3) {
    this.#stream = stream3;
    this.#bufferStreamReader = new BufferStreamReader(stream3);
  }
  static fromNullable(stream3) {
    return stream3 ? new _ProcessReadStream(stream3) : void 0;
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
  constructor(stream3) {
    this.#stream = stream3;
    this.#streamWriter = new StreamWriter(stream3);
  }
  static fromNullable(stream3) {
    return stream3 ? new _ProcessWriteStream(stream3) : void 0;
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

// dist/esm/deno/stable/functions/shutdown.js
import { Socket as Socket2 } from "net";
var shutdown = async function shutdown2(rid) {
  await new Promise((resolve2) => new Socket2({ fd: rid }).end(resolve2));
};

// dist/esm/deno/stable/functions/statSync.js
import * as fs28 from "fs";
var statSync2 = (path) => {
  try {
    return denoifyFileInfo(fs28.statSync(path));
  } catch (err) {
    throw mapError(err);
  }
};

// dist/esm/deno/stable/functions/symlink.js
import * as fs29 from "fs/promises";
var symlink2 = async (oldpath, newpath, options) => await fs29.symlink(oldpath, newpath, options?.type);

// dist/esm/deno/stable/functions/symlinkSync.js
import * as fs30 from "fs";
var symlinkSync2 = (oldpath, newpath, options) => fs30.symlinkSync(oldpath, newpath, options?.type);

// dist/esm/deno/stable/functions/test.js
import { test } from "@deno/shim-deno-test";

// dist/esm/deno/stable/functions/truncate.js
import * as fs31 from "fs/promises";
var truncate2 = async (name, len) => {
  try {
    return await fs31.truncate(name, len);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new errors_exports.NotFound(`No such file or directory (os error 2), truncate '${name}'`);
    }
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/truncateSync.js
import * as fs32 from "fs";
var truncateSync2 = (name, len) => {
  try {
    return fs32.truncateSync(name, len);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new errors_exports.NotFound(`No such file or directory (os error 2), truncate '${name}'`);
    }
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/uid.js
import ps5 from "process";
var uid = ps5.getuid ?? (() => null);

// dist/esm/deno/stable/functions/watchFs.js
import { watch } from "fs/promises";
import { resolve } from "path";

// dist/esm/deno/internal/iterutil.js
function* map2(iter, f) {
  for (const i of iter) {
    yield f(i);
  }
}
async function* mapAsync(iter, f) {
  for await (const i of iter) {
    yield f(i);
  }
}
async function* filterAsync(iter, filter) {
  for await (const i of iter) {
    if (filter(i)) {
      yield i;
    }
  }
}
async function* merge(iterables) {
  const racers = new Map(map2(map2(iterables, (iter) => iter[Symbol.asyncIterator]()), (iter) => [iter, iter.next()]));
  while (racers.size > 0) {
    const winner = await Promise.race(map2(racers.entries(), ([iter, prom]) => prom.then((result) => ({ result, iter }))));
    if (winner.result.done) {
      racers.delete(winner.iter);
    } else {
      yield await winner.result.value;
      racers.set(winner.iter, winner.iter.next());
    }
  }
}

// dist/esm/deno/stable/functions/watchFs.js
var watchFs = function watchFs2(paths, options = { recursive: true }) {
  paths = Array.isArray(paths) ? paths : [paths];
  const ac = new AbortController();
  const { signal } = ac;
  const rid = -1;
  const masterWatcher = merge(paths.map((path) => mapAsync(filterAsync(watch(path, { recursive: options?.recursive, signal }), (info) => info.filename != null), (info) => ({
    kind: "modify",
    paths: [resolve(path, info.filename)]
  }))));
  function close2() {
    ac.abort();
  }
  return Object.assign(masterWatcher, {
    rid,
    close: close2,
    [Symbol.dispose]: close2
  });
};

// dist/esm/deno/stable/functions/writeFile.js
import * as fs33 from "fs/promises";
var writeFile3 = async function writeFile4(path, data, { append = false, create: create3 = true, createNew = false, mode, signal } = {}) {
  const truncate3 = create3 && !append;
  const flag = getFsFlag({ append, create: create3, createNew, truncate: truncate3, write: true });
  try {
    await fs33.writeFile(path, data, { flag, signal });
    if (mode != null)
      await fs33.chmod(path, mode);
  } catch (error) {
    throw mapError(error);
  }
};

// dist/esm/deno/stable/functions/writeFileSync.js
import { platform as platform3 } from "os";
var writeFileSync2 = function writeFileSync3(path, data, options = {}) {
  try {
    if (options.create !== void 0) {
      const create3 = !!options.create;
      if (!create3) {
        statSync2(path);
      }
    }
    const openOptions = {
      write: true,
      create: true,
      createNew: options.createNew,
      append: !!options.append,
      truncate: !options.append
    };
    const file = openSync(path, openOptions);
    if (options.mode !== void 0 && options.mode !== null && platform3() !== "win32") {
      chmodSync2(path, options.mode);
    }
    let nwritten = 0;
    while (nwritten < data.length) {
      nwritten += file.writeSync(data.subarray(nwritten));
    }
    file.close();
  } catch (e) {
    throw mapError(e);
  }
};

// dist/esm/deno/stable/variables/args.js
var args = process.argv.slice(2);

// dist/esm/deno/stable/functions.js
var futime = async function(rid, atime, mtime) {
  try {
    await new Promise((resolve2, reject) => {
      fs34.futimes(rid, atime, mtime, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve2();
        }
      });
    });
  } catch (error) {
    throw mapError(error);
  }
};
var futimeSync = function(rid, atime, mtime) {
  try {
    fs34.futimesSync(rid, atime, mtime);
  } catch (error) {
    throw mapError(error);
  }
};
var utime = async function(path, atime, mtime) {
  try {
    await fs34.promises.utimes(path, atime, mtime);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new errors_exports.NotFound(`No such file or directory (os error 2), utime '${path}'`);
    }
    throw mapError(error);
  }
};
var utimeSync = function(path, atime, mtime) {
  try {
    fs34.utimesSync(path, atime, mtime);
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new errors_exports.NotFound(`No such file or directory (os error 2), utime '${path}'`);
    }
    throw mapError(error);
  }
};
export {
  main_exports as Deno
};
