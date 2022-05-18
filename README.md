# deployctl

`deployctl` is the command line tool for Deno Deploy. This repository also
contains the `denoland/deployctl` GitHub Action.

> ⚠ [For more on the GitHub Action, go here](./action/README.md)

## Install

```shell
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

## Usage

Before being able to deploy, you need to get a personal access token from the
[Deno Deploy access token page](https://dash.deno.com/user/access-tokens). Store this token in a
`DENO_DEPLOY_TOKEN` environment variable, or pass it to `deployctl` with the
`--token` flag.

```shell
deployctl deploy --project=hello-world ./examples/hello.ts
```

View the help:

```shell
deployctl -h
```
