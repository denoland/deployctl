import { IConfig, IParseOptions, IReadOptions, IStringifyOptions, IWriteOptions, Replacer, Reviver } from './interfaces';
import { jsoncSafe } from './jsonc.safe';
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
declare class jsonc {
    /** @private */
    private static _;
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
    static config(cfg: IConfig): void;
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
    static log(...args: any[]): void;
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
    static logp(...args: any[]): void;
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
    static parse(str: string, options?: IParseOptions | Reviver): any;
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
    static stringify(value: any, optionsOrReplacer?: IStringifyOptions | Replacer, space?: string | number): string;
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
    static isJSON(str: string, allowComments?: boolean): boolean;
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
    static stripComments(str: string, whitespace?: boolean): string;
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
    static uglify(str: string): string;
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
    static beautify(str: string, space?: string | number): string;
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
    static normalize(value: any, replacer?: Replacer): any;
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
    static read(filePath: string, options?: IReadOptions): Promise<any>;
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
    static readSync(filePath: string, options?: IReadOptions): any;
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
    static write(filePath: string, data: any, options?: IWriteOptions): Promise<boolean>;
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
    static writeSync(filePath: string, data: any, options?: IWriteOptions): boolean;
}
declare namespace jsonc {
    const safe: typeof jsoncSafe;
}
export { jsonc };
