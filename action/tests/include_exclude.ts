try {
  const q = await import("./import_bomb1.ts");
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) {
    throw e;
  }
}
try {
  const q = await import("./import_bomb2.ts");
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) {
    throw e;
  }
}
Deno.serve(() => new Response("Hello World"));
