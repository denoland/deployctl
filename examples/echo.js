addEventListener("fetch", (event) => {
  event.respondWith(
    new Response(event.request.body ?? "", {
      status: 200,
      headers: {
        server: "denosr",
        "content-type": "text/plain",
      },
    }),
  );
});
