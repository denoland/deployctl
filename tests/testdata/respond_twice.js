addEventListener("fetch", (event) => {
  event.respondWith(new Response("hello one"));
  event.respondWith(new Response("hello two"));
});
