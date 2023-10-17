export function parsePairs(
  args: string[],
): Promise<Record<string, string>> {
  return new Promise((res, rej) => {
    const out: Record<string, string> = {};

    for (const arg of args) {
      const parts = arg.split("=", 2);
      if (parts.length !== 2) {
        return rej(`${arg} must be in the format NAME=VALUE`);
      }
      out[parts[0]] = parts[1];
    }
    return res(out);
  });
}
