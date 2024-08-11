// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno task build-action` and it's not recommended to edit it manually

function assertPath(path) {
    if (typeof path !== "string") {
        throw new TypeError(`Path must be a string. Received ${JSON.stringify(path)}`);
    }
}
const CHAR_FORWARD_SLASH = 47;
function isPathSeparator(code) {
    return code === 47 || code === 92;
}
function isWindowsDeviceRoot(code) {
    return code >= 97 && code <= 122 || code >= 65 && code <= 90;
}
function assertArg(url) {
    url = url instanceof URL ? url : new URL(url);
    if (url.protocol !== "file:") {
        throw new TypeError("Must be a file URL.");
    }
    return url;
}
function fromFileUrl(url) {
    url = assertArg(url);
    let path = decodeURIComponent(url.pathname.replace(/\//g, "\\").replace(/%(?![0-9A-Fa-f]{2})/g, "%25")).replace(/^\\*([A-Za-z]:)(\\|$)/, "$1\\");
    if (url.hostname !== "") {
        path = `\\\\${url.hostname}${path}`;
    }
    return path;
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
class AssertionError extends Error {
    constructor(message){
        super(message);
        this.name = "AssertionError";
    }
}
function assert(expr, msg = "") {
    if (!expr) {
        throw new AssertionError(msg);
    }
}
function assertArg1(path) {
    assertPath(path);
    if (path.length === 0) return ".";
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
function normalize(path) {
    assertArg1(path);
    const len = path.length;
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
function join(...paths) {
    if (paths.length === 0) return ".";
    let joined;
    let firstPart = null;
    for(let i = 0; i < paths.length; ++i){
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
    assert(firstPart !== null);
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
function resolve(...pathSegments) {
    let resolvedDevice = "";
    let resolvedTail = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1; i--){
        let path;
        const { Deno: Deno1 } = globalThis;
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
function toFileUrl(path) {
    if (!isAbsolute(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const [, hostname, pathname] = path.match(/^(?:[/\\]{2}([^/\\]+)(?=[/\\](?:[^/\\]|$)))?(.*)/);
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(pathname.replace(/%/g, "%25"));
    if (hostname !== undefined && hostname !== "localhost") {
        url.hostname = hostname;
        if (!url.hostname) {
            throw new TypeError("Invalid hostname.");
        }
    }
    return url;
}
const regExpEscapeChars = [
    "!",
    "$",
    "(",
    ")",
    "*",
    "+",
    ".",
    "=",
    "?",
    "[",
    "\\",
    "^",
    "{",
    "|"
];
const rangeEscapeChars = [
    "-",
    "\\",
    "]"
];
function _globToRegExp(c, glob, { extended = true, globstar: globstarOption = true, caseInsensitive = false } = {}) {
    if (glob === "") {
        return /(?!)/;
    }
    let newLength = glob.length;
    for(; newLength > 1 && c.seps.includes(glob[newLength - 1]); newLength--);
    glob = glob.slice(0, newLength);
    let regExpString = "";
    for(let j = 0; j < glob.length;){
        let segment = "";
        const groupStack = [];
        let inRange = false;
        let inEscape = false;
        let endsWithSep = false;
        let i = j;
        for(; i < glob.length && !c.seps.includes(glob[i]); i++){
            if (inEscape) {
                inEscape = false;
                const escapeChars = inRange ? rangeEscapeChars : regExpEscapeChars;
                segment += escapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
                continue;
            }
            if (glob[i] === c.escapePrefix) {
                inEscape = true;
                continue;
            }
            if (glob[i] === "[") {
                if (!inRange) {
                    inRange = true;
                    segment += "[";
                    if (glob[i + 1] === "!") {
                        i++;
                        segment += "^";
                    } else if (glob[i + 1] === "^") {
                        i++;
                        segment += "\\^";
                    }
                    continue;
                } else if (glob[i + 1] === ":") {
                    let k = i + 1;
                    let value = "";
                    while(glob[k + 1] !== undefined && glob[k + 1] !== ":"){
                        value += glob[k + 1];
                        k++;
                    }
                    if (glob[k + 1] === ":" && glob[k + 2] === "]") {
                        i = k + 2;
                        if (value === "alnum") segment += "\\dA-Za-z";
                        else if (value === "alpha") segment += "A-Za-z";
                        else if (value === "ascii") segment += "\x00-\x7F";
                        else if (value === "blank") segment += "\t ";
                        else if (value === "cntrl") segment += "\x00-\x1F\x7F";
                        else if (value === "digit") segment += "\\d";
                        else if (value === "graph") segment += "\x21-\x7E";
                        else if (value === "lower") segment += "a-z";
                        else if (value === "print") segment += "\x20-\x7E";
                        else if (value === "punct") {
                            segment += "!\"#$%&'()*+,\\-./:;<=>?@[\\\\\\]^_‘{|}~";
                        } else if (value === "space") segment += "\\s\v";
                        else if (value === "upper") segment += "A-Z";
                        else if (value === "word") segment += "\\w";
                        else if (value === "xdigit") segment += "\\dA-Fa-f";
                        continue;
                    }
                }
            }
            if (glob[i] === "]" && inRange) {
                inRange = false;
                segment += "]";
                continue;
            }
            if (inRange) {
                if (glob[i] === "\\") {
                    segment += `\\\\`;
                } else {
                    segment += glob[i];
                }
                continue;
            }
            if (glob[i] === ")" && groupStack.length > 0 && groupStack[groupStack.length - 1] !== "BRACE") {
                segment += ")";
                const type = groupStack.pop();
                if (type === "!") {
                    segment += c.wildcard;
                } else if (type !== "@") {
                    segment += type;
                }
                continue;
            }
            if (glob[i] === "|" && groupStack.length > 0 && groupStack[groupStack.length - 1] !== "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] === "+" && extended && glob[i + 1] === "(") {
                i++;
                groupStack.push("+");
                segment += "(?:";
                continue;
            }
            if (glob[i] === "@" && extended && glob[i + 1] === "(") {
                i++;
                groupStack.push("@");
                segment += "(?:";
                continue;
            }
            if (glob[i] === "?") {
                if (extended && glob[i + 1] === "(") {
                    i++;
                    groupStack.push("?");
                    segment += "(?:";
                } else {
                    segment += ".";
                }
                continue;
            }
            if (glob[i] === "!" && extended && glob[i + 1] === "(") {
                i++;
                groupStack.push("!");
                segment += "(?!";
                continue;
            }
            if (glob[i] === "{") {
                groupStack.push("BRACE");
                segment += "(?:";
                continue;
            }
            if (glob[i] === "}" && groupStack[groupStack.length - 1] === "BRACE") {
                groupStack.pop();
                segment += ")";
                continue;
            }
            if (glob[i] === "," && groupStack[groupStack.length - 1] === "BRACE") {
                segment += "|";
                continue;
            }
            if (glob[i] === "*") {
                if (extended && glob[i + 1] === "(") {
                    i++;
                    groupStack.push("*");
                    segment += "(?:";
                } else {
                    const prevChar = glob[i - 1];
                    let numStars = 1;
                    while(glob[i + 1] === "*"){
                        i++;
                        numStars++;
                    }
                    const nextChar = glob[i + 1];
                    if (globstarOption && numStars === 2 && [
                        ...c.seps,
                        undefined
                    ].includes(prevChar) && [
                        ...c.seps,
                        undefined
                    ].includes(nextChar)) {
                        segment += c.globstar;
                        endsWithSep = true;
                    } else {
                        segment += c.wildcard;
                    }
                }
                continue;
            }
            segment += regExpEscapeChars.includes(glob[i]) ? `\\${glob[i]}` : glob[i];
        }
        if (groupStack.length > 0 || inRange || inEscape) {
            segment = "";
            for (const c of glob.slice(j, i)){
                segment += regExpEscapeChars.includes(c) ? `\\${c}` : c;
                endsWithSep = false;
            }
        }
        regExpString += segment;
        if (!endsWithSep) {
            regExpString += i < glob.length ? c.sep : c.sepMaybe;
            endsWithSep = true;
        }
        while(c.seps.includes(glob[i]))i++;
        if (!(i > j)) {
            throw new Error("Assertion failure: i > j (potential infinite loop)");
        }
        j = i;
    }
    regExpString = `^${regExpString}$`;
    return new RegExp(regExpString, caseInsensitive ? "i" : "");
}
const constants = {
    sep: "(?:\\\\|/)+",
    sepMaybe: "(?:\\\\|/)*",
    seps: [
        "\\",
        "/"
    ],
    globstar: "(?:[^\\\\/]*(?:\\\\|/|$)+)*",
    wildcard: "[^\\\\/]*",
    escapePrefix: "`"
};
function globToRegExp(glob, options = {}) {
    return _globToRegExp(constants, glob, options);
}
function isGlob(str) {
    const chars = {
        "{": "}",
        "(": ")",
        "[": "]"
    };
    const regex = /\\(.)|(^!|\*|\?|[\].+)]\?|\[[^\\\]]+\]|\{[^\\}]+\}|\(\?[:!=][^\\)]+\)|\([^|]+\|[^\\)]+\))/;
    if (str === "") {
        return false;
    }
    let match;
    while(match = regex.exec(str)){
        if (match[2]) return true;
        let idx = match.index + match[0].length;
        const open = match[1];
        const close = open ? chars[open] : null;
        if (open && close) {
            const n = str.indexOf(close, idx);
            if (n !== -1) {
                idx = n + 1;
            }
        }
        str = str.slice(idx);
    }
    return false;
}
function isPosixPathSeparator(code) {
    return code === 47;
}
function fromFileUrl1(url) {
    url = assertArg(url);
    return decodeURIComponent(url.pathname.replace(/%(?![0-9A-Fa-f]{2})/g, "%25"));
}
function isAbsolute1(path) {
    assertPath(path);
    return path.length > 0 && isPosixPathSeparator(path.charCodeAt(0));
}
function normalize1(path) {
    assertArg1(path);
    const isAbsolute = isPosixPathSeparator(path.charCodeAt(0));
    const trailingSeparator = isPosixPathSeparator(path.charCodeAt(path.length - 1));
    path = normalizeString(path, !isAbsolute, "/", isPosixPathSeparator);
    if (path.length === 0 && !isAbsolute) path = ".";
    if (path.length > 0 && trailingSeparator) path += "/";
    if (isAbsolute) return `/${path}`;
    return path;
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
function resolve1(...pathSegments) {
    let resolvedPath = "";
    let resolvedAbsolute = false;
    for(let i = pathSegments.length - 1; i >= -1 && !resolvedAbsolute; i--){
        let path;
        if (i >= 0) path = pathSegments[i];
        else {
            const { Deno: Deno1 } = globalThis;
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
        resolvedAbsolute = isPosixPathSeparator(path.charCodeAt(0));
    }
    resolvedPath = normalizeString(resolvedPath, !resolvedAbsolute, "/", isPosixPathSeparator);
    if (resolvedAbsolute) {
        if (resolvedPath.length > 0) return `/${resolvedPath}`;
        else return "/";
    } else if (resolvedPath.length > 0) return resolvedPath;
    else return ".";
}
function toFileUrl1(path) {
    if (!isAbsolute1(path)) {
        throw new TypeError("Must be an absolute path.");
    }
    const url = new URL("file:///");
    url.pathname = encodeWhitespace(path.replace(/%/g, "%25").replace(/\\/g, "%5C"));
    return url;
}
const constants1 = {
    sep: "/+",
    sepMaybe: "/*",
    seps: [
        "/"
    ],
    globstar: "(?:[^/]*(?:/|$)+)*",
    wildcard: "[^/]*",
    escapePrefix: "\\"
};
function globToRegExp1(glob, options = {}) {
    return _globToRegExp(constants1, glob, options);
}
const osType = (()=>{
    const { Deno: Deno1 } = globalThis;
    if (typeof Deno1?.build?.os === "string") {
        return Deno1.build.os;
    }
    const { navigator } = globalThis;
    if (navigator?.appVersion?.includes?.("Win")) {
        return "windows";
    }
    return "linux";
})();
const isWindows = osType === "windows";
function fromFileUrl2(url) {
    return isWindows ? fromFileUrl(url) : fromFileUrl1(url);
}
function join2(...paths) {
    return isWindows ? join(...paths) : join1(...paths);
}
function normalize2(path) {
    return isWindows ? normalize(path) : normalize1(path);
}
function resolve2(...pathSegments) {
    return isWindows ? resolve(...pathSegments) : resolve1(...pathSegments);
}
function toFileUrl2(path) {
    return isWindows ? toFileUrl(path) : toFileUrl1(path);
}
function globToRegExp2(glob, options = {}) {
    return options.os === "windows" || !options.os && isWindows ? globToRegExp(glob, options) : globToRegExp1(glob, options);
}
const { Deno: Deno1 } = globalThis;
typeof Deno1?.noColor === "boolean" ? Deno1.noColor : false;
new RegExp([
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TXZcf-nq-uy=><~]))"
].join("|"), "g");
const { hasOwn } = Object;
class TextLineStream extends TransformStream {
    #currentLine = "";
    constructor(options = {
        allowCR: false
    }){
        super({
            transform: (chars, controller)=>{
                chars = this.#currentLine + chars;
                while(true){
                    const lfIndex = chars.indexOf("\n");
                    const crIndex = options.allowCR ? chars.indexOf("\r") : -1;
                    if (crIndex !== -1 && crIndex !== chars.length - 1 && (lfIndex === -1 || lfIndex - 1 > crIndex)) {
                        controller.enqueue(chars.slice(0, crIndex));
                        chars = chars.slice(crIndex + 1);
                        continue;
                    }
                    if (lfIndex === -1) break;
                    const endIndex = chars[lfIndex - 1] === "\r" ? lfIndex - 1 : lfIndex;
                    controller.enqueue(chars.slice(0, endIndex));
                    chars = chars.slice(lfIndex + 1);
                }
                this.#currentLine = chars;
            },
            flush: (controller)=>{
                if (this.#currentLine === "") return;
                const currentLine = options.allowCR && this.#currentLine.endsWith("\r") ? this.#currentLine.slice(0, -1) : this.#currentLine;
                controller.enqueue(currentLine);
            }
        });
    }
}
const originalJSONParse = globalThis.JSON.parse;
class JSONCParser {
    #whitespace = new Set(" \t\r\n");
    #numberEndToken = new Set([
        ..."[]{}:,/",
        ...this.#whitespace
    ]);
    #text;
    #length;
    #tokenized;
    #options;
    constructor(text, options){
        this.#text = `${text}`;
        this.#length = this.#text.length;
        this.#tokenized = this.#tokenize();
        this.#options = options;
    }
    parse() {
        const token = this.#getNext();
        const res = this.#parseJsonValue(token);
        const { done, value } = this.#tokenized.next();
        if (!done) {
            throw new SyntaxError(buildErrorMessage(value));
        }
        return res;
    }
    #getNext() {
        const { done, value } = this.#tokenized.next();
        if (done) {
            throw new SyntaxError("Unexpected end of JSONC input");
        }
        return value;
    }
    *#tokenize() {
        for(let i = 0; i < this.#length; i++){
            if (this.#whitespace.has(this.#text[i])) {
                continue;
            }
            if (this.#text[i] === "/" && this.#text[i + 1] === "*") {
                i += 2;
                let hasEndOfComment = false;
                for(; i < this.#length; i++){
                    if (this.#text[i] === "*" && this.#text[i + 1] === "/") {
                        hasEndOfComment = true;
                        break;
                    }
                }
                if (!hasEndOfComment) {
                    throw new SyntaxError("Unexpected end of JSONC input");
                }
                i++;
                continue;
            }
            if (this.#text[i] === "/" && this.#text[i + 1] === "/") {
                i += 2;
                for(; i < this.#length; i++){
                    if (this.#text[i] === "\n" || this.#text[i] === "\r") {
                        break;
                    }
                }
                continue;
            }
            switch(this.#text[i]){
                case "{":
                    yield {
                        type: "BeginObject",
                        position: i
                    };
                    break;
                case "}":
                    yield {
                        type: "EndObject",
                        position: i
                    };
                    break;
                case "[":
                    yield {
                        type: "BeginArray",
                        position: i
                    };
                    break;
                case "]":
                    yield {
                        type: "EndArray",
                        position: i
                    };
                    break;
                case ":":
                    yield {
                        type: "NameSeparator",
                        position: i
                    };
                    break;
                case ",":
                    yield {
                        type: "ValueSeparator",
                        position: i
                    };
                    break;
                case '"':
                    {
                        const startIndex = i;
                        let shouldEscapeNext = false;
                        i++;
                        for(; i < this.#length; i++){
                            if (this.#text[i] === '"' && !shouldEscapeNext) {
                                break;
                            }
                            shouldEscapeNext = this.#text[i] === "\\" && !shouldEscapeNext;
                        }
                        yield {
                            type: "String",
                            sourceText: this.#text.substring(startIndex, i + 1),
                            position: startIndex
                        };
                        break;
                    }
                default:
                    {
                        const startIndex = i;
                        for(; i < this.#length; i++){
                            if (this.#numberEndToken.has(this.#text[i])) {
                                break;
                            }
                        }
                        i--;
                        yield {
                            type: "NullOrTrueOrFalseOrNumber",
                            sourceText: this.#text.substring(startIndex, i + 1),
                            position: startIndex
                        };
                    }
            }
        }
    }
    #parseJsonValue(value) {
        switch(value.type){
            case "BeginObject":
                return this.#parseObject();
            case "BeginArray":
                return this.#parseArray();
            case "NullOrTrueOrFalseOrNumber":
                return this.#parseNullOrTrueOrFalseOrNumber(value);
            case "String":
                return this.#parseString(value);
            default:
                throw new SyntaxError(buildErrorMessage(value));
        }
    }
    #parseObject() {
        const target = {};
        for(let isFirst = true;; isFirst = false){
            const token1 = this.#getNext();
            if ((isFirst || this.#options.allowTrailingComma) && token1.type === "EndObject") {
                return target;
            }
            if (token1.type !== "String") {
                throw new SyntaxError(buildErrorMessage(token1));
            }
            const key = this.#parseString(token1);
            const token2 = this.#getNext();
            if (token2.type !== "NameSeparator") {
                throw new SyntaxError(buildErrorMessage(token2));
            }
            const token3 = this.#getNext();
            Object.defineProperty(target, key, {
                value: this.#parseJsonValue(token3),
                writable: true,
                enumerable: true,
                configurable: true
            });
            const token4 = this.#getNext();
            if (token4.type === "EndObject") {
                return target;
            }
            if (token4.type !== "ValueSeparator") {
                throw new SyntaxError(buildErrorMessage(token4));
            }
        }
    }
    #parseArray() {
        const target = [];
        for(let isFirst = true;; isFirst = false){
            const token1 = this.#getNext();
            if ((isFirst || this.#options.allowTrailingComma) && token1.type === "EndArray") {
                return target;
            }
            target.push(this.#parseJsonValue(token1));
            const token2 = this.#getNext();
            if (token2.type === "EndArray") {
                return target;
            }
            if (token2.type !== "ValueSeparator") {
                throw new SyntaxError(buildErrorMessage(token2));
            }
        }
    }
    #parseString(value) {
        let parsed;
        try {
            parsed = originalJSONParse(value.sourceText);
        } catch  {
            throw new SyntaxError(buildErrorMessage(value));
        }
        assert(typeof parsed === "string");
        return parsed;
    }
    #parseNullOrTrueOrFalseOrNumber(value) {
        if (value.sourceText === "null") {
            return null;
        }
        if (value.sourceText === "true") {
            return true;
        }
        if (value.sourceText === "false") {
            return false;
        }
        let parsed;
        try {
            parsed = originalJSONParse(value.sourceText);
        } catch  {
            throw new SyntaxError(buildErrorMessage(value));
        }
        assert(typeof parsed === "number");
        return parsed;
    }
}
function buildErrorMessage({ type, sourceText, position }) {
    let token = "";
    switch(type){
        case "BeginObject":
            token = "{";
            break;
        case "EndObject":
            token = "}";
            break;
        case "BeginArray":
            token = "[";
            break;
        case "EndArray":
            token = "]";
            break;
        case "NameSeparator":
            token = ":";
            break;
        case "ValueSeparator":
            token = ",";
            break;
        case "NullOrTrueOrFalseOrNumber":
        case "String":
            token = 30 < sourceText.length ? `${sourceText.slice(0, 30)}...` : sourceText;
            break;
        default:
            throw new Error("unreachable");
    }
    return `Unexpected token ${token} in JSONC at position ${position}`;
}
new TextEncoder();
new TextEncoder().encode("0123456789abcdef");
new TextEncoder();
new TextDecoder();
function delay(ms, options = {}) {
    const { signal, persistent } = options;
    if (signal?.aborted) return Promise.reject(signal.reason);
    return new Promise((resolve, reject)=>{
        const abort = ()=>{
            clearTimeout(i);
            reject(signal?.reason);
        };
        const done = ()=>{
            signal?.removeEventListener("abort", abort);
            resolve();
        };
        const i = setTimeout(done, ms);
        signal?.addEventListener("abort", abort, {
            once: true
        });
        if (persistent === false) {
            try {
                Deno.unrefTimer(i);
            } catch (error) {
                if (!(error instanceof ReferenceError)) {
                    throw error;
                }
                console.error("`persistent` option is only available in Deno");
            }
        }
    });
}
var _computedKey;
_computedKey = Symbol.asyncIterator;
class MuxAsyncIterator {
    #iteratorCount = 0;
    #yields = [];
    #throws = [];
    #signal = Promise.withResolvers();
    add(iterable) {
        ++this.#iteratorCount;
        this.#callIteratorNext(iterable[Symbol.asyncIterator]());
    }
    async #callIteratorNext(iterator) {
        try {
            const { value, done } = await iterator.next();
            if (done) {
                --this.#iteratorCount;
            } else {
                this.#yields.push({
                    iterator,
                    value
                });
            }
        } catch (e) {
            this.#throws.push(e);
        }
        this.#signal.resolve();
    }
    async *iterate() {
        while(this.#iteratorCount > 0){
            await this.#signal.promise;
            for (const { iterator, value } of this.#yields){
                yield value;
                this.#callIteratorNext(iterator);
            }
            if (this.#throws.length) {
                for (const e of this.#throws){
                    throw e;
                }
                this.#throws.length = 0;
            }
            this.#yields.length = 0;
            this.#signal = Promise.withResolvers();
        }
    }
    [_computedKey]() {
        return this.iterate();
    }
}
function compareNumber(a, b) {
    if (isNaN(a) || isNaN(b)) throw new Error("Comparison against non-numbers");
    return a === b ? 0 : a < b ? -1 : 1;
}
function checkIdentifier(v1 = [], v2 = []) {
    if (v1.length && !v2.length) return -1;
    if (!v1.length && v2.length) return 1;
    return 0;
}
function compareIdentifier(v1 = [], v2 = []) {
    const length = Math.max(v1.length, v2.length);
    for(let i = 0; i < length; i++){
        const a = v1[i];
        const b = v2[i];
        if (a === undefined && b === undefined) return 0;
        if (b === undefined) return 1;
        if (a === undefined) return -1;
        if (typeof a === "string" && typeof b === "number") return 1;
        if (typeof a === "number" && typeof b === "string") return -1;
        if (a < b) return -1;
        if (a > b) return 1;
    }
    return 0;
}
const NUMERIC_IDENTIFIER = "0|[1-9]\\d*";
const NON_NUMERIC_IDENTIFIER = "\\d*[a-zA-Z-][a-zA-Z0-9-]*";
const VERSION_CORE = `(?<major>${NUMERIC_IDENTIFIER})\\.(?<minor>${NUMERIC_IDENTIFIER})\\.(?<patch>${NUMERIC_IDENTIFIER})`;
const PRERELEASE_IDENTIFIER = `(?:${NUMERIC_IDENTIFIER}|${NON_NUMERIC_IDENTIFIER})`;
const PRERELEASE = `(?:-(?<prerelease>${PRERELEASE_IDENTIFIER}(?:\\.${PRERELEASE_IDENTIFIER})*))`;
const BUILD_IDENTIFIER = "[0-9A-Za-z-]+";
const BUILD = `(?:\\+(?<buildmetadata>${BUILD_IDENTIFIER}(?:\\.${BUILD_IDENTIFIER})*))`;
const FULL_VERSION = `v?${VERSION_CORE}${PRERELEASE}?${BUILD}?`;
const FULL_REGEXP = new RegExp(`^${FULL_VERSION}$`);
const COMPARATOR = "(?:<|>)?=?";
const WILDCARD_IDENTIFIER = `x|X|\\*`;
const XRANGE_IDENTIFIER = `${NUMERIC_IDENTIFIER}|${WILDCARD_IDENTIFIER}`;
const XRANGE = `[v=\\s]*(?<major>${XRANGE_IDENTIFIER})(?:\\.(?<minor>${XRANGE_IDENTIFIER})(?:\\.(?<patch>${XRANGE_IDENTIFIER})${PRERELEASE}?${BUILD}?)?)?`;
new RegExp(`^(?<operator>~>?|\\^|${COMPARATOR})\\s*${XRANGE}$`);
new RegExp(`^(?<operator>${COMPARATOR})\\s*(${FULL_VERSION})$|^$`);
function isValidNumber(value) {
    return typeof value === "number" && !Number.isNaN(value) && (!Number.isFinite(value) || 0 <= value && value <= Number.MAX_SAFE_INTEGER);
}
const NUMERIC_IDENTIFIER_REGEXP = new RegExp(`^${NUMERIC_IDENTIFIER}$`);
function parsePrerelease(prerelease) {
    return prerelease.split(".").filter(Boolean).map((id)=>{
        if (NUMERIC_IDENTIFIER_REGEXP.test(id)) {
            const number = Number(id);
            if (isValidNumber(number)) return number;
        }
        return id;
    });
}
function parseBuild(buildmetadata) {
    return buildmetadata.split(".").filter(Boolean);
}
function parseNumber(input, errorMessage) {
    const number = Number(input);
    if (!isValidNumber(number)) throw new TypeError(errorMessage);
    return number;
}
function compare(s0, s1) {
    if (s0 === s1) return 0;
    return compareNumber(s0.major, s1.major) || compareNumber(s0.minor, s1.minor) || compareNumber(s0.patch, s1.patch) || checkIdentifier(s0.prerelease, s1.prerelease) || compareIdentifier(s0.prerelease, s1.prerelease);
}
({
    major: Number.POSITIVE_INFINITY,
    minor: Number.POSITIVE_INFINITY,
    patch: Number.POSITIVE_INFINITY,
    prerelease: [],
    build: []
});
const MIN = {
    major: 0,
    minor: 0,
    patch: 0,
    prerelease: [],
    build: []
};
({
    major: Number.NEGATIVE_INFINITY,
    minor: Number.POSITIVE_INFINITY,
    patch: Number.POSITIVE_INFINITY,
    prerelease: [],
    build: []
});
const ANY = {
    major: Number.NaN,
    minor: Number.NaN,
    patch: Number.NaN,
    prerelease: [],
    build: []
};
({
    operator: "",
    ...ANY,
    semver: ANY
});
({
    operator: "<",
    ...MIN,
    semver: MIN
});
function parse(version) {
    if (typeof version !== "string") {
        throw new TypeError(`version must be a string`);
    }
    if (version.length > 256) {
        throw new TypeError(`version is longer than ${256} characters`);
    }
    version = version.trim();
    const groups = version.match(FULL_REGEXP)?.groups;
    if (!groups) throw new TypeError(`Invalid Version: ${version}`);
    const major = parseNumber(groups.major, "Invalid major version");
    const minor = parseNumber(groups.minor, "Invalid minor version");
    const patch = parseNumber(groups.patch, "Invalid patch version");
    const prerelease = groups.prerelease ? parsePrerelease(groups.prerelease) : [];
    const build = groups.buildmetadata ? parseBuild(groups.buildmetadata) : [];
    return {
        major,
        minor,
        patch,
        prerelease,
        build
    };
}
function greaterOrEqual(s0, s1) {
    return compare(s0, s1) >= 0;
}
const { Deno: Deno2 } = globalThis;
const noColor = typeof Deno2?.noColor === "boolean" ? Deno2.noColor : true;
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
    "[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]+)*|[a-zA-Z\\d]+(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)",
    "(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-nq-uy=><~]))"
].join("|"), "g");
function stripColor(string) {
    return string.replace(ANSI_PATTERN, "");
}
const mod = {
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
function wcswidth(str, { nul = 0, control = 0 } = {}) {
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
function wcwidth(ucs, { nul = 0, control = 0 } = {}) {
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
function ansiRegex({ onlyFirst = false } = {}) {
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
const mod1 = await async function() {
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
    info: mod.blue("ℹ"),
    success: mod.green("✔"),
    warning: mod.yellow("⚠"),
    error: mod.red("✖")
};
const fallbacks = {
    info: mod.blue("i"),
    success: mod.green("√"),
    warning: mod.yellow("‼"),
    error: mod.red("×")
};
const symbols = supported ? main : fallbacks;
const encoder1 = new TextEncoder();
const colormap = {
    black: mod.black,
    red: mod.red,
    green: mod.green,
    yellow: mod.yellow,
    blue: mod.blue,
    magenta: mod.magenta,
    cyan: mod.cyan,
    white: mod.white,
    gray: mod.gray
};
function wait(opts) {
    if (typeof opts === "string") {
        opts = {
            text: opts
        };
    }
    return new Spinner({
        text: opts.text,
        prefix: opts.prefix ?? "",
        color: opts.color ?? mod.cyan,
        spinner: opts.spinner ?? "dots",
        hideCursor: opts.hideCursor ?? true,
        indent: opts.indent ?? 0,
        interval: opts.interval ?? 100,
        stream: opts.stream ?? Deno.stdout,
        enabled: true,
        discardStdin: true,
        interceptConsole: opts.interceptConsole ?? true
    });
}
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
        this.#enabled = typeof opts.enabled === "boolean" ? opts.enabled : mod1.isInteractive(this.#stream);
        if (opts.hideCursor) {
            addEventListener("unload", ()=>{
                mod1.showCursorSync(this.#stream);
            });
        }
        if (opts.interceptConsole) {
            this.#interceptConsole();
        }
    }
    #spinner = __default1.dots;
    #color = mod.cyan;
    #text = "";
    #prefix = "";
    #interceptConsole() {
        const methods = [
            "log",
            "warn",
            "error",
            "info",
            "debug",
            "time",
            "timeEnd",
            "trace",
            "dir",
            "assert",
            "count",
            "countReset",
            "table",
            "dirxml",
            "timeLog"
        ];
        for (const method of methods){
            const original = console[method];
            console[method] = (...args)=>{
                if (this.isSpinning) {
                    this.stop();
                    this.clear();
                    original(...args);
                    this.start();
                } else {
                    original(...args);
                }
            };
        }
    }
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
            mod1.hideCursorSync(this.#stream);
        }
        this.isSpinning = true;
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
        const { frames } = this.#spinner;
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
            mod1.goUpSync(1, this.#stream);
            mod1.clearLineSync(this.#stream);
            mod1.goRightSync(this.indent - 1, this.#stream);
        }
        this.#linesToClear = 0;
    }
    updateLines() {
        let columns = 80;
        try {
            columns = Deno.consoleSize().columns ?? columns;
        } catch  {}
        const fullPrefixText = typeof this.prefix === "string" ? this.prefix + "-" : "";
        this.#linesCount = mod1.stripAnsi(fullPrefixText + "--" + this.text).split("\n").reduce((count, line)=>{
            return count + Math.max(1, Math.ceil(mod1.wcswidth(line) / columns));
        }, 0);
    }
    stop() {
        if (!this.#enabled) return;
        clearInterval(this.#id);
        this.#id = -1;
        this.#frameIndex = 0;
        this.clear();
        this.isSpinning = false;
        if (this.#opts.hideCursor) {
            mod1.showCursorSync(this.#stream);
        }
    }
    stopAndPersist(options = {}) {
        const prefix = options.prefix || this.prefix;
        const fullPrefix = typeof prefix === "string" && prefix !== "" ? prefix + " " : "";
        const text = options.text || this.text;
        const fullText = typeof text === "string" ? " " + text : "";
        this.stop();
        this.write(`${fullPrefix}${options.symbol || " "}${fullText}\n`);
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
        if (isURL(entrypoint)) {
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
function isURL(entrypoint) {
    return entrypoint.startsWith("https://") || entrypoint.startsWith("http://") || entrypoint.startsWith("file://");
}
const VERSION = "1.12.0";
let current = null;
function wait1(param) {
    if (typeof param === "string") {
        param = {
            text: param
        };
    }
    param.interceptConsole = false;
    current = wait({
        stream: Deno.stderr,
        ...param
    });
    return current;
}
function interruptSpinner() {
    current?.stop();
    const interrupt = new Interrupt(current);
    current = null;
    return interrupt;
}
class Interrupt {
    #spinner;
    constructor(spinner){
        this.#spinner = spinner;
    }
    resume() {
        current = this.#spinner;
        this.#spinner?.start();
    }
}
const USER_AGENT = `DeployCTL/${VERSION} (${Deno.build.os} ${Deno.osRelease()}; ${Deno.build.arch})`;
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
function endpoint() {
    return Deno.env.get("DEPLOY_API_ENDPOINT") ?? "https://dash.deno.com";
}
class API {
    #endpoint;
    #authorization;
    constructor(authorization, endpoint){
        this.#authorization = authorization;
        this.#endpoint = endpoint;
    }
    static fromToken(token) {
        return new API(`Bearer ${token}`, endpoint());
    }
    static withTokenProvisioner(provisioner) {
        return new API(provisioner, endpoint());
    }
    async request(path, opts = {}) {
        const url = `${this.#endpoint}/api${path}`;
        const method = opts.method ?? "GET";
        const body = typeof opts.body === "string" || opts.body instanceof FormData ? opts.body : JSON.stringify(opts.body);
        const authorization = typeof this.#authorization === "string" ? this.#authorization : `Bearer ${await this.#authorization.get() ?? await this.#authorization.provision()}`;
        const sudo = Deno.env.get("SUDO");
        const headers = {
            "User-Agent": USER_AGENT,
            "Accept": opts.accept ?? "application/json",
            "Authorization": authorization,
            ...opts.body !== undefined ? opts.body instanceof FormData ? {} : {
                "Content-Type": "application/json"
            } : {},
            ...sudo ? {
                ["x-deploy-sudo"]: sudo
            } : {}
        };
        let res = await fetch(url, {
            method,
            headers,
            body
        });
        if (res.status === 401 && typeof this.#authorization === "object") {
            headers.Authorization = `Bearer ${await this.#authorization.provision()}`;
            res = await fetch(url, {
                method,
                headers,
                body
            });
        }
        return res;
    }
    async #requestJson(path, opts) {
        const res = await this.request(path, opts);
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
    async #requestStream(path, opts) {
        const res = await this.request(path, opts);
        if (res.status !== 200) {
            const json = await res.json();
            const xDenoRay = res.headers.get("x-deno-ray");
            throw new APIError(json.code, json.message, xDenoRay);
        }
        if (res.body === null) {
            throw new Error("Stream ended unexpectedly");
        }
        const lines = res.body.pipeThrough(new TextDecoderStream()).pipeThrough(new TextLineStream());
        return async function*() {
            for await (const line of lines){
                if (line === "") return;
                yield line;
            }
        }();
    }
    async #requestJsonStream(path, opts) {
        const stream = await this.#requestStream(path, opts);
        return async function*() {
            for await (const line of stream){
                yield JSON.parse(line);
            }
        }();
    }
    async getOrganizationByName(name) {
        const organizations = await this.#requestJson(`/organizations`);
        for (const org of organizations){
            if (org.name === name) {
                return org;
            }
        }
    }
    async getOrganizationById(id) {
        return await this.#requestJson(`/organizations/${id}`);
    }
    async createOrganization(name) {
        const body = {
            name
        };
        return await this.#requestJson(`/organizations`, {
            method: "POST",
            body
        });
    }
    async listOrganizations() {
        return await this.#requestJson(`/organizations`);
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
    async createProject(name, organizationId, envs) {
        const body = {
            name,
            organizationId,
            envs
        };
        return await this.#requestJson(`/projects/`, {
            method: "POST",
            body
        });
    }
    async renameProject(id, newName) {
        const body = {
            name: newName
        };
        await this.#requestJson(`/projects/${id}`, {
            method: "PATCH",
            body
        });
    }
    async deleteProject(id) {
        try {
            await this.#requestJson(`/projects/${id}`, {
                method: "DELETE"
            });
            return true;
        } catch (err) {
            if (err instanceof APIError && err.code === "projectNotFound") {
                return false;
            }
            throw err;
        }
    }
    async listProjects(orgId) {
        const org = await this.#requestJson(`/organizations/${orgId}`);
        return org.projects;
    }
    async getDomains(projectId) {
        return await this.#requestJson(`/projects/${projectId}/domains`);
    }
    async listDeployments(projectId, page, limit) {
        const query = new URLSearchParams();
        if (page !== undefined) {
            query.set("page", page.toString());
        }
        if (limit !== undefined) {
            query.set("limit", limit.toString());
        }
        try {
            const [list, paging] = await this.#requestJson(`/projects/${projectId}/deployments?${query}`);
            return {
                list,
                paging
            };
        } catch (err) {
            if (err instanceof APIError && err.code === "projectNotFound") {
                return null;
            }
            throw err;
        }
    }
    async *listAllDeployments(projectId) {
        let totalPages = 1;
        let page = 0;
        while(totalPages > page){
            const [deployments, paging] = await this.#requestJson(`/projects/${projectId}/deployments/?limit=50&page=${page}`);
            for (const deployment of deployments){
                yield deployment;
            }
            totalPages = paging.totalPages;
            page = paging.page + 1;
        }
    }
    async getDeployment(deploymentId) {
        try {
            return await this.#requestJson(`/deployments/${deploymentId}`);
        } catch (err) {
            if (err instanceof APIError && err.code === "deploymentNotFound") {
                return null;
            }
            throw err;
        }
    }
    async deleteDeployment(deploymentId) {
        try {
            await this.#requestJson(`/v1/deployments/${deploymentId}`, {
                method: "DELETE"
            });
            return true;
        } catch (err) {
            if (err instanceof APIError && err.code === "deploymentNotFound") {
                return false;
            }
            throw err;
        }
    }
    async redeployDeployment(deploymentId, redeployParams) {
        try {
            return await this.#requestJson(`/v1/deployments/${deploymentId}/redeploy?internal=true`, {
                method: "POST",
                body: redeployParams
            });
        } catch (err) {
            if (err instanceof APIError && err.code === "deploymentNotFound") {
                return null;
            }
            throw err;
        }
    }
    getLogs(projectId, deploymentId) {
        return this.#requestJsonStream(`/projects/${projectId}/deployments/${deploymentId}/logs/`, {
            accept: "application/x-ndjson"
        });
    }
    async queryLogs(projectId, deploymentId, params) {
        const searchParams = new URLSearchParams({
            params: JSON.stringify(params)
        });
        return await this.#requestJson(`/projects/${projectId}/deployments/${deploymentId}/query_logs?${searchParams.toString()}`);
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
        return this.#requestJsonStream(`/projects/${projectId}/deployment_with_assets`, {
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
        return this.#requestJsonStream(`/projects/${projectId}/deployment_github_actions`, {
            method: "POST",
            body: form
        });
    }
    getMetadata() {
        return this.#requestJson("/meta");
    }
    async streamMetering(project) {
        const streamGen = ()=>this.#requestStream(`/projects/${project}/stats`);
        let stream = await streamGen();
        return async function*() {
            for(;;){
                try {
                    for await (const line of stream){
                        try {
                            yield JSON.parse(line);
                        } catch  {}
                    }
                } catch (error) {
                    const interrupt = interruptSpinner();
                    const spinner = wait1(`Error: ${error}. Reconnecting...`).start();
                    await delay(5_000);
                    stream = await streamGen();
                    spinner.stop();
                    interrupt.resume();
                }
            }
        }();
    }
    async getProjectDatabases(project) {
        try {
            return await this.#requestJson(`/projects/${project}/databases`);
        } catch (err) {
            if (err instanceof APIError && err.code === "projectNotFound") {
                return null;
            }
            throw err;
        }
    }
    async getDeploymentCrons(projectId, deploymentId) {
        return await this.#requestJson(`/projects/${projectId}/deployments/${deploymentId}/crons`);
    }
    async getProjectCrons(projectId) {
        try {
            return await this.#requestJson(`/projects/${projectId}/deployments/latest/crons`);
        } catch (err) {
            if (err instanceof APIError && err.code === "deploymentNotFound") {
                return null;
            }
            throw err;
        }
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
    if (include.length && !include.some((pattern)=>pattern.test(normalize2(path)))) {
        return false;
    }
    if (exclude.length && exclude.some((pattern)=>pattern.test(normalize2(path)))) {
        return false;
    }
    return true;
}
async function walk(cwd, dir, options) {
    const hashPathMap = new Map();
    const manifestEntries = await walkInner(cwd, dir, hashPathMap, options);
    return {
        manifestEntries,
        hashPathMap
    };
}
async function walkInner(cwd, dir, hashPathMap, options) {
    const entries = {};
    for await (const file of Deno.readDir(dir)){
        const path = join2(dir, file.name);
        const relative = path.slice(cwd.length);
        if (!file.isDirectory && !include(path.slice(cwd.length + 1), options.include, options.exclude)) {
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
            hashPathMap.set(gitSha1, path);
        } else if (file.isDirectory) {
            if (relative === "/.git") continue;
            entry = {
                kind: "directory",
                entries: await walkInner(cwd, path, hashPathMap, options)
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
function convertPatternToRegExp(pattern) {
    return isGlob(pattern) ? new RegExp(globToRegExp2(normalize2(pattern)).toString().slice(1, -2)) : new RegExp(`^${normalize2(pattern)}`);
}
export { parseEntrypoint as parseEntrypoint };
export { API as API, APIError as APIError };
export { convertPatternToRegExp as convertPatternToRegExp, walk as walk };
export { fromFileUrl2 as fromFileUrl, resolve2 as resolve };
function isTerminal(stream) {
    if (greaterOrEqual(parse(Deno.version.deno), parse("1.40.0"))) {
        return stream.isTerminal();
    } else {
        return Deno.isatty(stream.rid);
    }
}
export { isTerminal as isTerminal };

