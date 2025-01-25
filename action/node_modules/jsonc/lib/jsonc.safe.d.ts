import { IConfig, IParseOptions, IReadOptions, IStringifyOptions, IWriteOptions, Replacer, Reviver } from './interfaces';
/**
 *  Class that provides safe versions of `jsonc` methods. Safe methods provide a
 *  way to easily handle errors without throwing; so that you don't need to use
 *  try/catch blocks.
 *
 *  Each method (except a few such as `.isJSON`), will return an array with the
 *  first item being the `Error` instance caught. If successful, second item
 *  will be the result.
 *  @name jsonc.safe
 *  @class
 *
 *  @example
 *  const { safe } = require('jsonc');
 *  // or
 *  import { safe as jsonc } from 'jsonc';
 *
 *  const [err, result] = jsonc.parse('[invalid JSON}');
 *  if (err) {
 *     console.log(`Failed to parse JSON: ${err.message}`);
 *  } else {
 *     console.log(result);
 *  }
 */
declare class jsoncSafe {
    /**
     *  Configures `jsonc` object.
     *
     *  <blockquote>This method is added for convenience. Works the same as `jsonc.config()`.</blockquote>
     *
     *  @name jsonc.safe.config
     *  @function
     *
     *  @param {IConfig} cfg - Configurations.
     *  @param {NodeJS.WriteStream} [stream] - Stream to write logs to. This is
     *  used with `.log()` and `.logp()` methods.
     *  @param {NodeJS.WriteStream} [streamErr] - Stream to write error logs to.
     *  This is used with `.log()` and `.logp()` methods.
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  // Output logs to stdout but logs containing errors to a file.
     *  jsonc.config({
     *      stream: process.stdout,
     *      streamErr: fs.createWriteStream('path/to/log.txt')
     *  });
     *  jsonc.log({ info: 'this is logged to console' });
     *  jsonc.log(new Error('this is logged to file'));
     */
    static config(cfg: IConfig): void;
    /**
     *  Stringifies and logs the given arguments to console. This will
     *  automatically handle circular references; so it won't throw.
     *
     *  If an `Error` instance is passed, it will log the `.stack` property on
     *  the instance, without stringifying the object.
     *
     *  <blockquote>This method is added for convenience. Works the same as `jsonc.log()`.</blockquote>
     *  @name jsonc.safe.log
     *  @function
     *
     *  @param {...any[]} [args] - Arguments to be logged.
     *  @returns {void}
     */
    static log(...args: any[]): void;
    /**
     *  Pretty version of `log()` method. Stringifies and logs the given
     *  arguments to console, with indents. This will automatically handle
     *  circular references; so it won't throw.
     *
     *  If an `Error` instance is passed, it will log the `.stack` property on
     *  the instance, without stringifying the object.
     *
     *  <blockquote>This method is added for convenience. Works the same as `jsonc.logp()`.</blockquote>
     *  @name jsonc.safe.logp
     *  @function
     *
     *  @param {...any[]} [args] - Arguments to be logged.
     *  @returns {void}
     */
    static logp(...args: any[]): void;
    /**
     *  Safe version of `jsonc.parse()`. Parses the given string into a
     *  JavaScript object.
     *  @name jsonc.safe.parse
     *  @function
     *
     *  @param {string} str - JSON string to be parsed.
     *  @param {IParseOptions|Reviver} [options] - Either a parse options
     *  object or a reviver function.
     *  @param {Reviver} [options.reviver] - A function that can filter and
     *  transform the results. It receives each of the keys and values, and
     *  its return value is used instead of the original value. If it
     *  returns what it received, then the structure is not modified. If it
     *  returns `undefined` then the member is deleted.
     *  @param {boolean} [options.stripComments=true] - Whether to strip
     *  comments from the JSON string. Note that it will return the first
     *  parameter as an error if this is set to `false` and the string
     *  includes comments.
     *
     *  @returns {Array} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful, second
     *  item will be the result: `[Error, any]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const [err, result] = jsonc.parse('--invalid JSON--');
     *  if (err) {
     *      console.log('Failed to parse JSON: ' + err.message);
     *  } else {
     *      console.log(result);
     *  }
     */
    static parse(str: string, options?: IParseOptions | Reviver): [Error, undefined] | [null, any];
    /**
     *  Safe version of `jsonc.stringify()`. Stringifies the given
     *  JavaScript object. The input object can have circular references
     *  which will return the string `"[Circular]"` for each circular
     *  reference, by default. You can use a replacer function to replace or
     *  remove circular references instead.
     *  @name jsonc.safe.stringify
     *  @function
     *
     *  @param {*} value - JavaScript value to be stringified.
     *  @param {IStringifyOptions|Replacer} [options] - Stringify options or
     *  a replacer.
     *  @param {Replacer} [options.replacer] - Determines how object values
     *  are stringified for objects. It can be an array of strings or
     *  numbers; or a function with the following signature: `(key: string,
     *  value: any) => any`.
     *  @param {string|number} [options.space] - Specifies the indentation
     *  of nested structures. If it is omitted, the text will be packed
     *  without extra whitespace. If it is a number, it will specify the
     *  number of spaces to indent at each level. If it is a string (such as
     *  `"\t"` or `"&nbsp;"`), it contains the characters used to indent at
     *  each level.
     *  @param {boolean} [options.handleCircular=true] - Whether to handle
     *  circular references (if any) by replacing their values with the
     *  string `"[Circular]"`. You can also use a replacer function to
     *  replace or remove circular references instead.
     *  @param {string|number} [space] - This takes effect if second
     *  argument is the `replacer` or a falsy value. Included for supporting
     *  the signature of native `JSON.stringify()` method.
     *
     *  @returns {Array} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful, second
     *  item will be the result: `[Error, string]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const obj = { key: 'value' };
     *  let [err, str] = jsonc.stringify(obj);
     *  if (!err) console.log(str); // '{"key":"value"}'
     *
     *  // pretty output with indents
     *  let [err, pretty] = jsonc.stringify(obj, null, 2);
     *  // equivalent to:
     *  [err, pretty] = jsonc.stringify(obj, { reviver: null, space: 2 });
     *  if (!err) console.log(pretty);
     *  // {
     *  //   "key": "value"
     *  // }
     */
    static stringify(value: any, option?: IStringifyOptions): [Error, undefined] | [null, string];
    static stringify(value: any, replacer: Replacer, space?: string | number): [Error, undefined] | [null, string];
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
     *  <blockquote>This method is added for convenience. Works the same as
     *  `jsonc.isJSON()`.</blockquote>
     *  @name jsonc.safe.isJSON
     *  @function
     *
     *  @param {string} str - String to be validated.
     *  @param {boolean} [allowComments=false] - Whether comments should be
     *  considered valid.
     *
     *  @returns {boolean}
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  jsonc.isJSON('{"x":1}');            // true
     *  jsonc.isJSON('true');               // false
     *  jsonc.isJSON('[1, false, null]');   // true
     *  jsonc.isJSON('string');             // false
     *  jsonc.isJSON('null');               // false
     */
    static isJSON(str: string, allowComments?: boolean): boolean;
    /**
     *  Strips comments from the given JSON string.
     *  @name jsonc.safe.stripComments
     *  @function
     *
     *  @param {string} str - JSON string.
     *  @param {boolean} [whitespace=false] - Whether to replace comments
     *  with whitespace instead of stripping them entirely.
     *
     *  @returns {Array} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful, second
     *  item will be the result: `[Error, string]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const [err, str] = jsonc.stripComments('// comments\n{"key":"value"}');
     *  if (!err) console.log(str); // '\n{"key":"value"}'
     */
    static stripComments(str: string, whitespace?: boolean): [Error, undefined] | [null, string];
    /**
     *  Safe version of `jsonc.uglify()`. Uglifies the given JSON string.
     *  @name jsonc.safe.uglify
     *  @function
     *
     *  @param {string} str - JSON string to be uglified.
     *
     *  @returns {Array} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful, second
     *  item will be the result: `[Error, string]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const pretty = `
     *  {
     *    // comments...
     *    "key": "value"
     *  }
     *  `;
     *  const [err, ugly] = jsonc.uglify(pretty);
     *  if (!err) console.log(ugly); // '{"key":"value"}'
     */
    static uglify(str: string): [Error, undefined] | [null, string];
    /**
     *  Safe version of `jsonc.beautify()`. Beautifies the given JSON
     *  string. Note that this will remove comments, if any.
     *  @name jsonc.safe.beautify
     *  @function
     *
     *  @param {string} str - JSON string to be beautified.
     *  @param {string|number} [space=2] Specifies the indentation of nested
     *  structures. If it is omitted, the text will be packed without extra
     *  whitespace. If it is a number, it will specify the number of spaces
     *  to indent at each level. If it is a string (such as "\t" or
     *  "&nbsp;"), it contains the characters used to indent at each level.
     *
     *  @returns {Array} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful, second
     *  item will be the result: `[Error, string]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const ugly = '{"key":"value"}';
     *  const [err, pretty] = jsonc.beautify(ugly);
     *  if (!err) console.log(pretty);
     *  // {
     *  //   "key": "value"
     *  // }
     */
    static beautify(str: string, space?: string | number): [Error, undefined] | [null, string];
    /**
     *  Safe version of `jsonc.normalize()`. Normalizes the given value by
     *  stringifying and parsing it back to a Javascript object.
     *  @name jsonc.safe.normalize
     *  @function
     *
     *  @param {any} value
     *  @param {Replacer} [replacer] - Determines how object values are
     *  normalized for objects. It can be a function or an array of strings.
     *
     *  @returns {Array} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful, second
     *  item will be the result: `[Error, any]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const c = new SomeClass();
     *  console.log(c.constructor.name); // "SomeClass"
     *  const [err, normalized] = jsonc.normalize(c);
     *  if (err) {
     *      console.log('Failed to normalize: ' + err.message);
     *  } else {
     *      console.log(normalized.constructor.name); // "Object"
     *  }
     */
    static normalize(value: any, replacer?: Replacer): [Error, undefined] | [null, any];
    /**
     *  Safe version of `jsonc.read()`. Asynchronously reads a JSON file,
     *  strips comments and UTF-8 BOM and parses the JSON content.
     *  @name jsonc.safe.read
     *  @function
     *
     *  @param {string} filePath - Path to JSON file.
     *  @param {Function|IReadOptions} [options] - Read options.
     *  @param {Function} [options.reviver] - A function that can filter and
     *  transform the results. It receives each of the keys and values, and
     *  its return value is used instead of the original value. If it
     *  returns what it received, then the structure is not modified. If it
     *  returns undefined then the member is deleted.
     *  @param {boolean} [options.stripComments=true] - Whether to strip
     *  comments from the JSON string. Note that it will fail if this is
     *  set to `false` and the string includes comments.
     *
     *  @returns {Promise<Array>} - Safe methods return an array with
     *  the first item being the `Error` instance caught. If successful,
     *  second item will be the result: `Promise<[Error, any]>`
     *
     *  @example <caption>Using async/await (recommended)</caption>
     *  import { safe as jsonc } from 'jsonc';
     *  (async () => {
     *      const [err, obj] = await jsonc.read('path/to/file.json');
     *      if (err) {
     *          console.log('Failed to read JSON file');
     *      } catch (err) {
     *          console.log(typeof obj); // "object"
     *      }
     *  })();
     *
     *  @example <caption>Using promises</caption>
     *  import { safe as jsonc } from 'jsonc';
     *  jsonc.read('path/to/file.json')
     *      .then([err, obj] => {
     *           if (err) {
     *               console.log('Failed to read JSON file');
     *           } else {
     *               console.log(typeof obj); // "object"
     *           }
     *      })
     *      // .catch(err => {}); // this is never invoked when safe version is used.
     */
    static read(filePath: string, options?: IReadOptions): Promise<[Error, undefined] | [null, any]>;
    /**
     *  Safe version of `jsonc.readSync()`. Synchronously reads a JSON file,
     *  strips UTF-8 BOM and parses the JSON content.
     *  @name jsonc.safe.readSync
     *  @function
     *
     *  @param {string} filePath - Path to JSON file.
     *  @param {Function|IReadOptions} [options] - Read options.
     *  @param {Function} [options.reviver] - A function that can filter and
     *  transform the results. It receives each of the keys and values, and
     *  its return value is used instead of the original value. If it
     *  returns what it received, then the structure is not modified. If it
     *  returns undefined then the member is deleted.
     *  @param {boolean} [options.stripComments=true] - Whether to strip
     *  comments from the JSON string. Note that it will fail if this is
     *  set to `false` and the string includes comments.
     *
     *  @returns {Array} - Safe methods return an array with
     *  the first item being the `Error` instance caught. If successful,
     *  second item will be the result: `[Error, any]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const [err, obj] = jsonc.readSync('path/to/file.json');
     *  if (!err) console.log(typeof obj); // "object"
     */
    static readSync(filePath: string, options?: IReadOptions): [Error, undefined] | [null, any];
    /**
     *  Safe version of `jsonc.write()`. Asynchronously writes a JSON file
     *  from the given JavaScript object.
     *  @name jsonc.safe.write
     *  @function
     *
     *  @param {string} filePath - Path to JSON file to be written.
     *  @param {any} data - Data to be stringified into JSON.
     *  @param {IWriteOptions} [options] - Write options.
     *  @param {Replacer} [options.replacer] - Determines how object values
     *  are stringified for objects. It can be a function or an array of
     *  strings.
     *  @param {string|number} [options.space] - Specifies the indentation
     *  of nested structures. If it is omitted, the text will be packed
     *  without extra whitespace. If it is a number, it will specify the
     *  number of spaces to indent at each level. If it is a string (such as
     *  "\t" or "&nbsp;"), it contains the characters used to indent at each
     *  level.
     *  @param {number} [options.mode=438] - FileSystem permission mode to
     *  be used when writing the file. Default is `438` (`0666` in octal).
     *  @param {boolean} [options.autoPath=true] - Specifies whether to
     *  create path directories if they don't exist. This will throw if set
     *  to `false` and path does not exist.
     *
     *  @returns {Promise<Array>} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful,
     *  second item will be the result: `Promise<[Error, boolean]>`
     *
     *  @example <caption>Using async/await (recommended)</caption>
     *  import { safe as jsonc } from 'jsonc';
     *  (async () => {
     *      const [err, success] = await jsonc.write('path/to/file.json', data);
     *      if (err) {
     *          console.log('Failed to read JSON file');
     *      } else {
     *          console.log('Successfully wrote JSON file');
     *      }
     *  })();
     *
     *  @example <caption>Using promises</caption>
     *  import { safe as jsonc } from 'jsonc';
     *  jsonc.write('path/to/file.json', data)
     *      .then([err, obj] => {
     *           if (err) {
     *               console.log('Failed to read JSON file');
     *           } else {
     *               console.log('Successfully wrote JSON file');
     *           }
     *      })
     *      // .catch(err => {}); // this is never invoked when safe version is used.
     */
    static write(filePath: string, data: any, options?: IWriteOptions): Promise<[Error, undefined] | [null, boolean]>;
    /**
     *  Safe version of `jsonc.writeSync()`. Synchronously writes a JSON
     *  file from the given JavaScript object.
     *  @name jsonc.safe.writeSync
     *  @function
     *
     *  @param {string} filePath - Path to JSON file to be written.
     *  @param {any} data - Data to be stringified into JSON.
     *  @param {IWriteOptions} [options] - Write options.
     *  @param {Replacer} [options.replacer] - Determines how object values
     *  are stringified for objects. It can be a function or an array of
     *  strings.
     *  @param {string|number} [options.space] - Specifies the indentation
     *  of nested structures. If it is omitted, the text will be packed
     *  without extra whitespace. If it is a number, it will specify the
     *  number of spaces to indent at each level. If it is a string (such as
     *  "\t" or "&nbsp;"), it contains the characters used to indent at each
     *  level.
     *  @param {number} [options.mode=438] - FileSystem permission mode to
     *  be used when writing the file. Default is `438` (`0666` in octal).
     *  @param {boolean} [options.autoPath=true] - Specifies whether to
     *  create path directories if they don't exist. This will throw if set
     *  to `false` and path does not exist.
     *
     *  @returns {Array} - Safe methods return an array with the
     *  first item being the `Error` instance caught. If successful, second
     *  item will be the result: `[Error, boolean]`
     *
     *  @example
     *  import { safe as jsonc } from 'jsonc';
     *  const [err, obj] = jsonc.writeSync('path/to/file.json');
     *  if (!err) console.log(typeof obj); // "object"
     */
    static writeSync(filePath: string, data: any, options?: IWriteOptions): [Error, undefined] | [null, boolean];
}
export { jsoncSafe };
