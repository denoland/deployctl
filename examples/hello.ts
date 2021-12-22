import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

async function handler(_req: Request) {
  const text = await Deno.readTextFile(new URL(import.meta.url));
  return new Response(text, {
    headers: { "content-type": "text/plain" },
  });
}

console.log("Listening on http://localhost:8000");
serve(handler);
