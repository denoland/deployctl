# deployctl

`deployctl` is the command line tool for Deno Deploy. This repository also
contains the `denoland/deployctl` GitHub Action.

## Install

```shell
deno install -Arf jsr:@deno/deployctl
```

## Usage

The easiest way to get started with `deployctl` is to deploy one of the examples
in the [examples directory](./examples):

```shell
cd examples/hello-world
deployctl deploy
```

Visit the [deployctl docs](https://docs.deno.com/deploy/manual/deployctl) and
check out the help output to learn all you can do with deployctl:

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
