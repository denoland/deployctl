try {
  await Deno.lstat("import_bomb1");
  throw new Error("BOOM!");
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) {
    throw e;
  }
}
try {
  await Deno.lstat("import_bomb2");
  throw new Error("BOOM!");
} catch (e) {
  if (!(e instanceof Deno.errors.NotFound)) {
    throw e;
  }
}
Deno.serve(() => new Response("Hello World"));
