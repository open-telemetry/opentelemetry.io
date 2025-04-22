---
title: Development setup and commands to build, serve, and more
linkTitle: Dev setup and more
description: Learn how to set up a development environment for this website.
weight: 60
---

The following instructions explain how to set up a development environment for
this website.

## Cloud-IDE setup

These instructions are for [Gitpod.io], adjust as needed for your favorite cloud
IDE:

1.  Fork this repository. For help, see [Fork a repository][fork].
2.  From [gitpod.io/workspaces], create a new workspace (do this only once) or
    open an existing workspace over your fork. You can also visit a link of the
    form:
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`.

    > **Note**: If you have the necessary permissions to work from this
    > repository, or just want to look around, open
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod automatically installs the repo-specific packages for you.

You're now ready to [build](#build), [serve](#serve) or make updates to the
website files.

## Local setup

1.  [Fork][] and then [clone][] the website repository at
    <{{% param github_repo %}}>.
2.  Go to the repository directory.
3.  Install or upgrade to the [**active LTS** release][nodejs-rel] of Node.js.
    We recommend using [nvm][] to manage your Node installation. Under Linux,
    run the following command, which will install and upgrade to the version
    specified in the .nvmrc file:

    ```sh
    nvm install
    ```

    To [install under Windows][nodejs-win], use [nvm-windows][]:

    ```cmd
    > nvm install lts && nvm use lts
    ```

4.  Get npm packages and other prerequisites:

    ```sh
    npm install
    ```

You're now ready to [build](#build), [serve](#serve) or make updates to the
website files.

### Build

To build the site run:

```sh
npm run build
```

The generated site files are under `public`.

### Serve

To serve the site run:

```sh
npm run serve
```

The site is served at [localhost:1313][].

If you need to test [Netlify] redirects, use the following command and visit the
site at [localhost:8888][]:

```sh
npm run serve:netlify
```

The serve command serves files from memory, not from disk.

If you see an error like `too many open files` or `pipe failed` under macOS, you
might need to increase the file descriptor limit. See
[Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

### Content and submodules

The website is built from the following content:

- Files under `content/`, `static/`, etc. per [Hugo][] defaults.
- Mount points, defined in [hugo.yaml][] under `mounts`. Mounts are either
  directly from git submodules under [content-modules][], or preprocessed
  content from `content-modules` (placed under `tmp/`), and no where else.

[hugo.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/hugo.yaml
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Submodule changes

If you change any content inside of a [content-modules][] submodule, then you
need to first submit a PR (containing the submodule changes) to the submodule's
repository. Only after the submodule PR has been accepted, can you update the
submodule and have the changes appear in this website.

It's easiest to manage your `content-modules` changes by working with the
repository that the corresponding submodule is linked to, rather than inside the
submodule itself.

Expert contributors can work directly in the submodule. You are then able to
directly build and serve your (submodule) changes. By default, the CI scripts
get submodules on every invocation. To prevent this behavior while you work
within a submodule, set the environment variable `GET=no`. You also need to run
`git fetch --unshallow` the submodule before you can submit a PR. Alternatively,
set `DEPTH=100` and re-fetch submodules.

[clone]:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]:
  https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm]:
  https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows