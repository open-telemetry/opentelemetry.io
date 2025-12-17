---
title: Development setup and commands to build, serve, and more
linkTitle: Dev setup and more
description: Learn how to set up a development environment for this website.
what-next: >
  You're now ready to [build](#build), [serve](#serve), and make updates to
  website files. For details on how to submit changes, see [Submitting
  content][].
weight: 60
---

{{% alert title="Supported build environments" color=warning %}}

Builds are officially supported on Linux-based environments and macOS. Other
environments, such as [DevContainers](#devcontainers), are supported on a
best-effort basis. For builds on Windows, you can follow steps similar to those
for Linux using Windows Subsystem for Linux command line [WSL][windows-wsl].

{{% /alert %}}

The following instructions explain how to set up a development environment for
this website.

## Cloud-IDE setup

### Gitpod

To work via [Gitpod.io]:

1.  Fork this repository. For help, see [Fork a repository][fork].
2.  From [gitpod.io/workspaces], create a new workspace (do this only once) or
    open an existing workspace over your fork. You can also visit a link of the
    form:
    `https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io`.

    > **Note**: If you have the necessary permissions to work from this
    > repository, or just want to look around, open
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod automatically installs the repo-specific packages for you.
{{% param what-next %}}

### Codespaces

To work via GitHub [Codespaces]:

1. [Fork] the website repository.
2. Open a Codespace from your fork.

Your development environment will be initialized via the
[DevContainer](#devcontainers) configuration. {{% param what-next %}}

## Local setup

1.  [Fork] and then [clone] the website repository at
    <{{% param github_repo %}}>.
2.  Go to the repository directory:

    ```sh
    cd opentelemetry.io
    ```

3.  Install or upgrade to the [**active LTS** release][nodejs-rel] of Node.js.
    We recommend using [nvm] to manage your Node installation. Under Linux, run
    the following command, which will install and upgrade to the version
    specified in the .nvmrc file:

    ```sh
    nvm install
    ```

    To [install under Windows][nodejs-win], use [nvm-windows]. We recommend
    using `cmd` and not Windows PowerShell for the command below:

    ```cmd
    nvm install lts && nvm use lts
    ```

4.  Get npm packages and other prerequisites:

    ```sh
    npm install
    ```

Launch your favorite IDE. {{% param what-next %}}

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

The site is served at [localhost:1313].

If you need to test [Netlify] redirects, use the following command and visit the
site at [localhost:8888]:

```sh
npm run serve:netlify
```

The serve command serves files from memory, not from disk.

If you see an error like `too many open files` or `pipe failed` under macOS, you
might need to increase the file descriptor limit. See
[Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

### Content and submodules

The website is built from the following content:

- Files under `content/`, `static/`, etc. per [Hugo] defaults.
- Mount points, defined by Hugo [config] in
  `config/_default/module-template.yaml`. Mounts are either directly from git
  submodules under [content-modules], or preprocessed content from
  `content-modules` (placed under `tmp/`), and no where else.

[config]: https://github.com/open-telemetry/opentelemetry.io/tree/main/config
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

### Submodule changes

If you change any content inside of a [content-modules] submodule, then you need
to first submit a PR (containing the submodule changes) to the submodule's
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

## DevContainer support {#devcontainers}

This repository is configured for use in [Development
Containers][devcontainers], which are supported by various cloud and local IDEs
such as (in alphabetical order):

- [Codespaces][cs-devc]
- [DevPod](https://devpod.sh/docs/developing-in-workspaces/devcontainer-json)
- [Gitpod](https://www.gitpod.io/docs/flex/configuration/devcontainer/overview)
- [VSCode](https://code.visualstudio.com/docs/devcontainers/containers#_installation)

[clone]:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[codespaces]: https://docs.github.com/en/codespaces
[cs-devc]:
  https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/adding-a-dev-container-configuration/introduction-to-dev-containers#about-dev-containers
[devcontainers]: https://containers.dev/
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
[windows-wsl]: https://learn.microsoft.com/en-us/windows/wsl/install

<!-- markdownlint-disable link-image-reference-definitions -->

[Submitting content]: ../pull-requests/
