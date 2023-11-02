"use strict";
///<reference path="../lib.deno.d.ts" />
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.File = exports.FsFile = void 0;
const fs = __importStar(require("fs"));
const fstat_js_1 = require("../functions/fstat.js");
const fstatSync_js_1 = require("../functions/fstatSync.js");
const ftruncate_js_1 = require("../functions/ftruncate.js");
const ftruncateSync_js_1 = require("../functions/ftruncateSync.js");
const read_js_1 = require("../functions/read.js");
const readSync_js_1 = require("../functions/readSync.js");
const write_js_1 = require("../functions/write.js");
const writeSync_js_1 = require("../functions/writeSync.js");
class FsFile {
    constructor(rid) {
        this.rid = rid;
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
    close() {
        fs.closeSync(this.rid);
    }
    get readable() {
        throw new Error("Not implemented.");
    }
    get writable() {
        throw new Error("Not implemented.");
    }
}
exports.FsFile = FsFile;
const File = FsFile;
exports.File = File;
