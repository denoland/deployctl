addEventListener("fetch", (event) => {
  const errors = [];
  let id;
  try {
    id = setInterval(() => {
      console.log("setInterval working :(");
    }, 1);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    clearInterval(id, 1);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    id = setTimeout(() => {
      console.log("setTimeout working :(");
    }, 1);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    clearTimeout(id, 1);
  } catch (error) {
    errors.push(error.message);
  }

  event.respondWith(
    new Response(JSON.stringify({ errors: errors.sort() }), {
      headers: {
        "content-type": "application/json",
      },
    }),
  );
});
