# deployctl

`deployctl` is the command line tool for Deno Deploy. This repository also
contains the `denoland/deployctl` GitHub Action.

## Install

```shell
deno install -Arf https://deno.land/x/deploy/deployctl.ts
```

## Usage

Before being able to deploy, you need to get a personal access token from the
[Deno Deploy access token page](https://dash.deno.com/account#access-tokens).
Store this token in a `DENO_DEPLOY_TOKEN` environment variable, or pass it to
`deployctl` with the `--token` flag.

```shell
deployctl deploy --project=hello-world ./examples/hello.ts
```

View the help:

```shell
deployctl -h
```

## Action Example

```yml
name: Deploy

on: push

jobs:
  deploy:
    runs-on: ubuntu-latest

    permissions:
      id-token: write # This is required to allow the GitHub Action to authenticate with Deno Deploy.
      contents: read

    steps:
      - name: Clone repository
        uses: actions/checkout@v3

      - name: Deploy to Deno Deploy
        uses: denoland/deployctl@v1
        with:
          project: my-project # the name of the project on Deno Deploy
          entrypoint: main.ts # the entrypoint to deploy
```

To learn more about the action, checkout [action readme](./action/README.md).
