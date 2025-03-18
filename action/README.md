# denoland/deployctl <!-- omit in toc -->

GitHub Actions for deploying to Deno Deploy.

> ⚠ If your project does not require a build step, we recommend you use the
> ["Automatic" deployment mode](https://docs.deno.com/deploy/manual/ci_github#automatic)
> of our GitHub integration. It is faster and requires no setup.

- [Usage](#usage)
  - [Permissions](#permissions)
  - [Inputs](#inputs)
- [Examples](#examples)
  - [Deploy everything](#deploy-everything)
  - [Deploy a directory](#deploy-a-directory)
  - [Filter content with `include` and `exclude`](#filter-content-with-include-and-exclude)
  - [Use external or absolute path as an entrypoint](#use-external-or-absolute-path-as-an-entrypoint)
  - [Use import map](#use-import-map)

## Usage

To deploy you just need to include the Deno Deploy GitHub Action as a step in
your workflow.

You do **not** need to set up any secrets for this to work.

You **do** need to link your GitHub repository to your Deno Deploy project. You
have to choose the "GitHub Actions" deployment mode in your project settings on
https://dash.deno.com. Read
[Deno Deploy documentation](https://docs.deno.com/deploy/manual/ci_github#github-action)
for more information.

### Permissions

You have to set `id-token: write` permission to authenticate with Deno Deploy.

```yaml
jobs:
  deploy:
    permissions:
      id-token: write # required
      contents: read
    steps:
# your steps here...
```

### Inputs

```yaml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    # Name of the project on Deno Deploy
    # Required.
    project:

    # Entrypoint location executed by Deno Deploy
    # The entrypoint can be a relative path or an absolute URL.
    # If it is a relative path, it will be resolved relative to the `root` directory.
    # Required.
    entrypoint:

    # Root directory to deploy
    # All files and subdirectories will be deployed.
    # Optional. Default is "process.cwd()"
    root:

    # Filter which files to include in the deployment
    # It supports a single file, multiple files separated by a comma or by a newline
    # Optional.
    include:

    # Filter which files to exclude in the deployment
    # It supports a single file, multiple files separated by a comma or by a newline
    # Optional.
    exclude:

    # Location of an import map
    # Must be relative to root directory
    # Optional.
    import-map:
```

## Examples

### Deploy everything

All files and subdirectories in the **working directory** will be deployed.

```yaml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: main.ts
```

### Deploy a directory

All files and subdirectories in the **specified directory** will be deployed.

```yaml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: main.ts # the entrypoint is relative to the root directory (path/to/your/directory/main.ts)
    root: path/to/your/directory
```

### Filter content with `include` and `exclude`

Use `include` and `exclude` to filter which contents to deploy.

```yaml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: main.ts # the entrypoint must be relative to the root directory
    include: |
      main.ts
      dist
    exclude: node_modules
```

You can set a single file

```yaml
include: main.ts
```

multiple files or directories, separated by a comma

```yaml
include: main.ts,dist
```

or separated by a newline

```yaml
include: |
  main.ts
  dist
```

### Use external or absolute path as an entrypoint

`entrypoint` supports absolute path (`file://`) and external path (`https://`)

```yaml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: https://your-external-path/mod.ts
```

An interesting use case is to directly use
[std/http/file_server.ts](https://deno.land/std/http/file_server.ts) as
suggested in
[Deploy a static site](https://docs.deno.com/deploy/tutorials/static-site)
tutorial.

```yaml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: https://deno.land/std/http/file_server.ts
```

### Use import map

You can specify an [import map](https://github.com/WICG/import-maps).

```yaml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: main.ts
    import-map: path/to/import-map.json
```
