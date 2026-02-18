"use strict";
/* tslint:disable:class-name no-require-imports no-default-export max-line-length interface-name max-classes-per-file max-file-line-count */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
// core modules
var path = require("path");
// dep modules
var fast_safe_stringify_1 = require("fast-safe-stringify");
var parseJson = require("parse-json");
var stripBOM = require("strip-bom");
var stripJsonComments = require("strip-json-comments");
// own modules
var helper_1 = require("./helper");
var jsonc_safe_1 = require("./jsonc.safe");
// constants, variables
var fs = helper_1.helper.fs, mkdirp = helper_1.helper.mkdirp, promise = helper_1.helper.promise;
/**
 *  JSON utility class that can handle comments and circular references; and
 *  other extra functionality.
 *  @class
 *  @author Onur Yıldırım <onur@cutepilot.com>
 *  @license MIT
 *  @see {@link https://github.com/onury/jsonc|GitHub Repo}
 *  @see {@link https://github.com/onury/jsonc#related-modules|Related Modules}
 *
 *  @example
 *  const jsonc = require('jsonc');
 *  // or
 *  import { jsonc } from 'jsonc';
 *
 *  const result = jsonc.parse('// comments\n{ "key": "value" }');
 *  console.log(result); // { key: "value" }
 */
var jsonc = /** @class */ (function () {
    function jsonc() {
    }
    /**
     *  Configures `jsonc` object.
     *
     *  @param {IConfig} cfg - Configurations.
     *  @param {NodeJS.WriteStream} [stream] - Stream to write logs to. This is
     *  used with `.log()` and `.logp()` methods.
     *  @param {NodeJS.WriteStream} [streamErr] - Stream to write error logs to.
     *  This is used with `.log()` and `.logp()` methods.
     *
     *  @example
     *  // Output logs to stdout but logs containing errors to a file.
     *  jsonc.config({
     *      stream: process.stdout,
     *      streamErr: fs.createWriteStream('path/to/log.txt')
     *  });
     *  jsonc.log({ info: 'this is logged to console' });
     *  jsonc.log(new Error('this is logged to file'));
     */
    jsonc.config = function (cfg) {
        var conf = __assign({ stream: process.stdout, streamErr: process.stderr }, (cfg || {}));
        jsonc._ = {
            logger: helper_1.helper.getLogger(conf, false),
            prettyLogger: helper_1.helper.getLogger(conf, true)
        };
    };
    /**
     *  Stringifies and logs the given arguments to console. This will
     *  automatically handle circular references; so it won't throw.
     *
     *  If an `Error` instance is passed, it will log the `.stack` property on
     *  the instance, without stringifying the object.
     *
     *  @param {...any[]} [args] - Arguments to be logged.
     *  @returns {void}
     */
    jsonc.log = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = jsonc._).logger.apply(_a, args);
    };
    /**
     *  Pretty version of `log()` method. Stringifies and logs the given
     *  arguments to console, with indents. This will automatically handle
     *  circular references; so it won't throw.
     *
     *  If an `Error` instance is passed, it will log the `.stack` property on
     *  the instance, without stringifying the object.
     *
     *  @param {...any[]} [args] - Arguments to be logged.
     *  @returns {void}
     */
    jsonc.logp = function () {
        var _a;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        (_a = jsonc._).prettyLogger.apply(_a, args);
    };
    /**
     *  Parses the given JSON string into a JavaScript object. The input string
     *  can include comments.
     *
     *  @param {string} str - JSON string to be parsed.
     *  @param {IParseOptions|Reviver} [options] - Either a parse options
     *  object or a reviver function.
     *  @param {Reviver} [options.reviver] - A function that can filter
     *  and transform the results. It receives each of the keys and values, and
     *  its return value is used instead of the original value. If it returns
     *  what it received, then the structure is not modified. If it returns
     *  `undefined` then the member is deleted.
     *  @param {Boolean} [options.stripComments=true] - Whether to strip
     *  comments from the JSON string. Note that it will throw if this is set to
     *  `false` and the string includes comments.
     *
     *  @returns {any} - Parsed value.
     *
     *  @throws {JSONError} - If JSON string is not valid. Note that any
     *  comments within JSON are removed by default; so this will not throw for
     *  comments unless you explicitly set `stripComments` to `false`.
     *
     *  @example
     *  const parsed = jsonc.parse('// comments\n{"success":true}\n');
     *  console.log(parsed); // { success: true }
     */
    jsonc.parse = function (str, options) {
        var opts = typeof options === 'function'
            ? { reviver: options }
            : (options || {});
        if (opts.stripComments !== false)
            str = stripJsonComments(str, { whitespace: false });
        return parseJson(str, opts.reviver);
    };
    /**
     *  Outputs a JSON string from the given JavaScript object.
     *
     *  @param {*} value - JavaScript value to be stringified.
     *  @param {IStringifyOptions|Replacer} [options] - Stringify options or a
     *  replacer.
     *  @param {Replacer} [options.replacer] - Determines how object values are
     *  stringified for objects. It can be a function or an array of strings or
     *  numbers.
     *  @param {string|number} [options.space] - Specifies the indentation of
     *  nested structures. If it is omitted, the text will be packed without
     *  extra whitespace. If it is a number, it will specify the number of
     *  spaces to indent at each level. If it is a string (such as `"\t"` or
     *  `"&nbsp;"`), it contains the characters used to indent at each level.
     *  @param {string|number} [space] - This takes effect if second argument is
     *  the `replacer` or a falsy value. This is for supporting the signature of
     *  native `JSON.stringify()` method.
     *  @param {boolean} [options.handleCircular=true] - Whether to handle
     *  circular references (if any) by replacing their values with the string
     *  `"[Circular]"`. You can also use a replacer function to replace or
     *  remove circular references instead.
     *
     *  @returns {string} - JSON string.
     *
     *  @throws {Error} - If there are any circular references within the
     *  original input. In this case, use `jsonc.safe.stringify()` method
     *  instead.
     *
     *  @example
     *  const obj = { key: 'value' };
     *  console.log(jsonc.stringify(obj)); // '{"key":"value"}'
     *
     *  // pretty output with indents
     *  let pretty = jsonc.stringify(obj, null, 2);
     *  // equivalent to:
     *  pretty = jsonc.stringify(obj, { reviver: null, space: 2 });
     *  if (!err) console.log(pretty);
     *  // {
     *  //   "key": "value"
     *  // }
     */
    jsonc.stringify = function (value, optionsOrReplacer, space) {
        var opts = helper_1.helper.getStringifyOptions(optionsOrReplacer, space);
        return opts.handleCircular
            ? fast_safe_stringify_1.default(value, opts.replacer, opts.space)
            : JSON.stringify(value, opts.replacer, opts.space);
    };
    /**
     *  Specifies whether the given string has well-formed JSON structure.
     *
     *  Note that, not all JSON-parsable strings are considered well-formed JSON
     *  structures. JSON is built on two structures; a collection of name/value
     *  pairs (object) or an ordered list of values (array).
     *
     *  For example, `JSON.parse('true')` will parse successfully but
     *  `jsonc.isJSON('true')` will return `false` since it has no object or
     *  array structure.
     *
     *  @param {string} str - String to be validated.
     *  @param {boolean} [allowComments=false] - Whether comments should be
     *  considered valid.
     *
     *  @returns {boolean}
     *
     *  @example
     *  jsonc.isJSON('{"x":1}');            // true
     *  jsonc.isJSON('true');               // false
     *  jsonc.isJSON('[1, false, null]');   // true
     *  jsonc.isJSON('string');             // false
     *  jsonc.isJSON('null');               // false
     */
    jsonc.isJSON = function (str, allowComments) {
        if (allowComments === void 0) { allowComments = false; }
        if (typeof str !== 'string')
            return false;
        var _a = jsonc.safe.parse(str, { stripComments: allowComments }), err = _a[0], result = _a[1];
        return !err && (helper_1.helper.isObject(result) || Array.isArray(result));
    };
    /**
     *  Strips comments from the given JSON string.
     *
     *  @param {string} str - JSON string.
     *  @param {boolean} [whitespace=false] - Whether to replace comments with
     *  whitespace instead of stripping them entirely.
     *
     *  @returns {string} - Valid JSON string.
     *
     *  @example
     *  const str = jsonc.stripComments('// comments\n{"key":"value"}');
     *  console.log(str); // '\n{"key":"value"}'
     */
    jsonc.stripComments = function (str, whitespace) {
        if (whitespace === void 0) { whitespace = false; }
        return stripJsonComments(str, { whitespace: whitespace });
    };
    /**
     *  Uglifies the given JSON string.
     *
     *  @param {string} str - JSON string to be uglified.
     *  @returns {string} - Uglified JSON string.
     *
     *  @example
     *  const pretty = `
     *  {
     *    // comments...
     *    "key": "value"
     *  }
     *  `;
     *  const ugly = jsonc.uglify(pretty);
     *  console.log(ugly); // '{"key":"value"}'
     */
    jsonc.uglify = function (str) {
        return jsonc.stringify(jsonc.parse(str, { stripComments: true }));
    };
    /**
     *  Beautifies the given JSON string. Note that this will remove comments,
     *  if any.
     *
     *  @param {string} str - JSON string to be beautified.
     *  @param {string|number} [space=2] Specifies the indentation of nested
     *  structures. If it is omitted, the text will be packed without extra
     *  whitespace. If it is a number, it will specify the number of spaces to
     *  indent at each level. If it is a string (such as "\t" or "&nbsp;"), it
     *  contains the characters used to indent at each level.
     *
     *  @returns {string} - Beautified JSON string.
     *
     *  @example
     *  const ugly = '{"key":"value"}';
     *  const pretty = jsonc.beautify(ugly);
     *  console.log(pretty);
     *  // {
     *  //   "key": "value"
     *  // }
     */
    jsonc.beautify = function (str, space) {
        if (space === void 0) { space = 2; }
        if (!space)
            space = 2;
        return jsonc.stringify(jsonc.parse(str), { space: space });
    };
    /**
     *  Normalizes the given value by stringifying and parsing it back to a
     *  Javascript object.
     *
     *  @param {any} value
     *  @param {Replacer} [replacer] - Determines how object values are
     *  normalized for objects. It can be a function or an array of strings.
     *
     *  @returns {any} - Normalized object.
     *
     *  @example
     *  const c = new SomeClass();
     *  console.log(c.constructor.name); // "SomeClass"
     *  const normalized = jsonc.normalize(c);
     *  console.log(normalized.constructor.name); // "Object"
     */
    jsonc.normalize = function (value, replacer) {
        return jsonc.parse(jsonc.stringify(value, { replacer: replacer }));
    };
    /**
     *  Asynchronously reads a JSON file, strips comments and UTF-8 BOM and
     *  parses the JSON content.
     *
     *  @param {string} filePath - Path to JSON file.
     *  @param {Function|IReadOptions} [options] - Read options.
     *  @param {Function} [options.reviver] - A function that can filter and
     *  transform the results. It receives each of the keys and values, and its
     *  return value is used instead of the original value. If it returns what
     *  it received, then the structure is not modified. If it returns undefined
     *  then the member is deleted.
     *  @param {boolean} [options.stripComments=true] - Whether to strip
     *  comments from the JSON string. Note that it will throw if this is set to
     *  `false` and the string includes comments.
     *
     *  @returns {Promise<any>} - Promise of the parsed JSON content as a
     *  JavaScript object.
     *
     *  @example <caption>Using async/await</caption> (async () => {try {const
     *  obj = await jsonc.read('path/to/file.json'); console.log(typeof obj); //
     *  "object"} catch (err) {console.log('Failed to read JSON file');
     *      }
     *  })();
     *
     *  @example <caption>Using promises</caption>
     *  jsonc.read('path/to/file.json') .then(obj => {console.log(typeof obj);
     *  // "object"
     *      })
     *      .catch(err => {
     *          console.log('Failed to read JSON file');
     *      });
     */
    jsonc.read = function (filePath, options) {
        return __awaiter(this, void 0, void 0, function () {
            var opts, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opts = __assign({ reviver: null, stripComments: true }, (options || {}));
                        return [4 /*yield*/, promise.readFile(filePath, 'utf8')];
                    case 1:
                        data = _a.sent();
                        if (opts.stripComments !== false)
                            data = stripJsonComments(data);
                        return [2 /*return*/, parseJson(stripBOM(data), opts.reviver, filePath)];
                }
            });
        });
    };
    /**
     *  Synchronously reads a JSON file, strips UTF-8 BOM and parses the JSON
     *  content.
     *
     *  @param {string} filePath - Path to JSON file.
     *  @param {Function|IReadOptions} [options] - Read options.
     *  @param {Function} [options.reviver] - A function that can filter and
     *  transform the results. It receives each of the keys and values, and its
     *  return value is used instead of the original value. If it returns what
     *  it received, then the structure is not modified. If it returns undefined
     *  then the member is deleted.
     *  @param {boolean} [options.stripComments=true] - Whether to strip
     *  comments from the JSON string. Note that it will throw if this is set to
     *  `false` and the string includes comments.
     *
     *  @returns {any} - Parsed JSON content as a JavaScript object.
     *
     *  @example
     *  const obj = jsonc.readSync('path/to/file.json');
     *  // use try/catch block to handle errors. or better, use the safe version.
     *  console.log(typeof obj); // "object"
     */
    jsonc.readSync = function (filePath, options) {
        var opts = __assign({ reviver: null, stripComments: true }, (options || {}));
        var data = fs.readFileSync(filePath, 'utf8');
        if (opts.stripComments !== false)
            data = stripJsonComments(data);
        return parseJson(stripBOM(data), opts.reviver, filePath);
    };
    /**
     *  Asynchronously writes a JSON file from the given JavaScript object.
     *
     *  @param {string} filePath - Path to JSON file to be written.
     *  @param {any} data - Data to be stringified into JSON.
     *  @param {IWriteOptions} [options] - Write options.
     *  @param {Replacer} [options.replacer] - Determines how object values are
     *  stringified for objects. It can be a function or an array of strings.
     *  @param {string|number} [options.space] - Specifies the indentation of
     *  nested structures. If it is omitted, the text will be packed without
     *  extra whitespace. If it is a number, it will specify the number of
     *  spaces to indent at each level. If it is a string (such as "\t" or
     *  "&nbsp;"), it contains the characters used to indent at each level.
     *  @param {number} [options.mode=438] - FileSystem permission mode to be used when
     *  writing the file. Default is `438` (`0666` in octal).
     *  @param {boolean} [options.autoPath=true] - Specifies whether to create path
     *  directories if they don't exist. This will throw if set to `false` and
     *  path does not exist.
     *
     *  @returns {Promise<boolean>} - Always resolves with `true`, if no errors occur.
     *
     *  @example <caption>Using async/await</caption>
     *  (async () => {
     *      try {
     *          await jsonc.write('path/to/file.json', data);
     *          console.log('Successfully wrote JSON file');
     *      } catch (err) {
     *          console.log('Failed to write JSON file');
     *      }
     *  })();
     *
     *  @example <caption>Using promises</caption>
     *  jsonc.write('path/to/file.json', data)
     *      .then(success => {
     *           console.log('Successfully wrote JSON file');
     *      })
     *      .catch(err => {
     *          console.log('Failed to write JSON file');
     *      });
     */
    jsonc.write = function (filePath, data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var opts, content;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        opts = __assign({ replacer: null, space: 0, mode: 438, autoPath: true }, (options || {}));
                        if (!opts.autoPath) return [3 /*break*/, 2];
                        return [4 /*yield*/, promise.mkdirp(path.dirname(filePath), { fs: fs })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        content = JSON.stringify(data, opts.replacer, opts.space);
                        return [4 /*yield*/, promise.writeFile(filePath, content + "\n", {
                                mode: opts.mode,
                                encoding: 'utf8'
                            })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     *  Synchronously writes a JSON file from the given JavaScript object.
     *
     *  @param {string} filePath - Path to JSON file to be written.
     *  @param {any} data - Data to be stringified into JSON.
     *  @param {IWriteOptions} [options] - Write options.
     *  @param {Replacer} [options.replacer] - Determines how object values are
     *  stringified for objects. It can be a function or an array of strings.
     *  @param {string|number} [options.space] - Specifies the indentation of
     *  nested structures. If it is omitted, the text will be packed without
     *  extra whitespace. If it is a number, it will specify the number of
     *  spaces to indent at each level. If it is a string (such as "\t" or
     *  "&nbsp;"), it contains the characters used to indent at each level.
     *  @param {number} [options.mode=438] - FileSystem permission mode to be used when
     *  writing the file. Default is `438` (`0666` in octal).
     *  @param {boolean} [options.autoPath=true] - Specifies whether to create path
     *  directories if they don't exist. This will throw if set to `false` and
     *  path does not exist.
     *
     *  @returns {boolean} - Always returns `true`, if no errors occur.
     *
     *  @example
     *  const success = jsonc.writeSync('path/to/file.json');
     *  // this will always return true. use try/catch block to handle errors. or better, use the safe version.
     *  console.log('Successfully wrote JSON file');
     */
    jsonc.writeSync = function (filePath, data, options) {
        var opts = __assign({ replacer: null, space: 0, mode: 438, autoPath: true }, (options || {}));
        if (opts.autoPath)
            mkdirp.sync(path.dirname(filePath), { fs: fs });
        var content = JSON.stringify(data, opts.replacer, opts.space);
        fs.writeFileSync(filePath, content + "\n", {
            mode: opts.mode,
            encoding: 'utf8'
        });
        return true;
    };
    return jsonc;
}());
exports.jsonc = jsonc;
// default configuration
jsonc.config(null);
/* istanbul ignore next */
(function (jsonc) {
    jsonc.safe = jsonc_safe_1.jsoncSafe;
})(jsonc || (jsonc = {}));
exports.jsonc = jsonc;
