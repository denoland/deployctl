bundle:
	echo "// Copyright 2021 Deno Land Inc. All rights reserved. MIT license.\n// deno-lint-ignore-file\n// deno-fmt-ignore-file" > src/runtime.bundle.js
	deno bundle src/runtime.js >> src/runtime.bundle.js

fmt:
	deno fmt

lint:
	deno lint
