// Copyright 2023 Deno Land Inc. All rights reserved. MIT license.

// This script ensures that version specifier defined in `src/version.ts`
// matches the released tag version.
// Intended to run when a draft release is created on GitHub.

import { VERSION } from "../src/version.ts";
import { assertEquals } from "jsr:@std/assert@0.217";

const releaseTagVersion = Deno.env.get("RELEASE_TAG")!;
assertEquals(VERSION, releaseTagVersion);
