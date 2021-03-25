bundle:
	echo "// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.\n// deno-lint-ignore-file\n// deno-fmt-ignore-file" > src/runtime.bundle.js
	deno bundle src/runtime.js >> src/runtime.bundle.js

fmt:
	deno fmt

lint:
	deno lint --unstable

test:
	deno test -A --unstable

cov:
	deno test -A --unstable --coverage=coverage/data
	deno coverage --unstable --exclude=tests --lcov coverage/data > coverage/lcov.info

cov-html:
	genhtml -o coverage/html coverage/lcov.info
