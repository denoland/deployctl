"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
// dep modules
var fast_safe_stringify_1 = require("fast-safe-stringify");
var fs = require("graceful-fs");
var mkdirp = require("mkdirp");
// vars
var oproto = Object.prototype;
// simple promisification. this won't work for callbacks with more than 2
// args.
function promisify(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new Promise(function (resolve, reject) {
            fn.apply(void 0, args.concat([function (err, result) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve(result);
                    }
                }]));
        });
    };
}
var defaultStringifyOpts = {
    replacer: null,
    space: 0,
    handleCircular: true
};
var helper = {
    isObject: function (o) {
        return oproto.toString.call(o) === '[object Object]';
    },
    isPrimitive: function (value) {
        var t = typeof value;
        return value === null
            || value === undefined
            || (t !== 'function' && t !== 'object');
    },
    strLog: function (value, pretty) {
        if (helper.isPrimitive(value))
            return value;
        var s = pretty ? '  ' : null;
        return fast_safe_stringify_1.default(value, null, s);
    },
    getLogger: function (config, pretty) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var stream = config.stream;
            var msg = args.map(function (arg) {
                if (arg instanceof Error) {
                    stream = config.streamErr;
                    return arg.stack
                        /* istanbul ignore next */
                        || arg.message
                        /* istanbul ignore next */
                        || String(arg);
                }
                return helper.strLog(arg, pretty);
            }).join(' ');
            stream.write(msg + '\n');
        };
    },
    getStringifyOptions: function (options, space) {
        if (helper.isObject(options)) {
            return __assign({}, defaultStringifyOpts, options); // as IStringifyOptions
        }
        if (typeof options === 'function' || Array.isArray(options)) {
            return __assign({}, defaultStringifyOpts, { replacer: options, space: space });
        }
        return __assign({}, defaultStringifyOpts, { space: space });
    },
    fs: fs,
    mkdirp: mkdirp,
    promise: {
        readFile: promisify(fs.readFile),
        writeFile: promisify(fs.writeFile),
        mkdirp: promisify(mkdirp)
    },
    safeSync: function (fn) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            try {
                return [null, fn.apply(void 0, args)];
            }
            catch (err) {
                return [err, undefined];
            }
        };
    },
    safeAsync: function (promise) {
        return promise
            .then(function (data) { return [null, data]; })
            .catch(function (err) { return [err, undefined]; });
    }
};
exports.helper = helper;
