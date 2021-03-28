addEventListener("fetch", (event) => {
  const errors = [];
  try {
    setInterval(() => {
      console.log("setInterval working :(");
    }, 1);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    clearInterval(() => {
      console.log("clearInterval working :(");
    }, 1);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    setTimeout(() => {
      console.log("setTimeout working :(");
    }, 1);
  } catch (error) {
    errors.push(error.message);
  }

  try {
    clearTimeout(() => {
      console.log("clearTimeout working :(");
    }, 1);
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
