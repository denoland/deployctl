import { interruptSpinner, wait } from "./spinner.ts";

interface TokenStorage {
  get: () => Promise<string | null>;
  store: (token: string) => Promise<void>;
  remove: () => Promise<void>;
}

let defaultMode = false;

let module: TokenStorage;
if (Deno.build.os === "darwin") {
  const darwin = await import("./token_storage/darwin.ts");
  const memory = await import("./token_storage/memory.ts");
  module = {
    get: defaultOnError(
      "Failed to get token from Keychain. Will provision a new token for this execution but please make sure to fix the issue afterwards.",
      memory.get,
      darwin.getFromKeychain,
    ),
    store: defaultOnError(
      "Failed to store token into Keychain. Will keep it in memory for the duration of this execution but please make sure to fix the issue afterwards.",
      memory.store,
      darwin.storeInKeyChain,
    ),
    remove: defaultOnError(
      "Failed to remove token from Keychain",
      memory.remove,
      darwin.removeFromKeyChain,
    ),
  };
} else {
  const fs = await import("./token_storage/fs.ts");
  const memory = await import("./token_storage/memory.ts");
  module = {
    get: defaultOnError(
      "Failed to get token from credentials file. Will provision a new token for this execution but please make sure to fix the issue afterwards.",
      memory.get,
      fs.get,
    ),
    store: defaultOnError(
      "Failed to store token in credentials file. Will keep it in memory for the duration of this execution but please make sure to fix the issue afterwards.",
      memory.store,
      fs.store,
    ),
    remove: defaultOnError(
      "Failed to remove token from credentials file",
      memory.remove,
      fs.remove,
    ),
  };
}
export default module;

function defaultOnError<
  // deno-lint-ignore no-explicit-any
  F extends (...args: any) => Promise<any>,
>(
  notification: string,
  defaultFn: (...params: Parameters<F>) => ReturnType<F>,
  fn: (...params: Parameters<F>) => ReturnType<F>,
): (...params: Parameters<F>) => ReturnType<F> {
  return (...params) => {
    if (defaultMode) {
      return defaultFn(...params);
    } else {
      return fn(...params)
        .catch((err) => {
          const spinnerInterrupt = interruptSpinner();
          wait("").start().warn(notification);
          let errStr = err.message;
          if (errStr.length > 90) {
            errStr = errStr.slice(0, 90) + "...";
          }
          wait({ text: "", indent: 3 }).start().fail(errStr);
          spinnerInterrupt.resume();
          defaultMode = true;
          return defaultFn(...params);
        }) as ReturnType<F>;
    }
  };
}
