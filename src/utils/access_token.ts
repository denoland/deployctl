import { interruptSpinner, wait } from "./spinner.ts";
import { error } from "../error.ts";
import { endpoint, USER_AGENT } from "./api.ts";
import tokenStorage from "./token_storage.ts";
import { base64url, sha256 } from "./hashing_encoding.ts";
import { stringify as stringifyError } from "../error.ts";

export default {
  get: tokenStorage.get,

  async provision() {
    // Synchronize provision routine
    // to prevent multiple authorization flows from triggering concurrently
    this.provisionPromise ??= provision();
    const token = await this.provisionPromise;
    this.provisionPromise = null;
    return token;
  },
  provisionPromise: null as Promise<string> | null,

  revoke: tokenStorage.remove,
};

async function provision(): Promise<string> {
  const spinnerInterrupted = interruptSpinner();
  wait("").start().info("Provisioning a new access token...");
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const claimVerifier = base64url(randomBytes);
  const claimChallenge = base64url(await sha256(claimVerifier));

  const tokenStream = await fetch(
    `${endpoint()}/api/signin/cli/access_token`,
    {
      method: "POST",
      headers: { "User-Agent": USER_AGENT },
      body: claimVerifier,
    },
  );
  if (!tokenStream.ok) {
    error(
      `when requesting an access token: ${await tokenStream.statusText}`,
    );
  }
  const url = `${endpoint()}/signin/cli?claim_challenge=${claimChallenge}`;

  wait("").start().info(`Authorization URL: ${url}`);
  let openCmd;
  const args = [];
  // TODO(arnauorriols): use npm:open or deno.land/x/open when either is compatible
  switch (Deno.build.os) {
    case "darwin": {
      openCmd = "open";
      break;
    }
    case "linux": {
      openCmd = "xdg-open";
      break;
    }
    case "windows": {
      // Windows Start-Process is a cmdlet of PowerShell
      openCmd = "PowerShell.exe";
      args.push("Start-Process");
      break;
    }
  }
  args.push(url);
  let open;
  if (openCmd !== undefined) {
    try {
      open = new Deno.Command(openCmd, {
        args,
        stderr: "piped",
        stdout: "piped",
      })
        .spawn();
    } catch (error) {
      wait("").start().warn(
        "Unexpected error while trying to open the authorization URL in your default browser. Please report it at https://github.com/denoland/deployctl/issues/new.",
      );
      wait({ text: "", indent: 3 }).start().fail(stringifyError(error));
    }
  }
  if (open == undefined) {
    const warn =
      "Cannot open the authorization URL automatically. Please navigate to it manually using your usual browser";
    wait("").start().info(warn);
  } else if (!(await open.status).success) {
    const warn =
      "Failed to open the authorization URL in your default browser. Please navigate to it manually";
    wait("").start().warn(warn);
    let error = new TextDecoder().decode((await open.output()).stderr);
    const errIndent = 2;
    const elipsis = "...";
    const maxErrLength = warn.length - errIndent;
    if (error.length > maxErrLength) {
      error = error.slice(0, maxErrLength - elipsis.length) + elipsis;
    }
    // resulting indentation is 1 less than configured
    wait({ text: "", indent: errIndent + 1 }).start().fail(error);
  }

  const spinner = wait("Waiting for authorization...").start();

  const tokenOrError = await tokenStream.json();

  if (tokenOrError.error) {
    error(`could not provision the access token: ${tokenOrError.error}`);
  }

  await tokenStorage.store(tokenOrError.token);
  spinner.succeed("Token obtained successfully");
  spinnerInterrupted.resume();
  return tokenOrError.token;
}
