// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const osType = (()=>{
    const { Deno: Deno1  } = globalThis;
    if (typeof Deno1?.build?.os === "string") {
        return Deno1.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function isPathSeparator(code) {
    return isPosixPathSeparator(code) || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function normalizeString(path, allowAboveRoot, separator, isPathSeparator) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code;
    for(let i = 0, len = path.length; i <= len; ++i){
        if (i < len) code = path.charCodeAt(i);
        else if (isPathSeparator(code)) break;
        else code = CHAR_FORWARD_SLASH;
        if (isPathSeparator(code)) {
            if (lastSlash === i - 1 || dots === 1) {} else if (lastSlash !== i - 1 && dots === 2) {
                if (res.length < 2 || lastSegmentLength !== 2 || res.charCodeAt(res.length - 1) !== 46 || res.charCodeAt(res.length - 2) !== 46) {
                    if (res.length > 2) {
                        const lastSlashIndex = res.lastIndexOf(separator);
                        if (lastSlashIndex === -1) {
                            res = "";
                            lastSegmentLength = 0;
                        } else {
                            res = res.slice(0, lastSlashIndex);
                            lastSegmentLength = res.length - 1 - res.lastIndexOf(separator);
                        }
                        lastSlash = i;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i;
                        dots = 0;
                        continue;
                    }
                }
                if (allowAboveRoot) {
                    if (res.length > 0) res += `${separator}..`;
                    else res = "..";
                    lastSegmentLength = 2;
                }
            } else {
                if (res.length > 0) res += separator + path.slice(lastSlash + 1, i);
                else res = path.slice(lastSlash + 1, i);
                lastSegmentLength = i - lastSlash - 1;
            }
            lastSlash = i;
            dots = 0;
        } else if (code === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep + base;
}
const WHITESPACE_ENCODINGS = {
    "\u0009": "%09",
    "\u000A": "%0A",
    "\u000B": "%0B",
    "\u000C": "%0C",
    "\u000D": "%0D",
    "\u0020": "%20"
};
function encodeWhitespace(string) {
    return string.replaceAll(/[\s]/g, (c)=>{
        return WHITESPACE_ENCODINGS[c] ?? c;
    });
}
class DenoStdInternalError extends Error {
    constructor(message){
        super(message);
        this.name = "DenoStdInternalError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new DenoStdInternalError(msg);
    }
}
const sep = "\\";
const delimiter = ";";
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path;
        const { Deno: Deno1  } = globalThis;
        if (i >= 0) {
            path = pathSegments[i];
        } else if (!resolvedDevice) {
            if (typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path = Deno1.cwd();
        } else {
            if (typeof Deno1?.env?.get !== "function" || typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno1.cwd();
            if (path === undefined || path.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path = `${resolvedDevice}\\`;
            }
        }
        assertPath(path);
        const len = path.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute = false;
        const code = path.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code)) {
                isAbsolute = true;
                if (isPathSeparator(path.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code)) {
                if (path.charCodeAt(1) === 58) {
                    device = path.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path.charCodeAt(2))) {
                            isAbsolute = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code)) {
            rootEnd = 1;
            isAbsolute = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute = false;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            isAbsolute = true;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                device = path.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        isAbsolute = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path.slice(rootEnd), !isAbsolute, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute) tail = ".";
    if (tail.length > 0 && isPathSeparator(path.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return false;
    const code = path.charCodeAt(0);
    if (isPathSeparator(code)) {
        return true;
    } else if (isWindowsDeviceRoot(code)) {
        if (len > 2 && path.charCodeAt(1) === 58) {
            if (isPathSeparator(path.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < pathsCount; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (joined === undefined) joined = firstPart = path;
            else joined += `\\${path}`;
        }
    }
    if (joined === undefined) return ".";
    let needsReplace = true;
    let slashCount = 0;
    assert(firstPart != null);
    if (isPathSeparator(firstPart.charCodeAt(0))) {
        ++slashCount;
        const firstLen = firstPart.length;
        if (firstLen > 1) {
            if (isPathSeparator(firstPart.charCodeAt(1))) {
                ++slashCount;
                if (firstLen > 2) {
                    if (isPathSeparator(firstPart.charCodeAt(2))) ++slashCount;
                    else {
                        needsReplace = false;
                    }
                }
            }
        }
    }
    if (needsReplace) {
        for(; slashCount < joined.length; ++slashCount){
            if (!isPathSeparator(joined.charCodeAt(slashCount))) break;
        }
        if (slashCount >= 2) joined = `\\${joined.slice(slashCount)}`;
    }
    return normalize(joined);
}
function relative(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    const fromOrig = resolve(from);
    const toOrig = resolve(to);
    if (fromOrig === toOrig) return "";
    from = fromOrig.toLowerCase();
    to = toOrig.toLowerCase();
    if (from === to) return "";
    let fromStart = 0;
    let fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 92) break;
    }
    for(; fromEnd - 1 > fromStart; --fromEnd){
        if (from.charCodeAt(fromEnd - 1) !== 92) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 0;
    let toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 92) break;
    }
    for(; toEnd - 1 > toStart; --toEnd){
        if (to.charCodeAt(toEnd - 1) !== 92) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 92) {
                    return toOrig.slice(toStart + i + 1);
                } else if (i === 2) {
                    return toOrig.slice(toStart + i);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 92) {
                    lastCommonSep = i;
                } else if (i === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i;
    }
    if (i !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 92) {
            if (out.length === 0) out += "..";
            else out += "\\..";
        }
    }
    if (out.length > 0) {
        return out + toOrig.slice(toStart + lastCommonSep, toEnd);
    } else {
        toStart += lastCommonSep;
        if (toOrig.charCodeAt(toStart) === 92) ++toStart;
        return toOrig.slice(toStart, toEnd);
    }
}
function toNamespacedPath(path) {
    if (typeof path !== "string") return path;
    if (path.length === 0) return "";
    const resolvedPath = resolve(path);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code = resolvedPath.charCodeAt(2);
                if (code !== 63 && code !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path;
}
function dirname(path) {
    assertPath(path);
    const len = path.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        return path;
    }
    for(let i = len - 1; i >= offset; --i){
        if (isPathSeparator(path.charCodeAt(i))) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) {
        if (rootEnd === -1) return ".";
        else end = rootEnd;
    }
    return path.slice(0, end);
}
function basename(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (path.length >= 2) {
        const drive = path.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= start; --i){
            const code = path.charCodeAt(i);
            if (isPathSeparator(code)) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= start; --i){
            if (isPathSeparator(path.charCodeAt(i))) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname(path) {
    assertPath(path);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path.length >= 2 && path.charCodeAt(1) === 58 && isWindowsDeviceRoot(path.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i = path.length - 1; i >= start; --i){
        const code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code = path.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code)) {
            rootEnd = 1;
            if (isPathSeparator(path.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code)) {
            if (path.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code)) {
        ret.root = ret.dir = path;
        return ret;
    }
    if (rootEnd > 0) ret.root = path.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= rootEnd; --i){
        code = path.charCodeAt(i);
        if (isPathSeparator(code)) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path.slice(startPart, end);
        }
    } else {
        ret.name = path.slice(startPart, startDot);
        ret.base = path.slice(startPart, end);
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
}
function toFileUrl(path) {
    if (!isAbsolute(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname != null && hostname != "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const mod = {
    sep: sep,
    delimiter: delimiter,
    resolve: resolve,
    normalize: normalize,
    isAbsolute: isAbsolute,
    join: join,
    relative: relative,
    toNamespacedPath: toNamespacedPath,
    dirname: dirname,
    basename: basename,
    extname: extname,
    format: format,
    parse: parse,
    fromFileUrl: fromFileUrl,
    toFileUrl: toFileUrl
};
const sep1 = "/";
const delimiter1 = ":";
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            const { Deno: Deno1  } = globalThis;
            if (typeof Deno1?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path = Deno1.cwd();
        }
        assertPath(path);
        if (path.length === 0) {
            continue;
        }
        resolvedPath = `${path}/${resolvedPath}`;
        resolvedAbsolute = path.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const isAbsolute = path.charCodeAt(0) === 47;
    const trailingSeparator = path.charCodeAt(path.length - 1) === 47;
    path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return `/${path}`;
    return path;
}
function isAbsolute1(path) {
    assertPath(path);
    return path.length > 0 && path.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i = 0, len = paths.length; i < len; ++i){
        const path = paths[i];
        assertPath(path);
        if (path.length > 0) {
            if (!joined) joined = path;
            else joined += `/${path}`;
        }
    }
    if (!joined) return ".";
    return normalize1(joined);
}
function relative1(from, to) {
    assertPath(from);
    assertPath(to);
    if (from === to) return "";
    from = resolve1(from);
    to = resolve1(to);
    if (from === to) return "";
    let fromStart = 1;
    const fromEnd = from.length;
    for(; fromStart < fromEnd; ++fromStart){
        if (from.charCodeAt(fromStart) !== 47) break;
    }
    const fromLen = fromEnd - fromStart;
    let toStart = 1;
    const toEnd = to.length;
    for(; toStart < toEnd; ++toStart){
        if (to.charCodeAt(toStart) !== 47) break;
    }
    const toLen = toEnd - toStart;
    const length = fromLen < toLen ? fromLen : toLen;
    let lastCommonSep = -1;
    let i = 0;
    for(; i <= length; ++i){
        if (i === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i) === 47) {
                    return to.slice(toStart + i + 1);
                } else if (i === 0) {
                    return to.slice(toStart + i);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i) === 47) {
                    lastCommonSep = i;
                } else if (i === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i);
        const toCode = to.charCodeAt(toStart + i);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i;
    }
    let out = "";
    for(i = fromStart + lastCommonSep + 1; i <= fromEnd; ++i){
        if (i === fromEnd || from.charCodeAt(i) === 47) {
            if (out.length === 0) out += "..";
            else out += "/..";
        }
    }
    if (out.length > 0) return out + to.slice(toStart + lastCommonSep);
    else {
        toStart += lastCommonSep;
        if (to.charCodeAt(toStart) === 47) ++toStart;
        return to.slice(toStart);
    }
}
function toNamespacedPath1(path) {
    return path;
}
function dirname1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
    const hasRoot = path.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i = path.length - 1; i >= 1; --i){
        if (path.charCodeAt(i) === 47) {
            if (!matchedSlash) {
                end = i;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path.slice(0, end);
}
function basename1(path, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i;
    if (ext !== undefined && ext.length > 0 && ext.length <= path.length) {
        if (ext.length === path.length && ext === path) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i = path.length - 1; i >= 0; --i){
            const code = path.charCodeAt(i);
            if (code === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i + 1;
                }
                if (extIdx >= 0) {
                    if (code === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path.length;
        return path.slice(start, end);
    } else {
        for(i = path.length - 1; i >= 0; --i){
            if (path.charCodeAt(i) === 47) {
                if (!matchedSlash) {
                    start = i + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i + 1;
            }
        }
        if (end === -1) return "";
        return path.slice(start, end);
    }
}
function extname1(path) {
    assertPath(path);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i = path.length - 1; i >= 0; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse1(path) {
    assertPath(path);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path.length === 0) return ret;
    const isAbsolute = path.charCodeAt(0) === 47;
    let start;
    if (isAbsolute) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i = path.length - 1;
    let preDotState = 0;
    for(; i >= start; --i){
        const code = path.charCodeAt(i);
        if (code === 47) {
            if (!matchedSlash) {
                startPart = i + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i + 1;
        }
        if (code === 46) {
            if (startDot === -1) startDot = i;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute) {
                ret.base = ret.name = path.slice(1, end);
            } else {
                ret.base = ret.name = path.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute) {
            ret.name = path.slice(1, startDot);
            ret.base = path.slice(1, end);
        } else {
            ret.name = path.slice(startPart, startDot);
            ret.base = path.slice(startPart, end);
        }
        ret.ext = path.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path.slice(0, startPart - 1);
    else if (isAbsolute) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path) {
    if (!isAbsolute1(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const mod1 = {
    sep: sep1,
    delimiter: delimiter1,
    resolve: resolve1,
    normalize: normalize1,
    isAbsolute: isAbsolute1,
    join: join1,
    relative: relative1,
    toNamespacedPath: toNamespacedPath1,
    dirname: dirname1,
    basename: basename1,
    extname: extname1,
    format: format1,
    parse: parse1,
    fromFileUrl: fromFileUrl1,
    toFileUrl: toFileUrl1
};
const path = isWindows ? mod : mod1;
const { join: join2 , normalize: normalize2  } = path;
const path1 = isWindows ? mod : mod1;
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join3 , normalize: normalize3 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2  } = path1;
const { Deno: Deno1  } = globalThis;
typeof Deno1?.noColor === "boolean" ? Deno1.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
].join("|"), "g");
const { hasOwn  } = Object;
class TextLineStream extends TransformStream {
    #allowCR;
    #buf = "";
    constructor(options){
        super({
            transform: (chunk, controller)=>this.#handle(chunk, controller),
            flush: (controller)=>this.#handle("\r\n", controller)
        });
        this.#allowCR = options?.allowCR ?? false;
    }
    #handle(chunk, controller) {
        chunk = this.#buf + chunk;
        for(;;){
            const lfIndex = chunk.indexOf("\n");
            if (this.#allowCR) {
                const crIndex = chunk.indexOf("\r");
                if (crIndex !== -1 && crIndex !== chunk.length - 1 && (lfIndex === -1 || lfIndex - 1 > crIndex)) {
                    controller.enqueue(chunk.slice(0, crIndex));
                    chunk = chunk.slice(crIndex + 1);
                    continue;
                }
            }
            if (lfIndex !== -1) {
                let crOrLfIndex = lfIndex;
                if (chunk[lfIndex - 1] === "\r") {
                    crOrLfIndex--;
                }
                controller.enqueue(chunk.slice(0, crOrLfIndex));
                chunk = chunk.slice(lfIndex + 1);
                continue;
            }
            break;
        }
        this.#buf = chunk;
    }
}
const re = [];
const src = [];
let R = 0;
const NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = "0|[1-9]\\d*";
const NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
const MAINVERSION = R++;
const nid = src[NUMERICIDENTIFIER];
src[MAINVERSION] = `(${nid})\\.(${nid})\\.(${nid})`;
const PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = "(?:" + src[NUMERICIDENTIFIER] + "|" + src[NONNUMERICIDENTIFIER] + ")";
const PRERELEASE = R++;
src[PRERELEASE] = "(?:-(" + src[PRERELEASEIDENTIFIER] + "(?:\\." + src[PRERELEASEIDENTIFIER] + ")*))";
const BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = "[0-9A-Za-z-]+";
const BUILD = R++;
src[BUILD] = "(?:\\+(" + src[BUILDIDENTIFIER] + "(?:\\." + src[BUILDIDENTIFIER] + ")*))";
const FULL = R++;
const FULLPLAIN = "v?" + src[MAINVERSION] + src[PRERELEASE] + "?" + src[BUILD] + "?";
src[FULL] = "^" + FULLPLAIN + "$";
const GTLT = R++;
src[GTLT] = "((?:<|>)?=?)";
const XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + "|x|X|\\*";
const XRANGEPLAIN = R++;
src[XRANGEPLAIN] = "[v=\\s]*(" + src[XRANGEIDENTIFIER] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIER] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIER] + ")" + "(?:" + src[PRERELEASE] + ")?" + src[BUILD] + "?" + ")?)?";
const XRANGE = R++;
src[XRANGE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAIN] + "$";
const LONETILDE = R++;
src[LONETILDE] = "(?:~>?)";
const TILDE = R++;
src[TILDE] = "^" + src[LONETILDE] + src[XRANGEPLAIN] + "$";
const LONECARET = R++;
src[LONECARET] = "(?:\\^)";
const CARET = R++;
src[CARET] = "^" + src[LONECARET] + src[XRANGEPLAIN] + "$";
const COMPARATOR = R++;
src[COMPARATOR] = "^" + src[GTLT] + "\\s*(" + FULLPLAIN + ")$|^$";
const HYPHENRANGE = R++;
src[HYPHENRANGE] = "^\\s*(" + src[XRANGEPLAIN] + ")" + "\\s+-\\s+" + "(" + src[XRANGEPLAIN] + ")" + "\\s*$";
const STAR = R++;
src[STAR] = "(<|>)?=?\\s*\\*";
for(let i = 0; i < R; i++){
    if (!re[i]) {
        re[i] = new RegExp(src[i]);
    }
}
const noColor = globalThis.Deno?.noColor ?? true;
let enabled = !noColor;
function setColorEnabled(value) {
    if (noColor) {
        return;
    }
    enabled = value;
}
function getColorEnabled() {
    return enabled;
}
function code(open, close) {
    return {
        open: `\x1b[${open.join(";")}m`,
        close: `\x1b[${close}m`,
        regexp: new RegExp(`\\x1b\\[${close}m`, "g")
    };
}
function run(str, code) {
    return enabled ? `${code.open}${str.replace(code.regexp, code.open)}${code.close}` : str;
}
function reset(str) {
    return run(str, code([
        0
    ], 0));
}
function bold(str) {
    return run(str, code([
        1
    ], 22));
}
function dim(str) {
    return run(str, code([
        2
    ], 22));
}
function italic(str) {
    return run(str, code([
        3
    ], 23));
}
function underline(str) {
    return run(str, code([
        4
    ], 24));
}
function inverse(str) {
    return run(str, code([
        7
    ], 27));
}
function hidden(str) {
    return run(str, code([
        8
    ], 28));
}
function strikethrough(str) {
    return run(str, code([
        9
    ], 29));
}
function black(str) {
    return run(str, code([
        30
    ], 39));
}
function red(str) {
    return run(str, code([
        31
    ], 39));
}
function green(str) {
    return run(str, code([
        32
    ], 39));
}
function yellow(str) {
    return run(str, code([
        33
    ], 39));
}
function blue(str) {
    return run(str, code([
        34
    ], 39));
}
function magenta(str) {
    return run(str, code([
        35
    ], 39));
}
function cyan(str) {
    return run(str, code([
        36
    ], 39));
}
function white(str) {
    return run(str, code([
        37
    ], 39));
}
function gray(str) {
    return brightBlack(str);
}
function brightBlack(str) {
    return run(str, code([
        90
    ], 39));
}
function brightRed(str) {
    return run(str, code([
        91
    ], 39));
}
function brightGreen(str) {
    return run(str, code([
        92
    ], 39));
}
function brightYellow(str) {
    return run(str, code([
        93
    ], 39));
}
function brightBlue(str) {
    return run(str, code([
        94
    ], 39));
}
function brightMagenta(str) {
    return run(str, code([
        95
    ], 39));
}
function brightCyan(str) {
    return run(str, code([
        96
    ], 39));
}
function brightWhite(str) {
    return run(str, code([
        97
    ], 39));
}
function bgBlack(str) {
    return run(str, code([
        40
    ], 49));
}
function bgRed(str) {
    return run(str, code([
        41
    ], 49));
}
function bgGreen(str) {
    return run(str, code([
        42
    ], 49));
}
function bgYellow(str) {
    return run(str, code([
        43
    ], 49));
}
function bgBlue(str) {
    return run(str, code([
        44
    ], 49));
}
function bgMagenta(str) {
    return run(str, code([
        45
    ], 49));
}
function bgCyan(str) {
    return run(str, code([
        46
    ], 49));
}
function bgWhite(str) {
    return run(str, code([
        47
    ], 49));
}
function bgBrightBlack(str) {
    return run(str, code([
        100
    ], 49));
}
function bgBrightRed(str) {
    return run(str, code([
        101
    ], 49));
}
function bgBrightGreen(str) {
    return run(str, code([
        102
    ], 49));
}
function bgBrightYellow(str) {
    return run(str, code([
        103
    ], 49));
}
function bgBrightBlue(str) {
    return run(str, code([
        104
    ], 49));
}
function bgBrightMagenta(str) {
    return run(str, code([
        105
    ], 49));
}
function bgBrightCyan(str) {
    return run(str, code([
        106
    ], 49));
}
function bgBrightWhite(str) {
    return run(str, code([
        107
    ], 49));
}
function clampAndTruncate(n, max = 255, min = 0) {
    return Math.trunc(Math.max(Math.min(n, max), min));
}
function rgb8(str, color) {
    return run(str, code([
        38,
        5,
        clampAndTruncate(color)
    ], 39));
}
function bgRgb8(str, color) {
    return run(str, code([
        48,
        5,
        clampAndTruncate(color)
    ], 49));
}
function rgb24(str, color) {
    if (typeof color === "number") {
        return run(str, code([
            38,
            2,
            color >> 16 & 0xff,
            color >> 8 & 0xff,
            color & 0xff
        ], 39));
    }
    return run(str, code([
        38,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b)
    ], 39));
}
function bgRgb24(str, color) {
    if (typeof color === "number") {
        return run(str, code([
            48,
            2,
            color >> 16 & 0xff,
            color >> 8 & 0xff,
            color & 0xff
        ], 49));
    }
    return run(str, code([
        48,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b)
    ], 49));
}
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
].join("|"), "g");
function stripColor(string) {
    return string.replace(ANSI_PATTERN, "");
}
const mod2 = {
    setColorEnabled: setColorEnabled,
    getColorEnabled: getColorEnabled,
    reset: reset,
    bold: bold,
    dim: dim,
    italic: italic,
    underline: underline,
    inverse: inverse,
    hidden: hidden,
    strikethrough: strikethrough,
    black: black,
    red: red,
    green: green,
    yellow: yellow,
    blue: blue,
    magenta: magenta,
    cyan: cyan,
    white: white,
    gray: gray,
    brightBlack: brightBlack,
    brightRed: brightRed,
    brightGreen: brightGreen,
    brightYellow: brightYellow,
    brightBlue: brightBlue,
    brightMagenta: brightMagenta,
    brightCyan: brightCyan,
    brightWhite: brightWhite,
    bgBlack: bgBlack,
    bgRed: bgRed,
    bgGreen: bgGreen,
    bgYellow: bgYellow,
    bgBlue: bgBlue,
    bgMagenta: bgMagenta,
    bgCyan: bgCyan,
    bgWhite: bgWhite,
    bgBrightBlack: bgBrightBlack,
    bgBrightRed: bgBrightRed,
    bgBrightGreen: bgBrightGreen,
    bgBrightYellow: bgBrightYellow,
    bgBrightBlue: bgBrightBlue,
    bgBrightMagenta: bgBrightMagenta,
    bgBrightCyan: bgBrightCyan,
    bgBrightWhite: bgBrightWhite,
    rgb8: rgb8,
    bgRgb8: bgRgb8,
    rgb24: rgb24,
    bgRgb24: bgRgb24,
    stripColor: stripColor
};
const encoder = new TextEncoder();
function encode(input) {
    return encoder.encode(input);
}
const __default = [
    [
        0x0300,
        0x036f
    ],
    [
        0x0483,
        0x0486
    ],
    [
        0x0488,
        0x0489
    ],
    [
        0x0591,
        0x05bd
    ],
    [
        0x05bf,
        0x05bf
    ],
    [
        0x05c1,
        0x05c2
    ],
    [
        0x05c4,
        0x05c5
    ],
    [
        0x05c7,
        0x05c7
    ],
    [
        0x0600,
        0x0603
    ],
    [
        0x0610,
        0x0615
    ],
    [
        0x064b,
        0x065e
    ],
    [
        0x0670,
        0x0670
    ],
    [
        0x06d6,
        0x06e4
    ],
    [
        0x06e7,
        0x06e8
    ],
    [
        0x06ea,
        0x06ed
    ],
    [
        0x070f,
        0x070f
    ],
    [
        0x0711,
        0x0711
    ],
    [
        0x0730,
        0x074a
    ],
    [
        0x07a6,
        0x07b0
    ],
    [
        0x07eb,
        0x07f3
    ],
    [
        0x0901,
        0x0902
    ],
    [
        0x093c,
        0x093c
    ],
    [
        0x0941,
        0x0948
    ],
    [
        0x094d,
        0x094d
    ],
    [
        0x0951,
        0x0954
    ],
    [
        0x0962,
        0x0963
    ],
    [
        0x0981,
        0x0981
    ],
    [
        0x09bc,
        0x09bc
    ],
    [
        0x09c1,
        0x09c4
    ],
    [
        0x09cd,
        0x09cd
    ],
    [
        0x09e2,
        0x09e3
    ],
    [
        0x0a01,
        0x0a02
    ],
    [
        0x0a3c,
        0x0a3c
    ],
    [
        0x0a41,
        0x0a42
    ],
    [
        0x0a47,
        0x0a48
    ],
    [
        0x0a4b,
        0x0a4d
    ],
    [
        0x0a70,
        0x0a71
    ],
    [
        0x0a81,
        0x0a82
    ],
    [
        0x0abc,
        0x0abc
    ],
    [
        0x0ac1,
        0x0ac5
    ],
    [
        0x0ac7,
        0x0ac8
    ],
    [
        0x0acd,
        0x0acd
    ],
    [
        0x0ae2,
        0x0ae3
    ],
    [
        0x0b01,
        0x0b01
    ],
    [
        0x0b3c,
        0x0b3c
    ],
    [
        0x0b3f,
        0x0b3f
    ],
    [
        0x0b41,
        0x0b43
    ],
    [
        0x0b4d,
        0x0b4d
    ],
    [
        0x0b56,
        0x0b56
    ],
    [
        0x0b82,
        0x0b82
    ],
    [
        0x0bc0,
        0x0bc0
    ],
    [
        0x0bcd,
        0x0bcd
    ],
    [
        0x0c3e,
        0x0c40
    ],
    [
        0x0c46,
        0x0c48
    ],
    [
        0x0c4a,
        0x0c4d
    ],
    [
        0x0c55,
        0x0c56
    ],
    [
        0x0cbc,
        0x0cbc
    ],
    [
        0x0cbf,
        0x0cbf
    ],
    [
        0x0cc6,
        0x0cc6
    ],
    [
        0x0ccc,
        0x0ccd
    ],
    [
        0x0ce2,
        0x0ce3
    ],
    [
        0x0d41,
        0x0d43
    ],
    [
        0x0d4d,
        0x0d4d
    ],
    [
        0x0dca,
        0x0dca
    ],
    [
        0x0dd2,
        0x0dd4
    ],
    [
        0x0dd6,
        0x0dd6
    ],
    [
        0x0e31,
        0x0e31
    ],
    [
        0x0e34,
        0x0e3a
    ],
    [
        0x0e47,
        0x0e4e
    ],
    [
        0x0eb1,
        0x0eb1
    ],
    [
        0x0eb4,
        0x0eb9
    ],
    [
        0x0ebb,
        0x0ebc
    ],
    [
        0x0ec8,
        0x0ecd
    ],
    [
        0x0f18,
        0x0f19
    ],
    [
        0x0f35,
        0x0f35
    ],
    [
        0x0f37,
        0x0f37
    ],
    [
        0x0f39,
        0x0f39
    ],
    [
        0x0f71,
        0x0f7e
    ],
    [
        0x0f80,
        0x0f84
    ],
    [
        0x0f86,
        0x0f87
    ],
    [
        0x0f90,
        0x0f97
    ],
    [
        0x0f99,
        0x0fbc
    ],
    [
        0x0fc6,
        0x0fc6
    ],
    [
        0x102d,
        0x1030
    ],
    [
        0x1032,
        0x1032
    ],
    [
        0x1036,
        0x1037
    ],
    [
        0x1039,
        0x1039
    ],
    [
        0x1058,
        0x1059
    ],
    [
        0x1160,
        0x11ff
    ],
    [
        0x135f,
        0x135f
    ],
    [
        0x1712,
        0x1714
    ],
    [
        0x1732,
        0x1734
    ],
    [
        0x1752,
        0x1753
    ],
    [
        0x1772,
        0x1773
    ],
    [
        0x17b4,
        0x17b5
    ],
    [
        0x17b7,
        0x17bd
    ],
    [
        0x17c6,
        0x17c6
    ],
    [
        0x17c9,
        0x17d3
    ],
    [
        0x17dd,
        0x17dd
    ],
    [
        0x180b,
        0x180d
    ],
    [
        0x18a9,
        0x18a9
    ],
    [
        0x1920,
        0x1922
    ],
    [
        0x1927,
        0x1928
    ],
    [
        0x1932,
        0x1932
    ],
    [
        0x1939,
        0x193b
    ],
    [
        0x1a17,
        0x1a18
    ],
    [
        0x1b00,
        0x1b03
    ],
    [
        0x1b34,
        0x1b34
    ],
    [
        0x1b36,
        0x1b3a
    ],
    [
        0x1b3c,
        0x1b3c
    ],
    [
        0x1b42,
        0x1b42
    ],
    [
        0x1b6b,
        0x1b73
    ],
    [
        0x1dc0,
        0x1dca
    ],
    [
        0x1dfe,
        0x1dff
    ],
    [
        0x200b,
        0x200f
    ],
    [
        0x202a,
        0x202e
    ],
    [
        0x2060,
        0x2063
    ],
    [
        0x206a,
        0x206f
    ],
    [
        0x20d0,
        0x20ef
    ],
    [
        0x302a,
        0x302f
    ],
    [
        0x3099,
        0x309a
    ],
    [
        0xa806,
        0xa806
    ],
    [
        0xa80b,
        0xa80b
    ],
    [
        0xa825,
        0xa826
    ],
    [
        0xfb1e,
        0xfb1e
    ],
    [
        0xfe00,
        0xfe0f
    ],
    [
        0xfe20,
        0xfe23
    ],
    [
        0xfeff,
        0xfeff
    ],
    [
        0xfff9,
        0xfffb
    ],
    [
        0x10a01,
        0x10a03
    ],
    [
        0x10a05,
        0x10a06
    ],
    [
        0x10a0c,
        0x10a0f
    ],
    [
        0x10a38,
        0x10a3a
    ],
    [
        0x10a3f,
        0x10a3f
    ],
    [
        0x1d167,
        0x1d169
    ],
    [
        0x1d173,
        0x1d182
    ],
    [
        0x1d185,
        0x1d18b
    ],
    [
        0x1d1aa,
        0x1d1ad
    ],
    [
        0x1d242,
        0x1d244
    ],
    [
        0xe0001,
        0xe0001
    ],
    [
        0xe0020,
        0xe007f
    ],
    [
        0xe0100,
        0xe01ef
    ]
];
function wcswidth(str, { nul =0 , control =0  } = {}) {
    const opts = {
        nul,
        control
    };
    if (typeof str !== "string") return wcwidth(str, opts);
    let s = 0;
    for(let i = 0; i < str.length; i++){
        const n = wcwidth(str.charCodeAt(i), opts);
        if (n < 0) return -1;
        s += n;
    }
    return s;
}
function wcwidth(ucs, { nul =0 , control =0  } = {}) {
    if (ucs === 0) return nul;
    if (ucs < 32 || ucs >= 0x7f && ucs < 0xa0) return control;
    if (bisearch(ucs)) return 0;
    return 1 + (ucs >= 0x1100 && (ucs <= 0x115f || ucs == 0x2329 || ucs == 0x232a || ucs >= 0x2e80 && ucs <= 0xa4cf && ucs != 0x303f || ucs >= 0xac00 && ucs <= 0xd7a3 || ucs >= 0xf900 && ucs <= 0xfaff || ucs >= 0xfe10 && ucs <= 0xfe19 || ucs >= 0xfe30 && ucs <= 0xfe6f || ucs >= 0xff00 && ucs <= 0xff60 || ucs >= 0xffe0 && ucs <= 0xffe6 || ucs >= 0x20000 && ucs <= 0x2fffd || ucs >= 0x30000 && ucs <= 0x3fffd) ? 1 : 0);
}
function bisearch(ucs) {
    let min = 0;
    let max = __default.length - 1;
    let mid;
    if (ucs < __default[0][0] || ucs > __default[max][1]) return false;
    while(max >= min){
        mid = Math.floor((min + max) / 2);
        if (ucs > __default[mid][1]) min = mid + 1;
        else if (ucs < __default[mid][0]) max = mid - 1;
        else return true;
    }
    return false;
}
function ansiRegex({ onlyFirst =false  } = {}) {
    const pattern = [
        "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
        "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))"
    ].join("|");
    return new RegExp(pattern, onlyFirst ? undefined : "g");
}
async function isInteractiveAsync(stream) {
    if (await Deno.permissions.query({
        name: "env"
    })) {
        return Deno.isatty(stream.rid) && Deno.env.get("TERM") !== "dumb" && !Deno.env.get("CI");
    }
    return Deno.isatty(stream.rid);
}
function isInteractive(stream) {
    return Deno.isatty(stream.rid);
}
const mac = (await Deno.permissions.query({
    name: "env"
})).state === "granted" ? Deno.env.get("TERM_PROGRAM") === "Apple_Terminal" : false;
async function write(str, writer) {
    await writer.write(encode(str));
}
function writeSync(str, writer) {
    writer.writeSync(encode(str));
}
function stripAnsi(dirty) {
    return dirty.replace(ansiRegex(), "");
}
const ESC = "\u001B[";
const SAVE = mac ? "\u001B7" : ESC + "s";
const RESTORE = mac ? "\u001B8" : ESC + "u";
const POSITION = "6n";
const HIDE = "?25l";
const SHOW = "?25h";
const SCROLL_UP = "T";
const SCROLL_DOWN = "S";
const UP = "A";
const DOWN = "B";
const RIGHT = "C";
const LEFT = "D";
const CLEAR_RIGHT = "0K";
const CLEAR_LEFT = "1K";
const CLEAR_LINE = "2K";
const CLEAR_DOWN = "0J";
const CLEAR_UP = "1J";
const CLEAR_SCREEN = "2J";
const CLEAR = "\u001Bc";
const NEXT_LINE = "1E";
const PREV_LINE = "1F";
const COLUMN = "1G";
const HOME = "H";
async function restore(writer = Deno.stdout) {
    await write(RESTORE, writer);
}
async function cursor(action, writer = Deno.stdout) {
    await write(ESC + action, writer);
}
async function position(writer = Deno.stdout) {
    await cursor(POSITION, writer);
}
async function hideCursor(writer = Deno.stdout) {
    await cursor(HIDE, writer);
}
async function showCursor(writer = Deno.stdout) {
    await cursor(SHOW, writer);
}
async function scrollUp(writer = Deno.stdout) {
    await cursor(SCROLL_UP, writer);
}
async function scrollDown(writer = Deno.stdout) {
    await cursor(SCROLL_DOWN, writer);
}
async function clearUp(writer = Deno.stdout) {
    await cursor(CLEAR_UP, writer);
}
async function clearDown(writer = Deno.stdout) {
    await cursor(CLEAR_DOWN, writer);
}
async function clearLeft(writer = Deno.stdout) {
    await cursor(CLEAR_LEFT, writer);
}
async function clearRight(writer = Deno.stdout) {
    await cursor(CLEAR_RIGHT, writer);
}
async function clearLine(writer = Deno.stdout) {
    await cursor(CLEAR_LINE, writer);
}
async function clearScreen(writer = Deno.stdout) {
    await cursor(CLEAR_SCREEN, writer);
}
async function nextLine(writer = Deno.stdout) {
    await cursor(NEXT_LINE, writer);
}
async function prevLine(writer = Deno.stdout) {
    await cursor(PREV_LINE, writer);
}
async function goHome(writer = Deno.stdout) {
    await cursor(HOME, writer);
}
async function goUp(y = 1, writer = Deno.stdout) {
    await cursor(y + UP, writer);
}
async function goDown(y = 1, writer = Deno.stdout) {
    await cursor(y + DOWN, writer);
}
async function goLeft(x = 1, writer = Deno.stdout) {
    await cursor(x + LEFT, writer);
}
async function goRight(x = 1, writer = Deno.stdout) {
    await cursor(x + RIGHT, writer);
}
async function goTo(x, y, writer = Deno.stdout) {
    await write(ESC + y + ";" + x + HOME, writer);
}
function restoreSync(writer = Deno.stdout) {
    writeSync(RESTORE, writer);
}
function cursorSync(action, writer = Deno.stdout) {
    writeSync(ESC + action, writer);
}
function positionSync(writer = Deno.stdout) {
    cursorSync(POSITION, writer);
}
function hideCursorSync(writer = Deno.stdout) {
    cursorSync(HIDE, writer);
}
function showCursorSync(writer = Deno.stdout) {
    cursorSync(SHOW, writer);
}
function scrollUpSync(writer = Deno.stdout) {
    cursorSync(SCROLL_UP, writer);
}
function scrollDownSync(writer = Deno.stdout) {
    cursorSync(SCROLL_DOWN, writer);
}
function clearUpSync(writer = Deno.stdout) {
    cursorSync(CLEAR_UP, writer);
}
function clearDownSync(writer = Deno.stdout) {
    cursorSync(CLEAR_DOWN, writer);
}
function clearLeftSync(writer = Deno.stdout) {
    cursorSync(CLEAR_LEFT, writer);
}
function clearRightSync(writer = Deno.stdout) {
    cursorSync(CLEAR_RIGHT, writer);
}
function clearLineSync(writer = Deno.stdout) {
    cursorSync(CLEAR_LINE, writer);
}
function clearScreenSync(writer = Deno.stdout) {
    cursorSync(CLEAR_SCREEN, writer);
}
function nextLineSync(writer = Deno.stdout) {
    cursorSync(NEXT_LINE, writer);
}
function prevLineSync(writer = Deno.stdout) {
    cursorSync(PREV_LINE, writer);
}
function goHomeSync(writer = Deno.stdout) {
    cursorSync(HOME, writer);
}
function goUpSync(y = 1, writer = Deno.stdout) {
    cursorSync(y + UP, writer);
}
function goDownSync(y = 1, writer = Deno.stdout) {
    cursorSync(y + DOWN, writer);
}
function goLeftSync(x = 1, writer = Deno.stdout) {
    cursorSync(x + LEFT, writer);
}
function goRightSync(x = 1, writer = Deno.stdout) {
    cursorSync(`${x}${RIGHT}`, writer);
}
function goToSync(x, y, writer = Deno.stdout) {
    writeSync(ESC + y + ";" + x + HOME, writer);
}
const mod3 = await async function() {
    return {
        ESC: ESC,
        SAVE: SAVE,
        RESTORE: RESTORE,
        POSITION: POSITION,
        HIDE: HIDE,
        SHOW: SHOW,
        SCROLL_UP: SCROLL_UP,
        SCROLL_DOWN: SCROLL_DOWN,
        UP: UP,
        DOWN: DOWN,
        RIGHT: RIGHT,
        LEFT: LEFT,
        CLEAR_RIGHT: CLEAR_RIGHT,
        CLEAR_LEFT: CLEAR_LEFT,
        CLEAR_LINE: CLEAR_LINE,
        CLEAR_DOWN: CLEAR_DOWN,
        CLEAR_UP: CLEAR_UP,
        CLEAR_SCREEN: CLEAR_SCREEN,
        CLEAR: CLEAR,
        NEXT_LINE: NEXT_LINE,
        PREV_LINE: PREV_LINE,
        COLUMN: COLUMN,
        HOME: HOME,
        write,
        restore,
        cursor,
        position,
        hideCursor,
        showCursor,
        scrollUp,
        scrollDown,
        clearUp,
        clearDown,
        clearLeft,
        clearRight,
        clearLine,
        clearScreen,
        nextLine,
        prevLine,
        goHome,
        goUp,
        goDown,
        goLeft,
        goRight,
        goTo,
        writeSync,
        restoreSync,
        cursorSync,
        positionSync,
        hideCursorSync,
        showCursorSync,
        scrollUpSync,
        scrollDownSync,
        clearUpSync,
        clearDownSync,
        clearLeftSync,
        clearRightSync,
        clearLineSync,
        clearScreenSync,
        nextLineSync,
        prevLineSync,
        goHomeSync,
        goUpSync,
        goDownSync,
        goLeftSync,
        goRightSync,
        goToSync,
        wcswidth,
        ansiRegex,
        stripAnsi,
        isInteractiveAsync,
        isInteractive
    };
}();
const __default1 = {
    dots: {
        interval: 80,
        frames: [
            "⠋",
            "⠙",
            "⠹",
            "⠸",
            "⠼",
            "⠴",
            "⠦",
            "⠧",
            "⠇",
            "⠏"
        ]
    },
    dots2: {
        interval: 80,
        frames: [
            "⣾",
            "⣽",
            "⣻",
            "⢿",
            "⡿",
            "⣟",
            "⣯",
            "⣷"
        ]
    },
    dots3: {
        interval: 80,
        frames: [
            "⠋",
            "⠙",
            "⠚",
            "⠞",
            "⠖",
            "⠦",
            "⠴",
            "⠲",
            "⠳",
            "⠓"
        ]
    },
    dots4: {
        interval: 80,
        frames: [
            "⠄",
            "⠆",
            "⠇",
            "⠋",
            "⠙",
            "⠸",
            "⠰",
            "⠠",
            "⠰",
            "⠸",
            "⠙",
            "⠋",
            "⠇",
            "⠆"
        ]
    },
    dots5: {
        interval: 80,
        frames: [
            "⠋",
            "⠙",
            "⠚",
            "⠒",
            "⠂",
            "⠂",
            "⠒",
            "⠲",
            "⠴",
            "⠦",
            "⠖",
            "⠒",
            "⠐",
            "⠐",
            "⠒",
            "⠓",
            "⠋"
        ]
    },
    dots6: {
        interval: 80,
        frames: [
            "⠁",
            "⠉",
            "⠙",
            "⠚",
            "⠒",
            "⠂",
            "⠂",
            "⠒",
            "⠲",
            "⠴",
            "⠤",
            "⠄",
            "⠄",
            "⠤",
            "⠴",
            "⠲",
            "⠒",
            "⠂",
            "⠂",
            "⠒",
            "⠚",
            "⠙",
            "⠉",
            "⠁"
        ]
    },
    dots7: {
        interval: 80,
        frames: [
            "⠈",
            "⠉",
            "⠋",
            "⠓",
            "⠒",
            "⠐",
            "⠐",
            "⠒",
            "⠖",
            "⠦",
            "⠤",
            "⠠",
            "⠠",
            "⠤",
            "⠦",
            "⠖",
            "⠒",
            "⠐",
            "⠐",
            "⠒",
            "⠓",
            "⠋",
            "⠉",
            "⠈"
        ]
    },
    dots8: {
        interval: 80,
        frames: [
            "⠁",
            "⠁",
            "⠉",
            "⠙",
            "⠚",
            "⠒",
            "⠂",
            "⠂",
            "⠒",
            "⠲",
            "⠴",
            "⠤",
            "⠄",
            "⠄",
            "⠤",
            "⠠",
            "⠠",
            "⠤",
            "⠦",
            "⠖",
            "⠒",
            "⠐",
            "⠐",
            "⠒",
            "⠓",
            "⠋",
            "⠉",
            "⠈",
            "⠈"
        ]
    },
    dots9: {
        interval: 80,
        frames: [
            "⢹",
            "⢺",
            "⢼",
            "⣸",
            "⣇",
            "⡧",
            "⡗",
            "⡏"
        ]
    },
    dots10: {
        interval: 80,
        frames: [
            "⢄",
            "⢂",
            "⢁",
            "⡁",
            "⡈",
            "⡐",
            "⡠"
        ]
    },
    dots11: {
        interval: 100,
        frames: [
            "⠁",
            "⠂",
            "⠄",
            "⡀",
            "⢀",
            "⠠",
            "⠐",
            "⠈"
        ]
    },
    dots12: {
        interval: 80,
        frames: [
            "⢀⠀",
            "⡀⠀",
            "⠄⠀",
            "⢂⠀",
            "⡂⠀",
            "⠅⠀",
            "⢃⠀",
            "⡃⠀",
            "⠍⠀",
            "⢋⠀",
            "⡋⠀",
            "⠍⠁",
            "⢋⠁",
            "⡋⠁",
            "⠍⠉",
            "⠋⠉",
            "⠋⠉",
            "⠉⠙",
            "⠉⠙",
            "⠉⠩",
            "⠈⢙",
            "⠈⡙",
            "⢈⠩",
            "⡀⢙",
            "⠄⡙",
            "⢂⠩",
            "⡂⢘",
            "⠅⡘",
            "⢃⠨",
            "⡃⢐",
            "⠍⡐",
            "⢋⠠",
            "⡋⢀",
            "⠍⡁",
            "⢋⠁",
            "⡋⠁",
            "⠍⠉",
            "⠋⠉",
            "⠋⠉",
            "⠉⠙",
            "⠉⠙",
            "⠉⠩",
            "⠈⢙",
            "⠈⡙",
            "⠈⠩",
            "⠀⢙",
            "⠀⡙",
            "⠀⠩",
            "⠀⢘",
            "⠀⡘",
            "⠀⠨",
            "⠀⢐",
            "⠀⡐",
            "⠀⠠",
            "⠀⢀",
            "⠀⡀"
        ]
    },
    dots8Bit: {
        interval: 80,
        frames: [
            "⠀",
            "⠁",
            "⠂",
            "⠃",
            "⠄",
            "⠅",
            "⠆",
            "⠇",
            "⡀",
            "⡁",
            "⡂",
            "⡃",
            "⡄",
            "⡅",
            "⡆",
            "⡇",
            "⠈",
            "⠉",
            "⠊",
            "⠋",
            "⠌",
            "⠍",
            "⠎",
            "⠏",
            "⡈",
            "⡉",
            "⡊",
            "⡋",
            "⡌",
            "⡍",
            "⡎",
            "⡏",
            "⠐",
            "⠑",
            "⠒",
            "⠓",
            "⠔",
            "⠕",
            "⠖",
            "⠗",
            "⡐",
            "⡑",
            "⡒",
            "⡓",
            "⡔",
            "⡕",
            "⡖",
            "⡗",
            "⠘",
            "⠙",
            "⠚",
            "⠛",
            "⠜",
            "⠝",
            "⠞",
            "⠟",
            "⡘",
            "⡙",
            "⡚",
            "⡛",
            "⡜",
            "⡝",
            "⡞",
            "⡟",
            "⠠",
            "⠡",
            "⠢",
            "⠣",
            "⠤",
            "⠥",
            "⠦",
            "⠧",
            "⡠",
            "⡡",
            "⡢",
            "⡣",
            "⡤",
            "⡥",
            "⡦",
            "⡧",
            "⠨",
            "⠩",
            "⠪",
            "⠫",
            "⠬",
            "⠭",
            "⠮",
            "⠯",
            "⡨",
            "⡩",
            "⡪",
            "⡫",
            "⡬",
            "⡭",
            "⡮",
            "⡯",
            "⠰",
            "⠱",
            "⠲",
            "⠳",
            "⠴",
            "⠵",
            "⠶",
            "⠷",
            "⡰",
            "⡱",
            "⡲",
            "⡳",
            "⡴",
            "⡵",
            "⡶",
            "⡷",
            "⠸",
            "⠹",
            "⠺",
            "⠻",
            "⠼",
            "⠽",
            "⠾",
            "⠿",
            "⡸",
            "⡹",
            "⡺",
            "⡻",
            "⡼",
            "⡽",
            "⡾",
            "⡿",
            "⢀",
            "⢁",
            "⢂",
            "⢃",
            "⢄",
            "⢅",
            "⢆",
            "⢇",
            "⣀",
            "⣁",
            "⣂",
            "⣃",
            "⣄",
            "⣅",
            "⣆",
            "⣇",
            "⢈",
            "⢉",
            "⢊",
            "⢋",
            "⢌",
            "⢍",
            "⢎",
            "⢏",
            "⣈",
            "⣉",
            "⣊",
            "⣋",
            "⣌",
            "⣍",
            "⣎",
            "⣏",
            "⢐",
            "⢑",
            "⢒",
            "⢓",
            "⢔",
            "⢕",
            "⢖",
            "⢗",
            "⣐",
            "⣑",
            "⣒",
            "⣓",
            "⣔",
            "⣕",
            "⣖",
            "⣗",
            "⢘",
            "⢙",
            "⢚",
            "⢛",
            "⢜",
            "⢝",
            "⢞",
            "⢟",
            "⣘",
            "⣙",
            "⣚",
            "⣛",
            "⣜",
            "⣝",
            "⣞",
            "⣟",
            "⢠",
            "⢡",
            "⢢",
            "⢣",
            "⢤",
            "⢥",
            "⢦",
            "⢧",
            "⣠",
            "⣡",
            "⣢",
            "⣣",
            "⣤",
            "⣥",
            "⣦",
            "⣧",
            "⢨",
            "⢩",
            "⢪",
            "⢫",
            "⢬",
            "⢭",
            "⢮",
            "⢯",
            "⣨",
            "⣩",
            "⣪",
            "⣫",
            "⣬",
            "⣭",
            "⣮",
            "⣯",
            "⢰",
            "⢱",
            "⢲",
            "⢳",
            "⢴",
            "⢵",
            "⢶",
            "⢷",
            "⣰",
            "⣱",
            "⣲",
            "⣳",
            "⣴",
            "⣵",
            "⣶",
            "⣷",
            "⢸",
            "⢹",
            "⢺",
            "⢻",
            "⢼",
            "⢽",
            "⢾",
            "⢿",
            "⣸",
            "⣹",
            "⣺",
            "⣻",
            "⣼",
            "⣽",
            "⣾",
            "⣿"
        ]
    },
    line: {
        interval: 130,
        frames: [
            "-",
            "\\",
            "|",
            "/"
        ]
    },
    line2: {
        interval: 100,
        frames: [
            "⠂",
            "-",
            "–",
            "—",
            "–",
            "-"
        ]
    },
    pipe: {
        interval: 100,
        frames: [
            "┤",
            "┘",
            "┴",
            "└",
            "├",
            "┌",
            "┬",
            "┐"
        ]
    },
    simpleDots: {
        interval: 400,
        frames: [
            ".  ",
            ".. ",
            "...",
            "   "
        ]
    },
    simpleDotsScrolling: {
        interval: 200,
        frames: [
            ".  ",
            ".. ",
            "...",
            " ..",
            "  .",
            "   "
        ]
    },
    star: {
        interval: 70,
        frames: [
            "✶",
            "✸",
            "✹",
            "✺",
            "✹",
            "✷"
        ]
    },
    star2: {
        interval: 80,
        frames: [
            "+",
            "x",
            "*"
        ]
    },
    flip: {
        interval: 70,
        frames: [
            "_",
            "_",
            "_",
            "-",
            "`",
            "`",
            "'",
            "´",
            "-",
            "_",
            "_",
            "_"
        ]
    },
    hamburger: {
        interval: 100,
        frames: [
            "☱",
            "☲",
            "☴"
        ]
    },
    growVertical: {
        interval: 120,
        frames: [
            "▁",
            "▃",
            "▄",
            "▅",
            "▆",
            "▇",
            "▆",
            "▅",
            "▄",
            "▃"
        ]
    },
    growHorizontal: {
        interval: 120,
        frames: [
            "▏",
            "▎",
            "▍",
            "▌",
            "▋",
            "▊",
            "▉",
            "▊",
            "▋",
            "▌",
            "▍",
            "▎"
        ]
    },
    balloon: {
        interval: 140,
        frames: [
            " ",
            ".",
            "o",
            "O",
            "@",
            "*",
            " "
        ]
    },
    balloon2: {
        interval: 120,
        frames: [
            ".",
            "o",
            "O",
            "°",
            "O",
            "o",
            "."
        ]
    },
    noise: {
        interval: 100,
        frames: [
            "▓",
            "▒",
            "░"
        ]
    },
    bounce: {
        interval: 120,
        frames: [
            "⠁",
            "⠂",
            "⠄",
            "⠂"
        ]
    },
    boxBounce: {
        interval: 120,
        frames: [
            "▖",
            "▘",
            "▝",
            "▗"
        ]
    },
    boxBounce2: {
        interval: 100,
        frames: [
            "▌",
            "▀",
            "▐",
            "▄"
        ]
    },
    triangle: {
        interval: 50,
        frames: [
            "◢",
            "◣",
            "◤",
            "◥"
        ]
    },
    arc: {
        interval: 100,
        frames: [
            "◜",
            "◠",
            "◝",
            "◞",
            "◡",
            "◟"
        ]
    },
    circle: {
        interval: 120,
        frames: [
            "◡",
            "⊙",
            "◠"
        ]
    },
    squareCorners: {
        interval: 180,
        frames: [
            "◰",
            "◳",
            "◲",
            "◱"
        ]
    },
    circleQuarters: {
        interval: 120,
        frames: [
            "◴",
            "◷",
            "◶",
            "◵"
        ]
    },
    circleHalves: {
        interval: 50,
        frames: [
            "◐",
            "◓",
            "◑",
            "◒"
        ]
    },
    squish: {
        interval: 100,
        frames: [
            "╫",
            "╪"
        ]
    },
    toggle: {
        interval: 250,
        frames: [
            "⊶",
            "⊷"
        ]
    },
    toggle2: {
        interval: 80,
        frames: [
            "▫",
            "▪"
        ]
    },
    toggle3: {
        interval: 120,
        frames: [
            "□",
            "■"
        ]
    },
    toggle4: {
        interval: 100,
        frames: [
            "■",
            "□",
            "▪",
            "▫"
        ]
    },
    toggle5: {
        interval: 100,
        frames: [
            "▮",
            "▯"
        ]
    },
    toggle6: {
        interval: 300,
        frames: [
            "ဝ",
            "၀"
        ]
    },
    toggle7: {
        interval: 80,
        frames: [
            "⦾",
            "⦿"
        ]
    },
    toggle8: {
        interval: 100,
        frames: [
            "◍",
            "◌"
        ]
    },
    toggle9: {
        interval: 100,
        frames: [
            "◉",
            "◎"
        ]
    },
    toggle10: {
        interval: 100,
        frames: [
            "㊂",
            "㊀",
            "㊁"
        ]
    },
    toggle11: {
        interval: 50,
        frames: [
            "⧇",
            "⧆"
        ]
    },
    toggle12: {
        interval: 120,
        frames: [
            "☗",
            "☖"
        ]
    },
    toggle13: {
        interval: 80,
        frames: [
            "=",
            "*",
            "-"
        ]
    },
    arrow: {
        interval: 100,
        frames: [
            "←",
            "↖",
            "↑",
            "↗",
            "→",
            "↘",
            "↓",
            "↙"
        ]
    },
    arrow2: {
        interval: 80,
        frames: [
            "⬆️ ",
            "↗️ ",
            "➡️ ",
            "↘️ ",
            "⬇️ ",
            "↙️ ",
            "⬅️ ",
            "↖️ "
        ]
    },
    arrow3: {
        interval: 120,
        frames: [
            "▹▹▹▹▹",
            "▸▹▹▹▹",
            "▹▸▹▹▹",
            "▹▹▸▹▹",
            "▹▹▹▸▹",
            "▹▹▹▹▸"
        ]
    },
    bouncingBar: {
        interval: 80,
        frames: [
            "[    ]",
            "[=   ]",
            "[==  ]",
            "[=== ]",
            "[ ===]",
            "[  ==]",
            "[   =]",
            "[    ]",
            "[   =]",
            "[  ==]",
            "[ ===]",
            "[====]",
            "[=== ]",
            "[==  ]",
            "[=   ]"
        ]
    },
    bouncingBall: {
        interval: 80,
        frames: [
            "( ●    )",
            "(  ●   )",
            "(   ●  )",
            "(    ● )",
            "(     ●)",
            "(    ● )",
            "(   ●  )",
            "(  ●   )",
            "( ●    )",
            "(●     )"
        ]
    },
    smiley: {
        interval: 200,
        frames: [
            "😄 ",
            "😝 "
        ]
    },
    monkey: {
        interval: 300,
        frames: [
            "🙈 ",
            "🙈 ",
            "🙉 ",
            "🙊 "
        ]
    },
    hearts: {
        interval: 100,
        frames: [
            "💛 ",
            "💙 ",
            "💜 ",
            "💚 ",
            "❤️ "
        ]
    },
    clock: {
        interval: 100,
        frames: [
            "🕛 ",
            "🕐 ",
            "🕑 ",
            "🕒 ",
            "🕓 ",
            "🕔 ",
            "🕕 ",
            "🕖 ",
            "🕗 ",
            "🕘 ",
            "🕙 ",
            "🕚 "
        ]
    },
    earth: {
        interval: 180,
        frames: [
            "🌍 ",
            "🌎 ",
            "🌏 "
        ]
    },
    material: {
        interval: 17,
        frames: [
            "█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "██████▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "███████▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "████████▁▁▁▁▁▁▁▁▁▁▁▁",
            "█████████▁▁▁▁▁▁▁▁▁▁▁",
            "█████████▁▁▁▁▁▁▁▁▁▁▁",
            "██████████▁▁▁▁▁▁▁▁▁▁",
            "███████████▁▁▁▁▁▁▁▁▁",
            "█████████████▁▁▁▁▁▁▁",
            "██████████████▁▁▁▁▁▁",
            "██████████████▁▁▁▁▁▁",
            "▁██████████████▁▁▁▁▁",
            "▁██████████████▁▁▁▁▁",
            "▁██████████████▁▁▁▁▁",
            "▁▁██████████████▁▁▁▁",
            "▁▁▁██████████████▁▁▁",
            "▁▁▁▁█████████████▁▁▁",
            "▁▁▁▁██████████████▁▁",
            "▁▁▁▁██████████████▁▁",
            "▁▁▁▁▁██████████████▁",
            "▁▁▁▁▁██████████████▁",
            "▁▁▁▁▁██████████████▁",
            "▁▁▁▁▁▁██████████████",
            "▁▁▁▁▁▁██████████████",
            "▁▁▁▁▁▁▁█████████████",
            "▁▁▁▁▁▁▁█████████████",
            "▁▁▁▁▁▁▁▁████████████",
            "▁▁▁▁▁▁▁▁████████████",
            "▁▁▁▁▁▁▁▁▁███████████",
            "▁▁▁▁▁▁▁▁▁███████████",
            "▁▁▁▁▁▁▁▁▁▁██████████",
            "▁▁▁▁▁▁▁▁▁▁██████████",
            "▁▁▁▁▁▁▁▁▁▁▁▁████████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁██████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
            "█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
            "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
            "██▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
            "███▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
            "████▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
            "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
            "█████▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
            "██████▁▁▁▁▁▁▁▁▁▁▁▁▁█",
            "████████▁▁▁▁▁▁▁▁▁▁▁▁",
            "█████████▁▁▁▁▁▁▁▁▁▁▁",
            "█████████▁▁▁▁▁▁▁▁▁▁▁",
            "█████████▁▁▁▁▁▁▁▁▁▁▁",
            "█████████▁▁▁▁▁▁▁▁▁▁▁",
            "███████████▁▁▁▁▁▁▁▁▁",
            "████████████▁▁▁▁▁▁▁▁",
            "████████████▁▁▁▁▁▁▁▁",
            "██████████████▁▁▁▁▁▁",
            "██████████████▁▁▁▁▁▁",
            "▁██████████████▁▁▁▁▁",
            "▁██████████████▁▁▁▁▁",
            "▁▁▁█████████████▁▁▁▁",
            "▁▁▁▁▁████████████▁▁▁",
            "▁▁▁▁▁████████████▁▁▁",
            "▁▁▁▁▁▁███████████▁▁▁",
            "▁▁▁▁▁▁▁▁█████████▁▁▁",
            "▁▁▁▁▁▁▁▁█████████▁▁▁",
            "▁▁▁▁▁▁▁▁▁█████████▁▁",
            "▁▁▁▁▁▁▁▁▁█████████▁▁",
            "▁▁▁▁▁▁▁▁▁▁█████████▁",
            "▁▁▁▁▁▁▁▁▁▁▁████████▁",
            "▁▁▁▁▁▁▁▁▁▁▁████████▁",
            "▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
            "▁▁▁▁▁▁▁▁▁▁▁▁███████▁",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁███████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁████",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁███",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁██",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁█",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁",
            "▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁"
        ]
    },
    moon: {
        interval: 80,
        frames: [
            "🌑 ",
            "🌒 ",
            "🌓 ",
            "🌔 ",
            "🌕 ",
            "🌖 ",
            "🌗 ",
            "🌘 "
        ]
    },
    runner: {
        interval: 140,
        frames: [
            "🚶 ",
            "🏃 "
        ]
    },
    pong: {
        interval: 80,
        frames: [
            "▐⠂       ▌",
            "▐⠈       ▌",
            "▐ ⠂      ▌",
            "▐ ⠠      ▌",
            "▐  ⡀     ▌",
            "▐  ⠠     ▌",
            "▐   ⠂    ▌",
            "▐   ⠈    ▌",
            "▐    ⠂   ▌",
            "▐    ⠠   ▌",
            "▐     ⡀  ▌",
            "▐     ⠠  ▌",
            "▐      ⠂ ▌",
            "▐      ⠈ ▌",
            "▐       ⠂▌",
            "▐       ⠠▌",
            "▐       ⡀▌",
            "▐      ⠠ ▌",
            "▐      ⠂ ▌",
            "▐     ⠈  ▌",
            "▐     ⠂  ▌",
            "▐    ⠠   ▌",
            "▐    ⡀   ▌",
            "▐   ⠠    ▌",
            "▐   ⠂    ▌",
            "▐  ⠈     ▌",
            "▐  ⠂     ▌",
            "▐ ⠠      ▌",
            "▐ ⡀      ▌",
            "▐⠠       ▌"
        ]
    },
    shark: {
        interval: 120,
        frames: [
            "▐|\\____________▌",
            "▐_|\\___________▌",
            "▐__|\\__________▌",
            "▐___|\\_________▌",
            "▐____|\\________▌",
            "▐_____|\\_______▌",
            "▐______|\\______▌",
            "▐_______|\\_____▌",
            "▐________|\\____▌",
            "▐_________|\\___▌",
            "▐__________|\\__▌",
            "▐___________|\\_▌",
            "▐____________|\\▌",
            "▐____________/|▌",
            "▐___________/|_▌",
            "▐__________/|__▌",
            "▐_________/|___▌",
            "▐________/|____▌",
            "▐_______/|_____▌",
            "▐______/|______▌",
            "▐_____/|_______▌",
            "▐____/|________▌",
            "▐___/|_________▌",
            "▐__/|__________▌",
            "▐_/|___________▌",
            "▐/|____________▌"
        ]
    },
    dqpb: {
        interval: 100,
        frames: [
            "d",
            "q",
            "p",
            "b"
        ]
    },
    weather: {
        interval: 100,
        frames: [
            "☀️ ",
            "☀️ ",
            "☀️ ",
            "🌤 ",
            "⛅️ ",
            "🌥 ",
            "☁️ ",
            "🌧 ",
            "🌨 ",
            "🌧 ",
            "🌨 ",
            "🌧 ",
            "🌨 ",
            "⛈ ",
            "🌨 ",
            "🌧 ",
            "🌨 ",
            "☁️ ",
            "🌥 ",
            "⛅️ ",
            "🌤 ",
            "☀️ ",
            "☀️ "
        ]
    },
    christmas: {
        interval: 400,
        frames: [
            "🌲",
            "🎄"
        ]
    },
    grenade: {
        interval: 80,
        frames: [
            "،   ",
            "′   ",
            " ´ ",
            " ‾ ",
            "  ⸌",
            "  ⸊",
            "  |",
            "  ⁎",
            "  ⁕",
            " ෴ ",
            "  ⁓",
            "   ",
            "   ",
            "   "
        ]
    },
    point: {
        interval: 125,
        frames: [
            "∙∙∙",
            "●∙∙",
            "∙●∙",
            "∙∙●",
            "∙∙∙"
        ]
    },
    layer: {
        interval: 150,
        frames: [
            "-",
            "=",
            "≡"
        ]
    },
    betaWave: {
        interval: 80,
        frames: [
            "ρββββββ",
            "βρβββββ",
            "ββρββββ",
            "βββρβββ",
            "ββββρββ",
            "βββββρβ",
            "ββββββρ"
        ]
    }
};
let supported = true;
if ((await Deno.permissions.query({
    name: "env"
})).state === "granted") {
    supported = supported && (!!Deno.env.get("CI") || Deno.env.get("TERM") === "xterm-256color");
}
const main = {
    info: mod2.blue("ℹ"),
    success: mod2.green("✔"),
    warning: mod2.yellow("⚠"),
    error: mod2.red("✖")
};
const fallbacks = {
    info: mod2.blue("i"),
    success: mod2.green("√"),
    warning: mod2.yellow("‼"),
    error: mod2.red("×")
};
const symbols = supported ? main : fallbacks;
const encoder1 = new TextEncoder();
const colormap = {
    black: mod2.black,
    red: mod2.red,
    green: mod2.green,
    yellow: mod2.yellow,
    blue: mod2.blue,
    magenta: mod2.magenta,
    cyan: mod2.cyan,
    white: mod2.white,
    gray: mod2.gray
};
class Spinner {
    #opts;
    isSpinning;
    #stream;
    indent;
    interval;
    #id = 0;
    #enabled;
    #frameIndex;
    #linesToClear;
    #linesCount;
    constructor(opts){
        this.#opts = opts;
        this.#stream = this.#opts.stream;
        this.text = this.#opts.text;
        this.prefix = this.#opts.prefix;
        this.color = this.#opts.color;
        this.spinner = this.#opts.spinner;
        this.indent = this.#opts.indent;
        this.interval = this.#opts.interval;
        this.isSpinning = false;
        this.#frameIndex = 0;
        this.#linesToClear = 0;
        this.#linesCount = 1;
        this.#enabled = typeof opts.enabled === "boolean" ? opts.enabled : mod3.isInteractive(this.#stream);
        if (opts.hideCursor) {
            addEventListener("unload", ()=>{
                mod3.showCursorSync(this.#stream);
            });
        }
    }
    #spinner = __default1.dots;
    #color = mod2.cyan;
    #text = "";
    #prefix = "";
    set spinner(spin) {
        this.#frameIndex = 0;
        if (typeof spin === "string") this.#spinner = __default1[spin];
        else this.#spinner = spin;
    }
    get spinner() {
        return this.#spinner;
    }
    set color(color) {
        if (typeof color === "string") this.#color = colormap[color];
        else this.#color = color;
    }
    get color() {
        return this.#color;
    }
    set text(value) {
        this.#text = value;
        this.updateLines();
    }
    get text() {
        return this.#text;
    }
    set prefix(value) {
        this.#prefix = value;
        this.updateLines();
    }
    get prefix() {
        return this.#prefix;
    }
    write(data) {
        this.#stream.writeSync(encoder1.encode(data));
    }
    start() {
        if (!this.#enabled) {
            if (this.text) {
                this.write(`- ${this.text}\n`);
            }
            return this;
        }
        if (this.isSpinning) return this;
        if (this.#opts.hideCursor) {
            mod3.hideCursorSync(this.#stream);
        }
        this.render();
        this.#id = setInterval(this.render.bind(this), this.interval);
        return this;
    }
    render() {
        this.clear();
        this.write(`${this.frame()}\n`);
        this.updateLines();
        this.#linesToClear = this.#linesCount;
    }
    frame() {
        const { frames  } = this.#spinner;
        let frame = frames[this.#frameIndex];
        frame = this.#color(frame);
        this.#frameIndex = ++this.#frameIndex % frames.length;
        const fullPrefixText = typeof this.prefix === "string" && this.prefix !== "" ? this.prefix + " " : "";
        const fullText = typeof this.text === "string" ? " " + this.text : "";
        return fullPrefixText + frame + fullText;
    }
    clear() {
        if (!this.#enabled) return;
        for(let i = 0; i < this.#linesToClear; i++){
            mod3.goUpSync(1, this.#stream);
            mod3.clearLineSync(this.#stream);
            mod3.goRightSync(this.indent - 1, this.#stream);
        }
        this.#linesToClear = 0;
    }
    updateLines() {
        let columns = 80;
        try {
            columns = Deno.consoleSize(this.#stream.rid)?.columns ?? columns;
        } catch  {}
        const fullPrefixText = typeof this.prefix === "string" ? this.prefix + "-" : "";
        this.#linesCount = mod3.stripAnsi(fullPrefixText + "--" + this.text).split("\n").reduce((count, line)=>{
            return count + Math.max(1, Math.ceil(mod3.wcswidth(line) / columns));
        }, 0);
    }
    stop() {
        if (!this.#enabled) return;
        clearInterval(this.#id);
        this.#id = -1;
        this.#frameIndex = 0;
        this.clear();
        if (this.#opts.hideCursor) {
            mod3.showCursorSync(this.#stream);
        }
    }
    stopAndPersist(options = {}) {
        const prefix = options.prefix || this.prefix;
        const fullPrefix = typeof prefix === "string" && prefix !== "" ? prefix + " " : "";
        const text = options.text || this.text;
        const fullText = typeof text === "string" ? " " + text : "";
        this.stop();
        console.log(`${fullPrefix}${options.symbol || " "}${fullText}`);
    }
    succeed(text) {
        return this.stopAndPersist({
            symbol: symbols.success,
            text
        });
    }
    fail(text) {
        return this.stopAndPersist({
            symbol: symbols.error,
            text
        });
    }
    warn(text) {
        return this.stopAndPersist({
            symbol: symbols.warning,
            text
        });
    }
    info(text) {
        return this.stopAndPersist({
            symbol: symbols.info,
            text
        });
    }
}
async function parseEntrypoint(entrypoint, root, diagnosticName = "entrypoint") {
    let entrypointSpecifier;
    try {
        if (entrypoint.startsWith("https://") || entrypoint.startsWith("http://") || entrypoint.startsWith("file://")) {
            entrypointSpecifier = new URL(entrypoint);
        } else {
            entrypointSpecifier = toFileUrl2(resolve2(root ?? Deno.cwd(), entrypoint));
        }
    } catch (err) {
        throw `Failed to parse ${diagnosticName} specifier '${entrypoint}': ${err.message}`;
    }
    if (entrypointSpecifier.protocol == "file:") {
        try {
            await Deno.lstat(entrypointSpecifier);
        } catch (err1) {
            throw `Failed to open ${diagnosticName} file at '${entrypointSpecifier}': ${err1.message}`;
        }
    }
    return entrypointSpecifier;
}
class APIError extends Error {
    code;
    xDenoRay;
    name = "APIError";
    constructor(code, message, xDenoRay){
        super(message);
        this.code = code;
        this.xDenoRay = xDenoRay;
    }
    toString() {
        let error = `${this.name}: ${this.message}`;
        if (this.xDenoRay !== null) {
            error += `\nx-deno-ray: ${this.xDenoRay}`;
            error += "\nIf you encounter this error frequently," + " contact us at deploy@deno.com with the above x-deno-ray.";
        }
        return error;
    }
}
class API {
    #endpoint;
    #authorization;
    constructor(authorization, endpoint){
        this.#authorization = authorization;
        this.#endpoint = endpoint;
    }
    static fromToken(token) {
        const endpoint = Deno.env.get("DEPLOY_API_ENDPOINT") ?? "https://dash.deno.com";
        return new API(`Bearer ${token}`, endpoint);
    }
    async #request(path2, opts = {}) {
        const url = `${this.#endpoint}/api${path2}`;
        const method = opts.method ?? "GET";
        const body = opts.body !== undefined ? opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body) : undefined;
        const headers = {
            "Accept": "application/json",
            "Authorization": this.#authorization,
            ...opts.body !== undefined ? opts.body instanceof FormData ? {} : {
                "Content-Type": "application/json"
            } : {}
        };
        return await fetch(url, {
            method,
            headers,
            body
        });
    }
    async #requestJson(path11, opts1) {
        const res = await this.#request(path11, opts1);
        if (res.headers.get("Content-Type") !== "application/json") {
            const text = await res.text();
            throw new Error(`Expected JSON, got '${text}'`);
        }
        const json = await res.json();
        if (res.status !== 200) {
            const xDenoRay = res.headers.get("x-deno-ray");
            throw new APIError(json.code, json.message, xDenoRay);
        }
        return json;
    }
    async *#requestStream(path21, opts2) {
        const res1 = await this.#request(path21, opts2);
        if (res1.status !== 200) {
            const json1 = await res1.json();
            const xDenoRay1 = res1.headers.get("x-deno-ray");
            throw new APIError(json1.code, json1.message, xDenoRay1);
        }
        if (res1.body === null) {
            throw new Error("Stream ended unexpectedly");
        }
        const lines = res1.body.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream());
        for await (const line of lines){
            if (line === "") return;
            yield JSON.parse(line);
        }
    }
    async getProject(id) {
        try {
            return await this.#requestJson(`/projects/${id}`);
        } catch (err) {
            if (err instanceof APIError && err.code === "projectNotFound") {
                return null;
            }
            throw err;
        }
    }
    async getDeployments(projectId) {
        try {
            return await this.#requestJson(`/projects/${projectId}/deployments/`);
        } catch (err) {
            if (err instanceof APIError && err.code === "projectNotFound") {
                return null;
            }
            throw err;
        }
    }
    getLogs(projectId, deploymentId) {
        return this.#requestStream(`/projects/${projectId}/deployments/${deploymentId}/logs/`);
    }
    async projectNegotiateAssets(id, manifest) {
        return await this.#requestJson(`/projects/${id}/assets/negotiate`, {
            method: "POST",
            body: manifest
        });
    }
    pushDeploy(projectId, request, files) {
        const form = new FormData();
        form.append("request", JSON.stringify(request));
        for (const bytes of files){
            form.append("file", new Blob([
                bytes
            ]));
        }
        return this.#requestStream(`/projects/${projectId}/deployment_with_assets`, {
            method: "POST",
            body: form
        });
    }
    gitHubActionsDeploy(projectId, request, files) {
        const form = new FormData();
        form.append("request", JSON.stringify(request));
        for (const bytes of files){
            form.append("file", new Blob([
                bytes
            ]));
        }
        return this.#requestStream(`/projects/${projectId}/deployment_github_actions`, {
            method: "POST",
            body: form
        });
    }
}
async function calculateGitSha1(bytes) {
    const prefix = `blob ${bytes.byteLength}\0`;
    const prefixBytes = new TextEncoder().encode(prefix);
    const fullBytes = new Uint8Array(prefixBytes.byteLength + bytes.byteLength);
    fullBytes.set(prefixBytes);
    fullBytes.set(bytes, prefixBytes.byteLength);
    const hashBytes = await crypto.subtle.digest("SHA-1", fullBytes);
    const hashHex = Array.from(new Uint8Array(hashBytes)).map((b)=>b.toString(16).padStart(2, "0")).join("");
    return hashHex;
}
function include(path, include, exclude) {
    if (include.length && !include.some((pattern)=>path.startsWith(pattern))) {
        return false;
    }
    if (exclude.length && exclude.some((pattern)=>path.startsWith(pattern))) {
        return false;
    }
    return true;
}
async function walk(cwd, dir, files, options) {
    const entries = {};
    for await (const file of Deno.readDir(dir)){
        const path = join3(dir, file.name);
        const relative = path.slice(cwd.length);
        if (!include(path.slice(cwd.length + 1), options.include, options.exclude)) {
            continue;
        }
        let entry;
        if (file.isFile) {
            const data = await Deno.readFile(path);
            const gitSha1 = await calculateGitSha1(data);
            entry = {
                kind: "file",
                gitSha1,
                size: data.byteLength
            };
            files.set(gitSha1, path);
        } else if (file.isDirectory) {
            if (relative === "/.git") continue;
            entry = {
                kind: "directory",
                entries: await walk(cwd, path, files, options)
            };
        } else if (file.isSymlink) {
            const target = await Deno.readLink(path);
            entry = {
                kind: "symlink",
                target
            };
        } else {
            throw new Error(`Unreachable`);
        }
        entries[file.name] = entry;
    }
    return entries;
}
export { parseEntrypoint as parseEntrypoint };
export { API as API, APIError as APIError };
export { walk as walk };
export { fromFileUrl2 as fromFileUrl, resolve2 as resolve, normalize3 as normalize };

