import { getCachePaths } from "../info.ts";

export async function get(): Promise<string | null> {
  const { credentialsPath } = getCachePaths();
  try {
    const info = await Deno.lstat(credentialsPath);
    if (!info.isFile || (info.mode !== null && (info.mode & 0o777) !== 0o600)) {
      throw new Error(
        "The credentials file has been tampered with and will be ignored. Please delete it.",
      );
    }
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      return null;
    } else {
      throw e;
    }
  }
  try {
    const token = JSON.parse(await Deno.readTextFile(credentialsPath)).token;
    return token || null;
  } catch (_) {
    throw new Error(
      `The credentials file has been tampered with and will be ignored. Please delete it.`,
    );
  }
}

export async function store(token: string): Promise<void> {
  const { credentialsPath, cacheDir } = getCachePaths();
  await Deno.mkdir(cacheDir, { recursive: true });
  await Deno.writeTextFile(
    credentialsPath,
    JSON.stringify({ token }, null, 2),
    { mode: 0o600 },
  );
  return Promise.resolve();
}

export async function remove(): Promise<void> {
  const { credentialsPath, cacheDir } = getCachePaths();
  await Deno.mkdir(cacheDir, { recursive: true });
  await Deno.writeTextFile(credentialsPath, "{}", { mode: 0o600 });
  return Promise.resolve();
}
