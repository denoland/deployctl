export const encoder = new TextEncoder();

export function encode(input?: string): Uint8Array {
  return encoder.encode(input);
}
