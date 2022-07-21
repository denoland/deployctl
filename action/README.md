# deployctl GitHub Action

The Deno Deploy GitHub Action allows for easy deployment to Deno Deploy from a
GitHub Actions workflow. This allows a simple way to have a build step before
deploying to Deno Deploy.

> ⚠ If your project does not require a build step, we recommend you use the
> ["Automatic" deployment mode][automatic-mode] of our GitHub integration. It is
> faster and requires no setup.

## Usage

To deploy you just need to include the Deno Deploy GitHub Action as a step in
your workflow.

You do **not** need to set up any secrets for this to work. You **do** need to
link your GitHub repository to your Deno Deploy project and choose the "GitHub
Actions" deployment mode. You can do this in your project settings on
https://dash.deno.com.

```yml
job:
  permissions:
    id-token: write # This is required to allow the GitHub Action to authenticate with Deno Deploy.
    contents: read
  steps:
    - name: Deploy to Deno Deploy
      uses: denoland/deployctl@v1
      with:
        project: my-project # the name of the project on Deno Deploy
        entrypoint: main.ts # the entrypoint to deploy
```

By default the entire contents of the repository will be deployed. This can be
changed by specifying the `root` option.

```yml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: index.js
    root: dist
```

The `entrypoint` can either be a relative path or file name, or a an absolute
URL. If it is a relative path, it will be resolved relative to the `root`. Both
absolute `file:///` and `https://` URLs are supported.

To deploy the `./dist` directory using the [std/http/file_server.ts][fileserver]
module, you can use the following configuration:

```yml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: https://deno.land/std/http/file_server.ts
    root: dist
```

If you want to use [import maps](https://github.com/WICG/import-maps):

```yml
- name: Deploy to Deno Deploy
  uses: denoland/deployctl@v1
  with:
    project: my-project
    entrypoint: https://deno.land/std/http/file_server.ts
    root: dist
    import-map: import-map.json
```

[automatic-mode]: https://deno.com/deploy/docs/projects#git-integration
[fileserver]: https://deno.land/std/http/file_server.ts
