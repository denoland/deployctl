import { serve } from "std/http/server.ts";

async function handler(_req: Request) {
  const text = await Deno.readTextFile(new URL(import.meta.url));
  return new Response(text, {
    headers: { "content-type": "text/plain; charset=utf8" },
  });
}

console.log("Listening on http://localhost:8000");
serve(handler);
