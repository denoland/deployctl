# deployctl

Command line tool for Deno Deploy.

## Install

```shell
deno install --allow-read --allow-write --allow-env --allow-net --allow-run --no-check -r -f https://deno.land/x/deploy/deployctl.ts
```

## Usage

Before being able to deploy, you need to get a personal access token from the
[Deno Deploy account page](https://dash.deno.com/account). Store this token in a
`DEPLOY_TOKEN` environment variable, or pass it to `deployctl` with the
`--token` flag.

```shell
deployctl deploy --project=hello-world ./examples/hello.ts
```

View the help:

```shell
deployctl -h
```
