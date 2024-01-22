export function base64url(binary: Uint8Array): string {
  const binaryString = Array.from(binary).map((b) => String.fromCharCode(b))
    .join("");
  const output = btoa(binaryString);
  const urlSafeOutput = output
    .replaceAll("=", "")
    .replaceAll("+", "-")
    .replaceAll("/", "_");
  return urlSafeOutput;
}

export async function sha256(randomString: string): Promise<Uint8Array> {
  return new Uint8Array(
    await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(randomString),
    ),
  );
}
