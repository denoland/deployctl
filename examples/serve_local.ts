// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.
addEventListener("fetch", (event) => {
  event.respondWith(
    fetch(new URL("../tests/testdata/data.json", import.meta.url)),
  );
});
