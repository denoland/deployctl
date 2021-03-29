// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.
addEventListener("fetch", (event) => {
  event.respondWith(
    new Response(JSON.stringify({ secret: Deno.env.get("SECRET") }), {
      status: 200,
      headers: {
        server: "denosr",
        "content-type": "application/json",
      },
    }),
  );
});
