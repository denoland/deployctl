import { dirname, fromFileUrl, join } from "@std/path";
import { assert, assertEquals, assertFalse } from "@std/assert";
import type { ManifestEntry } from "./api_types.ts";
import {
  containsEntryInManifest,
  convertPatternToRegExp,
  walk,
} from "./manifest.ts";

Deno.test({
  name: "convertPatternToRegExp",
  ignore: Deno.build.os === "windows",
  fn: () => {
    assertEquals(convertPatternToRegExp("foo"), new RegExp("^foo"));
    assertEquals(convertPatternToRegExp(".././foo"), new RegExp("^../foo"));
    assertEquals(convertPatternToRegExp("*.ts"), new RegExp("^[^/]*\\.ts/*"));
  },
});

Deno.test({
  name: "walk and containsEntryInManifest",
  fn: async (t) => {
    type Test = {
      name: string;
      input: {
        testdir: string;
        include: readonly string[];
        exclude: readonly string[];
      };
      expected: {
        entries: Record<string, ManifestEntry>;
        containedEntries: readonly string[];
        notContainedEntries: readonly string[];
      };
    };

    const tests: Test[] = [
      {
        name: "single_file",
        input: {
          testdir: "single_file",
          include: [],
          exclude: [],
        },
        expected: {
          entries: {
            "a.txt": {
              kind: "file",
              gitSha1: "78981922613b2afb6025042ff6bd878ac1994e85",
              size: 2,
            },
          },
          containedEntries: ["a.txt"],
          notContainedEntries: ["b.txt", ".git", "deno.json"],
        },
      },
      {
        name: "single_file with include",
        input: {
          testdir: "single_file",
          include: ["a.txt"],
          exclude: [],
        },
        expected: {
          entries: {
            "a.txt": {
              kind: "file",
              gitSha1: "78981922613b2afb6025042ff6bd878ac1994e85",
              size: 2,
            },
          },
          containedEntries: ["a.txt"],
          notContainedEntries: ["b.txt", ".git", "deno.json"],
        },
      },
      {
        name: "single_file with include 2",
        input: {
          testdir: "single_file",
          include: ["*.txt"],
          exclude: [],
        },
        expected: {
          entries: {
            "a.txt": {
              kind: "file",
              gitSha1: "78981922613b2afb6025042ff6bd878ac1994e85",
              size: 2,
            },
          },
          containedEntries: ["a.txt"],
          notContainedEntries: ["b.txt", ".git", "deno.json"],
        },
      },
      {
        name: "single_file with exclude",
        input: {
          testdir: "single_file",
          include: [],
          exclude: ["a.txt"],
        },
        expected: {
          entries: {},
          containedEntries: [],
          notContainedEntries: ["a.txt", "b.txt", ".git", "deno.json"],
        },
      },
      {
        name: "two_levels",
        input: {
          testdir: "two_levels",
          include: [],
          exclude: [],
        },
        expected: {
          entries: {
            "a.txt": {
              kind: "file",
              gitSha1: "78981922613b2afb6025042ff6bd878ac1994e85",
              size: 2,
            },
            "inner": {
              kind: "directory",
              entries: {
                "b.txt": {
                  kind: "file",
                  gitSha1: "61780798228d17af2d34fce4cfbdf35556832472",
                  size: 2,
                },
              },
            },
          },
          containedEntries: ["a.txt", "inner/b.txt"],
          notContainedEntries: [
            "b.txt",
            "inner/a.txt",
            ".git",
            "deno.json",
            "inner",
          ],
        },
      },
      {
        name: "two_levels with include",
        input: {
          testdir: "two_levels",
          include: ["**/b.txt"],
          exclude: [],
        },
        expected: {
          entries: {
            "inner": {
              kind: "directory",
              entries: {
                "b.txt": {
                  kind: "file",
                  gitSha1: "61780798228d17af2d34fce4cfbdf35556832472",
                  size: 2,
                },
              },
            },
          },
          containedEntries: ["inner/b.txt"],
          notContainedEntries: [
            "a.txt",
            "b.txt",
            "inner/a.txt",
            ".git",
            "deno.json",
            "inner",
          ],
        },
      },
      {
        name: "two_levels with exclude",
        input: {
          testdir: "two_levels",
          include: [],
          exclude: ["*.txt"],
        },
        expected: {
          entries: {
            "inner": {
              kind: "directory",
              entries: {
                "b.txt": {
                  kind: "file",
                  gitSha1: "61780798228d17af2d34fce4cfbdf35556832472",
                  size: 2,
                },
              },
            },
          },
          containedEntries: ["inner/b.txt"],
          notContainedEntries: [
            "a.txt",
            "b.txt",
            "inner/a.txt",
            ".git",
            "deno.json",
            "inner",
          ],
        },
      },
      {
        name: "complex",
        input: {
          testdir: "complex",
          include: [],
          exclude: [],
        },
        expected: {
          entries: {
            "a.txt": {
              kind: "file",
              gitSha1: "78981922613b2afb6025042ff6bd878ac1994e85",
              size: 2,
            },
            "inner1": {
              kind: "directory",
              entries: {
                "b.txt": {
                  kind: "file",
                  gitSha1: "61780798228d17af2d34fce4cfbdf35556832472",
                  size: 2,
                },
              },
            },
            "inner2": {
              kind: "directory",
              entries: {
                "b.txt": {
                  kind: "file",
                  gitSha1: "61780798228d17af2d34fce4cfbdf35556832472",
                  size: 2,
                },
              },
            },
          },
          containedEntries: ["a.txt", "inner1/b.txt", "inner2/b.txt"],
          notContainedEntries: [
            "b.txt",
            "inner1/a.txt",
            "inner2/a.txt",
            ".git",
            "deno.json",
            "inner1",
            "inner2",
          ],
        },
      },
    ];

    for (const test of tests) {
      await t.step({
        name: test.name,
        fn: async () => {
          const { manifestEntries } = await walk(
            join(
              fromFileUrl(dirname(import.meta.url)),
              "manifest_testdata",
              test.input.testdir,
            ),
            join(
              fromFileUrl(dirname(import.meta.url)),
              "manifest_testdata",
              test.input.testdir,
            ),
            {
              include: test.input.include.map(convertPatternToRegExp),
              exclude: test.input.exclude.map(convertPatternToRegExp),
            },
          );
          assertEquals(manifestEntries, test.expected.entries);

          for (const entry of test.expected.containedEntries) {
            const contained = containsEntryInManifest(manifestEntries, entry);
            assert(
              contained,
              `Expected ${entry} to be contained in the manifest`,
            );
          }

          for (const entry of test.expected.notContainedEntries) {
            const contained = containsEntryInManifest(manifestEntries, entry);
            assertFalse(
              contained,
              `Expected ${entry} to *not* be contained in the manifest`,
            );
          }
        },
      });
    }
  },
});
