import * as mkdirp from 'mkdirp';
import { IConfig, IStringifyOptions, Replacer } from './interfaces';
declare const helper: {
    isObject(o: any): boolean;
    isPrimitive(value: any): boolean;
    strLog(value: any, pretty: boolean): string;
    getLogger(config: IConfig, pretty: boolean): Function;
    getStringifyOptions(options: IStringifyOptions | Replacer, space: string | number): IStringifyOptions;
    fs: any;
    mkdirp: typeof mkdirp;
    promise: {
        readFile: any;
        writeFile: any;
        mkdirp: any;
    };
    safeSync<T, U = any>(fn: (...args: any[]) => T): (...args: any[]) => [U, T];
    safeAsync<T, U = any>(promise: Promise<T>): Promise<[U, T]>;
};
export { helper };
