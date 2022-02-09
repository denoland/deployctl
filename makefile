fmt:
	deno fmt

lint:
	deno lint

test:
	deno test -A --unstable tests/ src/

build-action:
	deno bundle ./src/utils/mod.ts > ./action/deps.js