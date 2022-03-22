// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

const osType = (()=>{
    const { Deno: Deno1  } = globalThis;
    if (typeof Deno1?.build?.os === "string") {
        return Deno1.build.os;
    }
    const { navigator  } = globalThis;
    if (navigator?.appVersion?.includes?.("Win") ?? false) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
const CHAR_FORWARD_SLASH = 47;
function assertPath(path2) {
    if (typeof path2 !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path2)}`);
    }
}
function isPosixPathSeparator(code1) {
    return code1 === 47;
}
function isPathSeparator(code2) {
    return isPosixPathSeparator(code2) || code2 === 92;
}
function isWindowsDeviceRoot(code3) {
    return code3 >= 97 && code3 <= 122 || code3 >= 65 && code3 <= 90;
}
function normalizeString(path3, allowAboveRoot, separator, isPathSeparator1) {
    let res = "";
    let lastSegmentLength = 0;
    let lastSlash = -1;
    let dots = 0;
    let code4;
    for(let i1 = 0, len = path3.length; i1 <= len; ++i1){
        if (i1 < len) code4 = path3.charCodeAt(i1);
        else if (isPathSeparator1(code4)) break;
        else code4 = CHAR_FORWARD_SLASH;
        if (isPathSeparator1(code4)) {
            if (lastSlash === i1 - 1 || dots === 1) {} else if (lastSlash !== i1 - 1 && dots === 2) {
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
                        lastSlash = i1;
                        dots = 0;
                        continue;
                    } else if (res.length === 2 || res.length === 1) {
                        res = "";
                        lastSegmentLength = 0;
                        lastSlash = i1;
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
                if (res.length > 0) res += separator + path3.slice(lastSlash + 1, i1);
                else res = path3.slice(lastSlash + 1, i1);
                lastSegmentLength = i1 - lastSlash - 1;
            }
            lastSlash = i1;
            dots = 0;
        } else if (code4 === 46 && dots !== -1) {
            ++dots;
        } else {
            dots = -1;
        }
    }
    return res;
}
function _format(sep3, pathObject) {
    const dir = pathObject.dir || pathObject.root;
    const base = pathObject.base || (pathObject.name || "") + (pathObject.ext || "");
    if (!dir) return base;
    if (dir === pathObject.root) return dir + base;
    return dir + sep3 + base;
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
    for(let i2 = pathSegments.length - 1; i2 >= -1; i2--){
        let path4;
        const { Deno: Deno2  } = globalThis;
        if (i2 >= 0) {
            path4 = pathSegments[i2];
        } else if (!resolvedDevice) {
            if (typeof Deno2?.cwd !== "function") {
                throw new TypeError("Resolved a drive-letter-less path without a CWD.");
            }
            path4 = Deno2.cwd();
        } else {
            if (typeof Deno2?.env?.get !== "function" || typeof Deno2?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path4 = Deno2.cwd();
            if (path4 === undefined || path4.slice(0, 3).toLowerCase() !== `${resolvedDevice.toLowerCase()}\\`) {
                path4 = `${resolvedDevice}\\`;
            }
        }
        assertPath(path4);
        const len = path4.length;
        if (len === 0) continue;
        let rootEnd = 0;
        let device = "";
        let isAbsolute1 = false;
        const code5 = path4.charCodeAt(0);
        if (len > 1) {
            if (isPathSeparator(code5)) {
                isAbsolute1 = true;
                if (isPathSeparator(path4.charCodeAt(1))) {
                    let j = 2;
                    let last = j;
                    for(; j < len; ++j){
                        if (isPathSeparator(path4.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        const firstPart = path4.slice(last, j);
                        last = j;
                        for(; j < len; ++j){
                            if (!isPathSeparator(path4.charCodeAt(j))) break;
                        }
                        if (j < len && j !== last) {
                            last = j;
                            for(; j < len; ++j){
                                if (isPathSeparator(path4.charCodeAt(j))) break;
                            }
                            if (j === len) {
                                device = `\\\\${firstPart}\\${path4.slice(last)}`;
                                rootEnd = j;
                            } else if (j !== last) {
                                device = `\\\\${firstPart}\\${path4.slice(last, j)}`;
                                rootEnd = j;
                            }
                        }
                    }
                } else {
                    rootEnd = 1;
                }
            } else if (isWindowsDeviceRoot(code5)) {
                if (path4.charCodeAt(1) === 58) {
                    device = path4.slice(0, 2);
                    rootEnd = 2;
                    if (len > 2) {
                        if (isPathSeparator(path4.charCodeAt(2))) {
                            isAbsolute1 = true;
                            rootEnd = 3;
                        }
                    }
                }
            }
        } else if (isPathSeparator(code5)) {
            rootEnd = 1;
            isAbsolute1 = true;
        }
        if (device.length > 0 && resolvedDevice.length > 0 && device.toLowerCase() !== resolvedDevice.toLowerCase()) {
            continue;
        }
        if (resolvedDevice.length === 0 && device.length > 0) {
            resolvedDevice = device;
        }
        if (!resolvedAbsolute) {
            resolvedTail = `${path4.slice(rootEnd)}\\${resolvedTail}`;
            resolvedAbsolute = isAbsolute1;
        }
        if (resolvedAbsolute && resolvedDevice.length > 0) break;
    }
    resolvedTail = normalizeString(resolvedTail, !resolvedAbsolute, "\\", isPathSeparator);
    return resolvedDevice + (resolvedAbsolute ? "\\" : "") + resolvedTail || ".";
}
function normalize(path5) {
    assertPath(path5);
    const len = path5.length;
    if (len === 0) return ".";
    let rootEnd = 0;
    let device;
    let isAbsolute2 = false;
    const code6 = path5.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code6)) {
            isAbsolute2 = true;
            if (isPathSeparator(path5.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path5.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    const firstPart = path5.slice(last, j);
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path5.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path5.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return `\\\\${firstPart}\\${path5.slice(last)}\\`;
                        } else if (j !== last) {
                            device = `\\\\${firstPart}\\${path5.slice(last, j)}`;
                            rootEnd = j;
                        }
                    }
                }
            } else {
                rootEnd = 1;
            }
        } else if (isWindowsDeviceRoot(code6)) {
            if (path5.charCodeAt(1) === 58) {
                device = path5.slice(0, 2);
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path5.charCodeAt(2))) {
                        isAbsolute2 = true;
                        rootEnd = 3;
                    }
                }
            }
        }
    } else if (isPathSeparator(code6)) {
        return "\\";
    }
    let tail;
    if (rootEnd < len) {
        tail = normalizeString(path5.slice(rootEnd), !isAbsolute2, "\\", isPathSeparator);
    } else {
        tail = "";
    }
    if (tail.length === 0 && !isAbsolute2) tail = ".";
    if (tail.length > 0 && isPathSeparator(path5.charCodeAt(len - 1))) {
        tail += "\\";
    }
    if (device === undefined) {
        if (isAbsolute2) {
            if (tail.length > 0) return `\\${tail}`;
            else return "\\";
        } else if (tail.length > 0) {
            return tail;
        } else {
            return "";
        }
    } else if (isAbsolute2) {
        if (tail.length > 0) return `${device}\\${tail}`;
        else return `${device}\\`;
    } else if (tail.length > 0) {
        return device + tail;
    } else {
        return device;
    }
}
function isAbsolute(path6) {
    assertPath(path6);
    const len = path6.length;
    if (len === 0) return false;
    const code7 = path6.charCodeAt(0);
    if (isPathSeparator(code7)) {
        return true;
    } else if (isWindowsDeviceRoot(code7)) {
        if (len > 2 && path6.charCodeAt(1) === 58) {
            if (isPathSeparator(path6.charCodeAt(2))) return true;
        }
    }
    return false;
}
function join(...paths) {
    const pathsCount = paths.length;
    if (pathsCount === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i3 = 0; i3 < pathsCount; ++i3){
        const path7 = paths[i3];
        assertPath(path7);
        if (path7.length > 0) {
            if (joined === undefined) joined = firstPart = path7;
            else joined += `\\${path7}`;
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
    let i4 = 0;
    for(; i4 <= length; ++i4){
        if (i4 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i4) === 92) {
                    return toOrig.slice(toStart + i4 + 1);
                } else if (i4 === 2) {
                    return toOrig.slice(toStart + i4);
                }
            }
            if (fromLen > length) {
                if (from.charCodeAt(fromStart + i4) === 92) {
                    lastCommonSep = i4;
                } else if (i4 === 2) {
                    lastCommonSep = 3;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i4);
        const toCode = to.charCodeAt(toStart + i4);
        if (fromCode !== toCode) break;
        else if (fromCode === 92) lastCommonSep = i4;
    }
    if (i4 !== length && lastCommonSep === -1) {
        return toOrig;
    }
    let out = "";
    if (lastCommonSep === -1) lastCommonSep = 0;
    for(i4 = fromStart + lastCommonSep + 1; i4 <= fromEnd; ++i4){
        if (i4 === fromEnd || from.charCodeAt(i4) === 92) {
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
function toNamespacedPath(path8) {
    if (typeof path8 !== "string") return path8;
    if (path8.length === 0) return "";
    const resolvedPath = resolve(path8);
    if (resolvedPath.length >= 3) {
        if (resolvedPath.charCodeAt(0) === 92) {
            if (resolvedPath.charCodeAt(1) === 92) {
                const code8 = resolvedPath.charCodeAt(2);
                if (code8 !== 63 && code8 !== 46) {
                    return `\\\\?\\UNC\\${resolvedPath.slice(2)}`;
                }
            }
        } else if (isWindowsDeviceRoot(resolvedPath.charCodeAt(0))) {
            if (resolvedPath.charCodeAt(1) === 58 && resolvedPath.charCodeAt(2) === 92) {
                return `\\\\?\\${resolvedPath}`;
            }
        }
    }
    return path8;
}
function dirname(path9) {
    assertPath(path9);
    const len = path9.length;
    if (len === 0) return ".";
    let rootEnd = -1;
    let end = -1;
    let matchedSlash = true;
    let offset = 0;
    const code9 = path9.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code9)) {
            rootEnd = offset = 1;
            if (isPathSeparator(path9.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path9.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path9.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path9.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            return path9;
                        }
                        if (j !== last) {
                            rootEnd = offset = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code9)) {
            if (path9.charCodeAt(1) === 58) {
                rootEnd = offset = 2;
                if (len > 2) {
                    if (isPathSeparator(path9.charCodeAt(2))) rootEnd = offset = 3;
                }
            }
        }
    } else if (isPathSeparator(code9)) {
        return path9;
    }
    for(let i5 = len - 1; i5 >= offset; --i5){
        if (isPathSeparator(path9.charCodeAt(i5))) {
            if (!matchedSlash) {
                end = i5;
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
    return path9.slice(0, end);
}
function basename(path10, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path10);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i6;
    if (path10.length >= 2) {
        const drive = path10.charCodeAt(0);
        if (isWindowsDeviceRoot(drive)) {
            if (path10.charCodeAt(1) === 58) start = 2;
        }
    }
    if (ext !== undefined && ext.length > 0 && ext.length <= path10.length) {
        if (ext.length === path10.length && ext === path10) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i6 = path10.length - 1; i6 >= start; --i6){
            const code10 = path10.charCodeAt(i6);
            if (isPathSeparator(code10)) {
                if (!matchedSlash) {
                    start = i6 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i6 + 1;
                }
                if (extIdx >= 0) {
                    if (code10 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i6;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path10.length;
        return path10.slice(start, end);
    } else {
        for(i6 = path10.length - 1; i6 >= start; --i6){
            if (isPathSeparator(path10.charCodeAt(i6))) {
                if (!matchedSlash) {
                    start = i6 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i6 + 1;
            }
        }
        if (end === -1) return "";
        return path10.slice(start, end);
    }
}
function extname(path11) {
    assertPath(path11);
    let start = 0;
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    if (path11.length >= 2 && path11.charCodeAt(1) === 58 && isWindowsDeviceRoot(path11.charCodeAt(0))) {
        start = startPart = 2;
    }
    for(let i7 = path11.length - 1; i7 >= start; --i7){
        const code11 = path11.charCodeAt(i7);
        if (isPathSeparator(code11)) {
            if (!matchedSlash) {
                startPart = i7 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i7 + 1;
        }
        if (code11 === 46) {
            if (startDot === -1) startDot = i7;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path11.slice(startDot, end);
}
function format(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("\\", pathObject);
}
function parse(path12) {
    assertPath(path12);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    const len = path12.length;
    if (len === 0) return ret;
    let rootEnd = 0;
    let code12 = path12.charCodeAt(0);
    if (len > 1) {
        if (isPathSeparator(code12)) {
            rootEnd = 1;
            if (isPathSeparator(path12.charCodeAt(1))) {
                let j = 2;
                let last = j;
                for(; j < len; ++j){
                    if (isPathSeparator(path12.charCodeAt(j))) break;
                }
                if (j < len && j !== last) {
                    last = j;
                    for(; j < len; ++j){
                        if (!isPathSeparator(path12.charCodeAt(j))) break;
                    }
                    if (j < len && j !== last) {
                        last = j;
                        for(; j < len; ++j){
                            if (isPathSeparator(path12.charCodeAt(j))) break;
                        }
                        if (j === len) {
                            rootEnd = j;
                        } else if (j !== last) {
                            rootEnd = j + 1;
                        }
                    }
                }
            }
        } else if (isWindowsDeviceRoot(code12)) {
            if (path12.charCodeAt(1) === 58) {
                rootEnd = 2;
                if (len > 2) {
                    if (isPathSeparator(path12.charCodeAt(2))) {
                        if (len === 3) {
                            ret.root = ret.dir = path12;
                            return ret;
                        }
                        rootEnd = 3;
                    }
                } else {
                    ret.root = ret.dir = path12;
                    return ret;
                }
            }
        }
    } else if (isPathSeparator(code12)) {
        ret.root = ret.dir = path12;
        return ret;
    }
    if (rootEnd > 0) ret.root = path12.slice(0, rootEnd);
    let startDot = -1;
    let startPart = rootEnd;
    let end = -1;
    let matchedSlash = true;
    let i8 = path12.length - 1;
    let preDotState = 0;
    for(; i8 >= rootEnd; --i8){
        code12 = path12.charCodeAt(i8);
        if (isPathSeparator(code12)) {
            if (!matchedSlash) {
                startPart = i8 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i8 + 1;
        }
        if (code12 === 46) {
            if (startDot === -1) startDot = i8;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            ret.base = ret.name = path12.slice(startPart, end);
        }
    } else {
        ret.name = path12.slice(startPart, startDot);
        ret.base = path12.slice(startPart, end);
        ret.ext = path12.slice(startDot, end);
    }
    if (startPart > 0 && startPart !== rootEnd) {
        ret.dir = path12.slice(0, startPart - 1);
    } else ret.dir = ret.root;
    return ret;
}
function fromFileUrl(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    let path13 = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname != "") {
        path13 = `\\\\${url.hostname}${path13}`;
    }
    return path13;
}
function toFileUrl(path14) {
    if (!isAbsolute(path14)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path14.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
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
    for(let i9 = pathSegments.length - 1; i9 >= -1 && !resolvedAbsolute; i9--){
        let path15;
        if (i9 >= 0) path15 = pathSegments[i9];
        else {
            const { Deno: Deno3  } = globalThis;
            if (typeof Deno3?.cwd !== "function") {
                throw new TypeError("Resolved a relative path without a CWD.");
            }
            path15 = Deno3.cwd();
        }
        assertPath(path15);
        if (path15.length === 0) {
            continue;
        }
        resolvedPath = `${path15}/${resolvedPath}`;
        resolvedAbsolute = path15.charCodeAt(0) === CHAR_FORWARD_SLASH;
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function normalize1(path16) {
    assertPath(path16);
    if (path16.length === 0) return ".";
    const isAbsolute1 = path16.charCodeAt(0) === 47;
    const trailingSeparator = path16.charCodeAt(path16.length - 1) === 47;
    path16 = normalizeString(path16, !isAbsolute1, "/", isPosixPathSeparator);
    if (path16.length === 0 && !isAbsolute1) path16 = ".";
    if (path16.length > 0 && trailingSeparator) path16 += "/";
    if (isAbsolute1) return `/${path16}`;
    return path16;
}
function isAbsolute1(path17) {
    assertPath(path17);
    return path17.length > 0 && path17.charCodeAt(0) === 47;
}
function join1(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    for(let i10 = 0, len = paths.length; i10 < len; ++i10){
        const path18 = paths[i10];
        assertPath(path18);
        if (path18.length > 0) {
            if (!joined) joined = path18;
            else joined += `/${path18}`;
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
    let i11 = 0;
    for(; i11 <= length; ++i11){
        if (i11 === length) {
            if (toLen > length) {
                if (to.charCodeAt(toStart + i11) === 47) {
                    return to.slice(toStart + i11 + 1);
                } else if (i11 === 0) {
                    return to.slice(toStart + i11);
                }
            } else if (fromLen > length) {
                if (from.charCodeAt(fromStart + i11) === 47) {
                    lastCommonSep = i11;
                } else if (i11 === 0) {
                    lastCommonSep = 0;
                }
            }
            break;
        }
        const fromCode = from.charCodeAt(fromStart + i11);
        const toCode = to.charCodeAt(toStart + i11);
        if (fromCode !== toCode) break;
        else if (fromCode === 47) lastCommonSep = i11;
    }
    let out = "";
    for(i11 = fromStart + lastCommonSep + 1; i11 <= fromEnd; ++i11){
        if (i11 === fromEnd || from.charCodeAt(i11) === 47) {
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
function toNamespacedPath1(path19) {
    return path19;
}
function dirname1(path20) {
    assertPath(path20);
    if (path20.length === 0) return ".";
    const hasRoot = path20.charCodeAt(0) === 47;
    let end = -1;
    let matchedSlash = true;
    for(let i12 = path20.length - 1; i12 >= 1; --i12){
        if (path20.charCodeAt(i12) === 47) {
            if (!matchedSlash) {
                end = i12;
                break;
            }
        } else {
            matchedSlash = false;
        }
    }
    if (end === -1) return hasRoot ? "/" : ".";
    if (hasRoot && end === 1) return "//";
    return path20.slice(0, end);
}
function basename1(path21, ext = "") {
    if (ext !== undefined && typeof ext !== "string") {
        throw new TypeError('"ext" argument must be a string');
    }
    assertPath(path21);
    let start = 0;
    let end = -1;
    let matchedSlash = true;
    let i13;
    if (ext !== undefined && ext.length > 0 && ext.length <= path21.length) {
        if (ext.length === path21.length && ext === path21) return "";
        let extIdx = ext.length - 1;
        let firstNonSlashEnd = -1;
        for(i13 = path21.length - 1; i13 >= 0; --i13){
            const code13 = path21.charCodeAt(i13);
            if (code13 === 47) {
                if (!matchedSlash) {
                    start = i13 + 1;
                    break;
                }
            } else {
                if (firstNonSlashEnd === -1) {
                    matchedSlash = false;
                    firstNonSlashEnd = i13 + 1;
                }
                if (extIdx >= 0) {
                    if (code13 === ext.charCodeAt(extIdx)) {
                        if (--extIdx === -1) {
                            end = i13;
                        }
                    } else {
                        extIdx = -1;
                        end = firstNonSlashEnd;
                    }
                }
            }
        }
        if (start === end) end = firstNonSlashEnd;
        else if (end === -1) end = path21.length;
        return path21.slice(start, end);
    } else {
        for(i13 = path21.length - 1; i13 >= 0; --i13){
            if (path21.charCodeAt(i13) === 47) {
                if (!matchedSlash) {
                    start = i13 + 1;
                    break;
                }
            } else if (end === -1) {
                matchedSlash = false;
                end = i13 + 1;
            }
        }
        if (end === -1) return "";
        return path21.slice(start, end);
    }
}
function extname1(path22) {
    assertPath(path22);
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let preDotState = 0;
    for(let i14 = path22.length - 1; i14 >= 0; --i14){
        const code14 = path22.charCodeAt(i14);
        if (code14 === 47) {
            if (!matchedSlash) {
                startPart = i14 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i14 + 1;
        }
        if (code14 === 46) {
            if (startDot === -1) startDot = i14;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        return "";
    }
    return path22.slice(startDot, end);
}
function format1(pathObject) {
    if (pathObject === null || typeof pathObject !== "object") {
        throw new TypeError(`The "pathObject" argument must be of type Object. Received type ${typeof pathObject}`);
    }
    return _format("/", pathObject);
}
function parse1(path23) {
    assertPath(path23);
    const ret = {
        root: "",
        dir: "",
        base: "",
        ext: "",
        name: ""
    };
    if (path23.length === 0) return ret;
    const isAbsolute2 = path23.charCodeAt(0) === 47;
    let start;
    if (isAbsolute2) {
        ret.root = "/";
        start = 1;
    } else {
        start = 0;
    }
    let startDot = -1;
    let startPart = 0;
    let end = -1;
    let matchedSlash = true;
    let i15 = path23.length - 1;
    let preDotState = 0;
    for(; i15 >= start; --i15){
        const code15 = path23.charCodeAt(i15);
        if (code15 === 47) {
            if (!matchedSlash) {
                startPart = i15 + 1;
                break;
            }
            continue;
        }
        if (end === -1) {
            matchedSlash = false;
            end = i15 + 1;
        }
        if (code15 === 46) {
            if (startDot === -1) startDot = i15;
            else if (preDotState !== 1) preDotState = 1;
        } else if (startDot !== -1) {
            preDotState = -1;
        }
    }
    if (startDot === -1 || end === -1 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) {
        if (end !== -1) {
            if (startPart === 0 && isAbsolute2) {
                ret.base = ret.name = path23.slice(1, end);
            } else {
                ret.base = ret.name = path23.slice(startPart, end);
            }
        }
    } else {
        if (startPart === 0 && isAbsolute2) {
            ret.name = path23.slice(1, startDot);
            ret.base = path23.slice(1, end);
        } else {
            ret.name = path23.slice(startPart, startDot);
            ret.base = path23.slice(startPart, end);
        }
        ret.ext = path23.slice(startDot, end);
    }
    if (startPart > 0) ret.dir = path23.slice(0, startPart - 1);
    else if (isAbsolute2) ret.dir = "/";
    return ret;
}
function fromFileUrl1(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol != "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function toFileUrl1(path24) {
    if (!isAbsolute1(path24)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path24.replace(/%/g, "%25").replace(/\\/g, "%5C"));
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
const { basename: basename2 , delimiter: delimiter2 , dirname: dirname2 , extname: extname2 , format: format2 , fromFileUrl: fromFileUrl2 , isAbsolute: isAbsolute2 , join: join3 , normalize: normalize3 , parse: parse2 , relative: relative2 , resolve: resolve2 , sep: sep2 , toFileUrl: toFileUrl2 , toNamespacedPath: toNamespacedPath2 ,  } = path1;
const { Deno: Deno4  } = globalThis;
typeof Deno4?.noColor === "boolean" ? Deno4.noColor : true;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
].join("|"), "g");
const { hasOwn  } = Object;
class BytesList {
    len = 0;
    chunks = [];
    constructor(){}
    size() {
        return this.len;
    }
    add(value, start = 0, end = value.byteLength) {
        if (value.byteLength === 0 || end - start === 0) {
            return;
        }
        checkRange(start, end, value.byteLength);
        this.chunks.push({
            value,
            end,
            start,
            offset: this.len
        });
        this.len += end - start;
    }
    shift(n) {
        if (n === 0) {
            return;
        }
        if (this.len <= n) {
            this.chunks = [];
            this.len = 0;
            return;
        }
        const idx = this.getChunkIndex(n);
        this.chunks.splice(0, idx);
        const [chunk] = this.chunks;
        if (chunk) {
            const diff = n - chunk.offset;
            chunk.start += diff;
        }
        let offset = 0;
        for (const chunk1 of this.chunks){
            chunk1.offset = offset;
            offset += chunk1.end - chunk1.start;
        }
        this.len = offset;
    }
    getChunkIndex(pos) {
        let max = this.chunks.length;
        let min = 0;
        while(true){
            const i16 = min + Math.floor((max - min) / 2);
            if (i16 < 0 || this.chunks.length <= i16) {
                return -1;
            }
            const { offset , start , end  } = this.chunks[i16];
            const len = end - start;
            if (offset <= pos && pos < offset + len) {
                return i16;
            } else if (offset + len <= pos) {
                min = i16 + 1;
            } else {
                max = i16 - 1;
            }
        }
    }
    get(i17) {
        if (i17 < 0 || this.len <= i17) {
            throw new Error("out of range");
        }
        const idx = this.getChunkIndex(i17);
        const { value , offset , start  } = this.chunks[idx];
        return value[start + i17 - offset];
    }
    *iterator(start = 0) {
        const startIdx = this.getChunkIndex(start);
        if (startIdx < 0) return;
        const first = this.chunks[startIdx];
        let firstOffset = start - first.offset;
        for(let i18 = startIdx; i18 < this.chunks.length; i18++){
            const chunk = this.chunks[i18];
            for(let j = chunk.start + firstOffset; j < chunk.end; j++){
                yield chunk.value[j];
            }
            firstOffset = 0;
        }
    }
    slice(start, end = this.len) {
        if (end === start) {
            return new Uint8Array();
        }
        checkRange(start, end, this.len);
        const result = new Uint8Array(end - start);
        const startIdx = this.getChunkIndex(start);
        const endIdx = this.getChunkIndex(end - 1);
        let written = 0;
        for(let i19 = startIdx; i19 < endIdx; i19++){
            const chunk = this.chunks[i19];
            const len = chunk.end - chunk.start;
            result.set(chunk.value.subarray(chunk.start, chunk.end), written);
            written += len;
        }
        const last = this.chunks[endIdx];
        const rest = end - start - written;
        result.set(last.value.subarray(last.start, last.start + rest), written);
        return result;
    }
    concat() {
        const result = new Uint8Array(this.len);
        let sum = 0;
        for (const { value , start , end  } of this.chunks){
            result.set(value.subarray(start, end), sum);
            sum += end - start;
        }
        return result;
    }
}
function checkRange(start, end, len) {
    if (start < 0 || len < start || end < 0 || len < end || end < start) {
        throw new Error("invalid range");
    }
}
const CR = "\r".charCodeAt(0);
const LF = "\n".charCodeAt(0);
class LineStream extends TransformStream {
    #bufs = new BytesList();
    #prevHadCR = false;
    constructor(){
        super({
            transform: (chunk, controller)=>{
                this.#handle(chunk, controller);
            },
            flush: (controller)=>{
                controller.enqueue(this.#mergeBufs(false));
            }
        });
    }
     #handle(chunk, controller) {
        const lfIndex = chunk.indexOf(LF);
        if (this.#prevHadCR) {
            this.#prevHadCR = false;
            if (lfIndex === 0) {
                controller.enqueue(this.#mergeBufs(true));
                this.#handle(chunk.subarray(1), controller);
                return;
            }
        }
        if (lfIndex === -1) {
            if (chunk.at(-1) === CR) {
                this.#prevHadCR = true;
            }
            this.#bufs.add(chunk);
        } else {
            let crOrLfIndex = lfIndex;
            if (chunk[lfIndex - 1] === CR) {
                crOrLfIndex--;
            }
            this.#bufs.add(chunk.subarray(0, crOrLfIndex));
            controller.enqueue(this.#mergeBufs(false));
            this.#handle(chunk.subarray(lfIndex + 1), controller);
        }
    }
     #mergeBufs(prevHadCR) {
        const mergeBuf = this.#bufs.concat();
        this.#bufs = new BytesList();
        if (prevHadCR) {
            return mergeBuf.subarray(0, -1);
        } else {
            return mergeBuf;
        }
    }
}
const MAX_SAFE_COMPONENT_LENGTH = 16;
const re = [];
const src = [];
let R = 0;
const NUMERICIDENTIFIER = R++;
src[NUMERICIDENTIFIER] = "0|[1-9]\\d*";
const NUMERICIDENTIFIERLOOSE = R++;
src[NUMERICIDENTIFIERLOOSE] = "[0-9]+";
const NONNUMERICIDENTIFIER = R++;
src[NONNUMERICIDENTIFIER] = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
const MAINVERSION = R++;
const nid = src[NUMERICIDENTIFIER];
src[MAINVERSION] = `(${nid})\\.(${nid})\\.(${nid})`;
const MAINVERSIONLOOSE = R++;
const nidl = src[NUMERICIDENTIFIERLOOSE];
src[MAINVERSIONLOOSE] = `(${nidl})\\.(${nidl})\\.(${nidl})`;
const PRERELEASEIDENTIFIER = R++;
src[PRERELEASEIDENTIFIER] = "(?:" + src[NUMERICIDENTIFIER] + "|" + src[NONNUMERICIDENTIFIER] + ")";
const PRERELEASEIDENTIFIERLOOSE = R++;
src[PRERELEASEIDENTIFIERLOOSE] = "(?:" + src[NUMERICIDENTIFIERLOOSE] + "|" + src[NONNUMERICIDENTIFIER] + ")";
const PRERELEASE = R++;
src[PRERELEASE] = "(?:-(" + src[PRERELEASEIDENTIFIER] + "(?:\\." + src[PRERELEASEIDENTIFIER] + ")*))";
const PRERELEASELOOSE = R++;
src[PRERELEASELOOSE] = "(?:-?(" + src[PRERELEASEIDENTIFIERLOOSE] + "(?:\\." + src[PRERELEASEIDENTIFIERLOOSE] + ")*))";
const BUILDIDENTIFIER = R++;
src[BUILDIDENTIFIER] = "[0-9A-Za-z-]+";
const BUILD = R++;
src[BUILD] = "(?:\\+(" + src[BUILDIDENTIFIER] + "(?:\\." + src[BUILDIDENTIFIER] + ")*))";
const FULL = R++;
const FULLPLAIN = "v?" + src[MAINVERSION] + src[PRERELEASE] + "?" + src[BUILD] + "?";
src[FULL] = "^" + FULLPLAIN + "$";
const LOOSEPLAIN = "[v=\\s]*" + src[MAINVERSIONLOOSE] + src[PRERELEASELOOSE] + "?" + src[BUILD] + "?";
const LOOSE = R++;
src[LOOSE] = "^" + LOOSEPLAIN + "$";
const GTLT = R++;
src[GTLT] = "((?:<|>)?=?)";
const XRANGEIDENTIFIERLOOSE = R++;
src[XRANGEIDENTIFIERLOOSE] = src[NUMERICIDENTIFIERLOOSE] + "|x|X|\\*";
const XRANGEIDENTIFIER = R++;
src[XRANGEIDENTIFIER] = src[NUMERICIDENTIFIER] + "|x|X|\\*";
const XRANGEPLAIN = R++;
src[XRANGEPLAIN] = "[v=\\s]*(" + src[XRANGEIDENTIFIER] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIER] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIER] + ")" + "(?:" + src[PRERELEASE] + ")?" + src[BUILD] + "?" + ")?)?";
const XRANGEPLAINLOOSE = R++;
src[XRANGEPLAINLOOSE] = "[v=\\s]*(" + src[XRANGEIDENTIFIERLOOSE] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")" + "(?:\\.(" + src[XRANGEIDENTIFIERLOOSE] + ")" + "(?:" + src[PRERELEASELOOSE] + ")?" + src[BUILD] + "?" + ")?)?";
const XRANGE = R++;
src[XRANGE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAIN] + "$";
const XRANGELOOSE = R++;
src[XRANGELOOSE] = "^" + src[GTLT] + "\\s*" + src[XRANGEPLAINLOOSE] + "$";
const COERCE = R++;
src[COERCE] = "(?:^|[^\\d])" + "(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "})" + "(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?" + "(?:\\.(\\d{1," + MAX_SAFE_COMPONENT_LENGTH + "}))?" + "(?:$|[^\\d])";
const LONETILDE = R++;
src[LONETILDE] = "(?:~>?)";
const TILDETRIM = R++;
src[TILDETRIM] = "(\\s*)" + src[LONETILDE] + "\\s+";
re[TILDETRIM] = new RegExp(src[TILDETRIM], "g");
const tildeTrimReplace = "$1~";
const TILDE = R++;
src[TILDE] = "^" + src[LONETILDE] + src[XRANGEPLAIN] + "$";
const TILDELOOSE = R++;
src[TILDELOOSE] = "^" + src[LONETILDE] + src[XRANGEPLAINLOOSE] + "$";
const LONECARET = R++;
src[LONECARET] = "(?:\\^)";
const CARETTRIM = R++;
src[CARETTRIM] = "(\\s*)" + src[LONECARET] + "\\s+";
re[CARETTRIM] = new RegExp(src[CARETTRIM], "g");
const caretTrimReplace = "$1^";
const CARET = R++;
src[CARET] = "^" + src[LONECARET] + src[XRANGEPLAIN] + "$";
const CARETLOOSE = R++;
src[CARETLOOSE] = "^" + src[LONECARET] + src[XRANGEPLAINLOOSE] + "$";
const COMPARATORLOOSE = R++;
src[COMPARATORLOOSE] = "^" + src[GTLT] + "\\s*(" + LOOSEPLAIN + ")$|^$";
const COMPARATOR = R++;
src[COMPARATOR] = "^" + src[GTLT] + "\\s*(" + FULLPLAIN + ")$|^$";
const COMPARATORTRIM = R++;
src[COMPARATORTRIM] = "(\\s*)" + src[GTLT] + "\\s*(" + LOOSEPLAIN + "|" + src[XRANGEPLAIN] + ")";
re[COMPARATORTRIM] = new RegExp(src[COMPARATORTRIM], "g");
const comparatorTrimReplace = "$1$2$3";
const HYPHENRANGE = R++;
src[HYPHENRANGE] = "^\\s*(" + src[XRANGEPLAIN] + ")" + "\\s+-\\s+" + "(" + src[XRANGEPLAIN] + ")" + "\\s*$";
const HYPHENRANGELOOSE = R++;
src[HYPHENRANGELOOSE] = "^\\s*(" + src[XRANGEPLAINLOOSE] + ")" + "\\s+-\\s+" + "(" + src[XRANGEPLAINLOOSE] + ")" + "\\s*$";
const STAR = R++;
src[STAR] = "(<|>)?=?\\s*\\*";
for(let i = 0; i < R; i++){
    if (!re[i]) {
        re[i] = new RegExp(src[i]);
    }
}
class SemVer {
    raw;
    loose;
    options;
    major;
    minor;
    patch;
    version;
    build;
    prerelease;
    constructor(version, optionsOrLoose){
        if (!optionsOrLoose || typeof optionsOrLoose !== "object") {
            optionsOrLoose = {
                loose: !!optionsOrLoose,
                includePrerelease: false
            };
        }
        if (version instanceof SemVer) {
            if (version.loose === optionsOrLoose.loose) {
                return version;
            } else {
                version = version.version;
            }
        } else if (typeof version !== "string") {
            throw new TypeError("Invalid Version: " + version);
        }
        if (version.length > 256) {
            throw new TypeError("version is longer than " + 256 + " characters");
        }
        if (!(this instanceof SemVer)) {
            return new SemVer(version, optionsOrLoose);
        }
        this.options = optionsOrLoose;
        this.loose = !!optionsOrLoose.loose;
        const m = version.trim().match(optionsOrLoose.loose ? re[LOOSE] : re[FULL]);
        if (!m) {
            throw new TypeError("Invalid Version: " + version);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > Number.MAX_SAFE_INTEGER || this.major < 0) {
            throw new TypeError("Invalid major version");
        }
        if (this.minor > Number.MAX_SAFE_INTEGER || this.minor < 0) {
            throw new TypeError("Invalid minor version");
        }
        if (this.patch > Number.MAX_SAFE_INTEGER || this.patch < 0) {
            throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
            this.prerelease = [];
        } else {
            this.prerelease = m[4].split(".").map((id)=>{
                if (/^[0-9]+$/.test(id)) {
                    const num = +id;
                    if (num >= 0 && num < Number.MAX_SAFE_INTEGER) {
                        return num;
                    }
                }
                return id;
            });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
    }
    format() {
        this.version = this.major + "." + this.minor + "." + this.patch;
        if (this.prerelease.length) {
            this.version += "-" + this.prerelease.join(".");
        }
        return this.version;
    }
    compare(other) {
        if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
        }
        return this.compareMain(other) || this.comparePre(other);
    }
    compareMain(other) {
        if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
        }
        return compareIdentifiers(this.major, other.major) || compareIdentifiers(this.minor, other.minor) || compareIdentifiers(this.patch, other.patch);
    }
    comparePre(other) {
        if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
            return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
            return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
            return 0;
        }
        let i1 = 0;
        do {
            const a = this.prerelease[i1];
            const b = other.prerelease[i1];
            if (a === undefined && b === undefined) {
                return 0;
            } else if (b === undefined) {
                return 1;
            } else if (a === undefined) {
                return -1;
            } else if (a === b) {
                continue;
            } else {
                return compareIdentifiers(a, b);
            }
        }while (++i1)
        return 1;
    }
    compareBuild(other) {
        if (!(other instanceof SemVer)) {
            other = new SemVer(other, this.options);
        }
        let i2 = 0;
        do {
            const a = this.build[i2];
            const b = other.build[i2];
            if (a === undefined && b === undefined) {
                return 0;
            } else if (b === undefined) {
                return 1;
            } else if (a === undefined) {
                return -1;
            } else if (a === b) {
                continue;
            } else {
                return compareIdentifiers(a, b);
            }
        }while (++i2)
        return 1;
    }
    inc(release, identifier) {
        switch(release){
            case "premajor":
                this.prerelease.length = 0;
                this.patch = 0;
                this.minor = 0;
                this.major++;
                this.inc("pre", identifier);
                break;
            case "preminor":
                this.prerelease.length = 0;
                this.patch = 0;
                this.minor++;
                this.inc("pre", identifier);
                break;
            case "prepatch":
                this.prerelease.length = 0;
                this.inc("patch", identifier);
                this.inc("pre", identifier);
                break;
            case "prerelease":
                if (this.prerelease.length === 0) {
                    this.inc("patch", identifier);
                }
                this.inc("pre", identifier);
                break;
            case "major":
                if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
                    this.major++;
                }
                this.minor = 0;
                this.patch = 0;
                this.prerelease = [];
                break;
            case "minor":
                if (this.patch !== 0 || this.prerelease.length === 0) {
                    this.minor++;
                }
                this.patch = 0;
                this.prerelease = [];
                break;
            case "patch":
                if (this.prerelease.length === 0) {
                    this.patch++;
                }
                this.prerelease = [];
                break;
            case "pre":
                if (this.prerelease.length === 0) {
                    this.prerelease = [
                        0
                    ];
                } else {
                    let i3 = this.prerelease.length;
                    while(--i3 >= 0){
                        if (typeof this.prerelease[i3] === "number") {
                            this.prerelease[i3]++;
                            i3 = -2;
                        }
                    }
                    if (i3 === -1) {
                        this.prerelease.push(0);
                    }
                }
                if (identifier) {
                    if (this.prerelease[0] === identifier) {
                        if (isNaN(this.prerelease[1])) {
                            this.prerelease = [
                                identifier,
                                0
                            ];
                        }
                    } else {
                        this.prerelease = [
                            identifier,
                            0
                        ];
                    }
                }
                break;
            default:
                throw new Error("invalid increment argument: " + release);
        }
        this.format();
        this.raw = this.version;
        return this;
    }
    toString() {
        return this.version;
    }
}
const numeric = /^[0-9]+$/;
function compareIdentifiers(a, b) {
    const anum = numeric.test(a);
    const bnum = numeric.test(b);
    if (a === null || b === null) throw "Comparison against null invalid";
    if (anum && bnum) {
        a = +a;
        b = +b;
    }
    return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
}
function compare(v1, v2, optionsOrLoose) {
    return new SemVer(v1, optionsOrLoose).compare(new SemVer(v2, optionsOrLoose));
}
function gt(v1, v2, optionsOrLoose) {
    return compare(v1, v2, optionsOrLoose) > 0;
}
function lt(v1, v2, optionsOrLoose) {
    return compare(v1, v2, optionsOrLoose) < 0;
}
function eq(v1, v2, optionsOrLoose) {
    return compare(v1, v2, optionsOrLoose) === 0;
}
function neq(v1, v2, optionsOrLoose) {
    return compare(v1, v2, optionsOrLoose) !== 0;
}
function gte(v1, v2, optionsOrLoose) {
    return compare(v1, v2, optionsOrLoose) >= 0;
}
function lte(v1, v2, optionsOrLoose) {
    return compare(v1, v2, optionsOrLoose) <= 0;
}
function cmp(v1, operator, v2, optionsOrLoose) {
    switch(operator){
        case "===":
            if (typeof v1 === "object") v1 = v1.version;
            if (typeof v2 === "object") v2 = v2.version;
            return v1 === v2;
        case "!==":
            if (typeof v1 === "object") v1 = v1.version;
            if (typeof v2 === "object") v2 = v2.version;
            return v1 !== v2;
        case "":
        case "=":
        case "==":
            return eq(v1, v2, optionsOrLoose);
        case "!=":
            return neq(v1, v2, optionsOrLoose);
        case ">":
            return gt(v1, v2, optionsOrLoose);
        case ">=":
            return gte(v1, v2, optionsOrLoose);
        case "<":
            return lt(v1, v2, optionsOrLoose);
        case "<=":
            return lte(v1, v2, optionsOrLoose);
        default:
            throw new TypeError("Invalid operator: " + operator);
    }
}
const ANY = {};
class Comparator {
    semver;
    operator;
    value;
    loose;
    options;
    constructor(comp, optionsOrLoose){
        if (!optionsOrLoose || typeof optionsOrLoose !== "object") {
            optionsOrLoose = {
                loose: !!optionsOrLoose,
                includePrerelease: false
            };
        }
        if (comp instanceof Comparator) {
            if (comp.loose === !!optionsOrLoose.loose) {
                return comp;
            } else {
                comp = comp.value;
            }
        }
        if (!(this instanceof Comparator)) {
            return new Comparator(comp, optionsOrLoose);
        }
        this.options = optionsOrLoose;
        this.loose = !!optionsOrLoose.loose;
        this.parse(comp);
        if (this.semver === ANY) {
            this.value = "";
        } else {
            this.value = this.operator + this.semver.version;
        }
    }
    parse(comp) {
        const r = this.options.loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
        const m = comp.match(r);
        if (!m) {
            throw new TypeError("Invalid comparator: " + comp);
        }
        const m1 = m[1];
        this.operator = m1 !== undefined ? m1 : "";
        if (this.operator === "=") {
            this.operator = "";
        }
        if (!m[2]) {
            this.semver = ANY;
        } else {
            this.semver = new SemVer(m[2], this.options.loose);
        }
    }
    test(version) {
        if (this.semver === ANY || version === ANY) {
            return true;
        }
        if (typeof version === "string") {
            version = new SemVer(version, this.options);
        }
        return cmp(version, this.operator, this.semver, this.options);
    }
    intersects(comp, optionsOrLoose) {
        if (!(comp instanceof Comparator)) {
            throw new TypeError("a Comparator is required");
        }
        if (!optionsOrLoose || typeof optionsOrLoose !== "object") {
            optionsOrLoose = {
                loose: !!optionsOrLoose,
                includePrerelease: false
            };
        }
        let rangeTmp;
        if (this.operator === "") {
            if (this.value === "") {
                return true;
            }
            rangeTmp = new Range(comp.value, optionsOrLoose);
            return satisfies(this.value, rangeTmp, optionsOrLoose);
        } else if (comp.operator === "") {
            if (comp.value === "") {
                return true;
            }
            rangeTmp = new Range(this.value, optionsOrLoose);
            return satisfies(comp.semver, rangeTmp, optionsOrLoose);
        }
        const sameDirectionIncreasing = (this.operator === ">=" || this.operator === ">") && (comp.operator === ">=" || comp.operator === ">");
        const sameDirectionDecreasing = (this.operator === "<=" || this.operator === "<") && (comp.operator === "<=" || comp.operator === "<");
        const sameSemVer = this.semver.version === comp.semver.version;
        const differentDirectionsInclusive = (this.operator === ">=" || this.operator === "<=") && (comp.operator === ">=" || comp.operator === "<=");
        const oppositeDirectionsLessThan = cmp(this.semver, "<", comp.semver, optionsOrLoose) && (this.operator === ">=" || this.operator === ">") && (comp.operator === "<=" || comp.operator === "<");
        const oppositeDirectionsGreaterThan = cmp(this.semver, ">", comp.semver, optionsOrLoose) && (this.operator === "<=" || this.operator === "<") && (comp.operator === ">=" || comp.operator === ">");
        return sameDirectionIncreasing || sameDirectionDecreasing || sameSemVer && differentDirectionsInclusive || oppositeDirectionsLessThan || oppositeDirectionsGreaterThan;
    }
    toString() {
        return this.value;
    }
}
class Range {
    range;
    raw;
    loose;
    options;
    includePrerelease;
    set;
    constructor(range1, optionsOrLoose){
        if (!optionsOrLoose || typeof optionsOrLoose !== "object") {
            optionsOrLoose = {
                loose: !!optionsOrLoose,
                includePrerelease: false
            };
        }
        if (range1 instanceof Range) {
            if (range1.loose === !!optionsOrLoose.loose && range1.includePrerelease === !!optionsOrLoose.includePrerelease) {
                return range1;
            } else {
                return new Range(range1.raw, optionsOrLoose);
            }
        }
        if (range1 instanceof Comparator) {
            return new Range(range1.value, optionsOrLoose);
        }
        if (!(this instanceof Range)) {
            return new Range(range1, optionsOrLoose);
        }
        this.options = optionsOrLoose;
        this.loose = !!optionsOrLoose.loose;
        this.includePrerelease = !!optionsOrLoose.includePrerelease;
        this.raw = range1;
        this.set = range1.split(/\s*\|\|\s*/).map((range)=>this.parseRange(range.trim())
        ).filter((c)=>{
            return c.length;
        });
        if (!this.set.length) {
            throw new TypeError("Invalid SemVer Range: " + range1);
        }
        this.format();
    }
    format() {
        this.range = this.set.map((comps)=>comps.join(" ").trim()
        ).join("||").trim();
        return this.range;
    }
    parseRange(range) {
        const loose = this.options.loose;
        range = range.trim();
        const hr = loose ? re[HYPHENRANGELOOSE] : re[HYPHENRANGE];
        range = range.replace(hr, hyphenReplace);
        range = range.replace(re[COMPARATORTRIM], comparatorTrimReplace);
        range = range.replace(re[TILDETRIM], tildeTrimReplace);
        range = range.replace(re[CARETTRIM], caretTrimReplace);
        range = range.split(/\s+/).join(" ");
        const compRe = loose ? re[COMPARATORLOOSE] : re[COMPARATOR];
        let set = range.split(" ").map((comp)=>parseComparator(comp, this.options)
        ).join(" ").split(/\s+/);
        if (this.options.loose) {
            set = set.filter((comp)=>{
                return !!comp.match(compRe);
            });
        }
        return set.map((comp)=>new Comparator(comp, this.options)
        );
    }
    test(version) {
        if (typeof version === "string") {
            version = new SemVer(version, this.options);
        }
        for(var i4 = 0; i4 < this.set.length; i4++){
            if (testSet(this.set[i4], version, this.options)) {
                return true;
            }
        }
        return false;
    }
    intersects(range, optionsOrLoose) {
        if (!(range instanceof Range)) {
            throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators)=>{
            return isSatisfiable(thisComparators, optionsOrLoose) && range.set.some((rangeComparators)=>{
                return isSatisfiable(rangeComparators, optionsOrLoose) && thisComparators.every((thisComparator)=>{
                    return rangeComparators.every((rangeComparator)=>{
                        return thisComparator.intersects(rangeComparator, optionsOrLoose);
                    });
                });
            });
        });
    }
    toString() {
        return this.range;
    }
}
function testSet(set, version, options) {
    for(let i5 = 0; i5 < set.length; i5++){
        if (!set[i5].test(version)) {
            return false;
        }
    }
    if (version.prerelease.length && !options.includePrerelease) {
        for(let i6 = 0; i6 < set.length; i6++){
            if (set[i6].semver === ANY) {
                continue;
            }
            if (set[i6].semver.prerelease.length > 0) {
                const allowed = set[i6].semver;
                if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
                    return true;
                }
            }
        }
        return false;
    }
    return true;
}
function isSatisfiable(comparators, options) {
    let result = true;
    const remainingComparators = comparators.slice();
    let testComparator = remainingComparators.pop();
    while(result && remainingComparators.length){
        result = remainingComparators.every((otherComparator)=>{
            return testComparator?.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
    }
    return result;
}
function parseComparator(comp, options) {
    comp = replaceCarets(comp, options);
    comp = replaceTildes(comp, options);
    comp = replaceXRanges(comp, options);
    comp = replaceStars(comp, options);
    return comp;
}
function isX(id) {
    return !id || id.toLowerCase() === "x" || id === "*";
}
function replaceTildes(comp1, options) {
    return comp1.trim().split(/\s+/).map((comp)=>replaceTilde(comp, options)
    ).join(" ");
}
function replaceTilde(comp, options) {
    const r = options.loose ? re[TILDELOOSE] : re[TILDE];
    return comp.replace(r, (_, M, m, p, pr)=>{
        let ret;
        if (isX(M)) {
            ret = "";
        } else if (isX(m)) {
            ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
            ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
        } else if (pr) {
            ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
        } else {
            ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
        }
        return ret;
    });
}
function replaceCarets(comp2, options) {
    return comp2.trim().split(/\s+/).map((comp)=>replaceCaret(comp, options)
    ).join(" ");
}
function replaceCaret(comp, options) {
    const r = options.loose ? re[CARETLOOSE] : re[CARET];
    return comp.replace(r, (_, M, m, p, pr)=>{
        let ret;
        if (isX(M)) {
            ret = "";
        } else if (isX(m)) {
            ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (isX(p)) {
            if (M === "0") {
                ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
            } else {
                ret = ">=" + M + "." + m + ".0 <" + (+M + 1) + ".0.0";
            }
        } else if (pr) {
            if (M === "0") {
                if (m === "0") {
                    ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + m + "." + (+p + 1);
                } else {
                    ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + M + "." + (+m + 1) + ".0";
                }
            } else {
                ret = ">=" + M + "." + m + "." + p + "-" + pr + " <" + (+M + 1) + ".0.0";
            }
        } else {
            if (M === "0") {
                if (m === "0") {
                    ret = ">=" + M + "." + m + "." + p + " <" + M + "." + m + "." + (+p + 1);
                } else {
                    ret = ">=" + M + "." + m + "." + p + " <" + M + "." + (+m + 1) + ".0";
                }
            } else {
                ret = ">=" + M + "." + m + "." + p + " <" + (+M + 1) + ".0.0";
            }
        }
        return ret;
    });
}
function replaceXRanges(comp3, options) {
    return comp3.split(/\s+/).map((comp)=>replaceXRange(comp, options)
    ).join(" ");
}
function replaceXRange(comp, options) {
    comp = comp.trim();
    const r = options.loose ? re[XRANGELOOSE] : re[XRANGE];
    return comp.replace(r, (ret, gtlt, M, m, p, pr)=>{
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
            gtlt = "";
        }
        if (xM) {
            if (gtlt === ">" || gtlt === "<") {
                ret = "<0.0.0";
            } else {
                ret = "*";
            }
        } else if (gtlt && anyX) {
            if (xm) {
                m = 0;
            }
            p = 0;
            if (gtlt === ">") {
                gtlt = ">=";
                if (xm) {
                    M = +M + 1;
                    m = 0;
                    p = 0;
                } else {
                    m = +m + 1;
                    p = 0;
                }
            } else if (gtlt === "<=") {
                gtlt = "<";
                if (xm) {
                    M = +M + 1;
                } else {
                    m = +m + 1;
                }
            }
            ret = gtlt + M + "." + m + "." + p;
        } else if (xm) {
            ret = ">=" + M + ".0.0 <" + (+M + 1) + ".0.0";
        } else if (xp) {
            ret = ">=" + M + "." + m + ".0 <" + M + "." + (+m + 1) + ".0";
        }
        return ret;
    });
}
function replaceStars(comp, options) {
    return comp.trim().replace(re[STAR], "");
}
function hyphenReplace($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr, tb) {
    if (isX(fM)) {
        from = "";
    } else if (isX(fm)) {
        from = ">=" + fM + ".0.0";
    } else if (isX(fp)) {
        from = ">=" + fM + "." + fm + ".0";
    } else {
        from = ">=" + from;
    }
    if (isX(tM)) {
        to = "";
    } else if (isX(tm)) {
        to = "<" + (+tM + 1) + ".0.0";
    } else if (isX(tp)) {
        to = "<" + tM + "." + (+tm + 1) + ".0";
    } else if (tpr) {
        to = "<=" + tM + "." + tm + "." + tp + "-" + tpr;
    } else {
        to = "<=" + to;
    }
    return (from + " " + to).trim();
}
function satisfies(version, range, optionsOrLoose) {
    try {
        range = new Range(range, optionsOrLoose);
    } catch (er) {
        return false;
    }
    return range.test(version);
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
function run(str, code1) {
    return enabled ? `${code1.open}${str.replace(code1.regexp, code1.open)}${code1.close}` : str;
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
            color >> 16 & 255,
            color >> 8 & 255,
            color & 255
        ], 39));
    }
    return run(str, code([
        38,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b), 
    ], 39));
}
function bgRgb24(str, color) {
    if (typeof color === "number") {
        return run(str, code([
            48,
            2,
            color >> 16 & 255,
            color >> 8 & 255,
            color & 255
        ], 49));
    }
    return run(str, code([
        48,
        2,
        clampAndTruncate(color.r),
        clampAndTruncate(color.g),
        clampAndTruncate(color.b), 
    ], 49));
}
const ANSI_PATTERN = new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))", 
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
new TextEncoder();
const mac = (await Deno.permissions.query({
    name: "env"
})).state === "granted" ? Deno.env.get("TERM_PROGRAM") === "Apple_Terminal" : false;
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
await async function() {
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
        HOME: HOME
    };
}();
let supported = true;
if ((await Deno.permissions.query({
    name: "env"
})).state === "granted") {
    supported = supported && (!!Deno.env.get("CI") || Deno.env.get("TERM") === "xterm-256color");
}
({
    info: mod2.blue("ℹ"),
    success: mod2.green("✔"),
    warning: mod2.yellow("⚠"),
    error: mod2.red("✖")
});
({
    info: mod2.blue("i"),
    success: mod2.green("√"),
    warning: mod2.yellow("‼"),
    error: mod2.red("×")
});
new TextEncoder();
({
    black: mod2.black,
    red: mod2.red,
    green: mod2.green,
    yellow: mod2.yellow,
    blue: mod2.blue,
    magenta: mod2.magenta,
    cyan: mod2.cyan,
    white: mod2.white,
    gray: mod2.gray
});
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
        } catch (err) {
            throw `Failed to open ${diagnosticName} file at '${entrypointSpecifier}': ${err.message}`;
        }
    }
    return entrypointSpecifier;
}
class APIError extends Error {
    code;
    name = "APIError";
    constructor(code16, message){
        super(message);
        this.code = code16;
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
    async #request(path25, opts = {}) {
        const url = `${this.#endpoint}/api${path25}`;
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
    async #requestJson(path110, opts1) {
        const res = await this.#request(path110, opts1);
        if (res.headers.get("Content-Type") !== "application/json") {
            const text = await res.text();
            throw new Error(`Expected JSON, got '${text}'`);
        }
        const json = await res.json();
        if (res.status !== 200) {
            throw new APIError(json.code, json.message);
        }
        return json;
    }
    async *#requestStream(path2, opts2) {
        const res = await this.#request(path2, opts2);
        if (res.status !== 200) {
            const json = await res.json();
            throw new APIError(json.code, json.message);
        }
        if (res.body === null) {
            throw new Error("Stream ended unexpectedly");
        }
        const lines = res.body.pipeThrough(new LineStream());
        for await (const chunk of lines){
            const line = new TextDecoder().decode(chunk);
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
    const hashHex = Array.from(new Uint8Array(hashBytes)).map((b)=>b.toString(16).padStart(2, "0")
    ).join("");
    return hashHex;
}
function include(path26, include1, exclude) {
    if (include1 && !include1.some((pattern)=>path26.startsWith(pattern)
    )) {
        return false;
    }
    if (exclude && exclude.some((pattern)=>path26.startsWith(pattern)
    )) {
        return false;
    }
    return true;
}
async function walk(cwd, dir, files, options) {
    const entries = {};
    for await (const file of Deno.readDir(dir)){
        const path27 = join3(dir, file.name);
        const relative3 = path27.slice(cwd.length);
        if (!include(path27.slice(cwd.length + 1), options.include, options.exclude)) {
            continue;
        }
        let entry;
        if (file.isFile) {
            const data = await Deno.readFile(path27);
            const gitSha1 = await calculateGitSha1(data);
            entry = {
                kind: "file",
                gitSha1,
                size: data.byteLength
            };
            files.set(gitSha1, path27);
        } else if (file.isDirectory) {
            if (relative3 === "/.git") continue;
            entry = {
                kind: "directory",
                entries: await walk(cwd, path27, files, options)
            };
        } else if (file.isSymlink) {
            const target = await Deno.readLink(path27);
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
export { fromFileUrl2 as fromFileUrl, resolve2 as resolve };

