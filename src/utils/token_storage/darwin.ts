import keychain from "npm:keychain@1.5.0";

const KEYCHAIN_CREDS = { account: "Deno Deploy", service: "DeployCTL" };

export function getFromKeychain(): Promise<string | null> {
  return new Promise((resolve, reject) =>
    keychain.getPassword(
      KEYCHAIN_CREDS,
      (err: KeychainError, token: string) => {
        if (err && err.code !== "PasswordNotFound") {
          reject(err);
        } else {
          resolve(token);
        }
      },
    )
  );
}

export function storeInKeyChain(token: string): Promise<void> {
  return new Promise((resolve, reject) =>
    keychain.setPassword(
      { ...KEYCHAIN_CREDS, password: token },
      (err: KeychainError) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      },
    )
  );
}

export function removeFromKeyChain(): Promise<void> {
  return new Promise((resolve, reject) =>
    keychain.deletePassword(KEYCHAIN_CREDS, (err: KeychainError) => {
      if (err && err.code !== "PasswordNotFound") {
        reject(err);
      } else {
        resolve();
      }
    })
  );
}

interface KeychainError {
  code: string;
}
