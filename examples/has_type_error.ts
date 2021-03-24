// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.
addEventListener("fetch", (event) => {
  console.foo("bar");
  event.respondWith(
    new Response("Hello world!", {
      status: 200,
      headers: {
        server: "denosr",
        "content-type": "text/plain",
      },
    }),
  );
});
