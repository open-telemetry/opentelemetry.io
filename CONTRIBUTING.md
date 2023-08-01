# Contributing to OpenTelemetry.io

## Quick fixes

For small changes to a single file, you can edit directly in GitHub by clicking
**Edit this file** button and then following the instructions in [Editing
files][].

## Dev setup

### Cloud-IDE setup

These instructions are for [Gitpod.io][], adjust as needed for your favorite
cloud IDE:

1.  Fork this repo. For help, see [Fork a repo][fork].
2.  From [gitpod.io/workspaces][], create a new workspace (do this only once) or
    open an existing workspace over your fork. You can also visit a link of the
    form:
    <https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io>.

    > **Note**: If you have the necessary permissions to work from this repo, or
    > just want to look around, open
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod will automatically install the repo-specific packages for you. You're now
ready to [build](#build), [serve](#serve) and/or make updates to the website
files.

### Local setup

1.  [Fork][] and then [clone][] this repo.
2.  **Change** to the repo directory.
3.  **Install or upgrade** to the [**active LTS** release][nodejs-rel] of
    **Node.js**. We recommend using **[nvm][]** to manage your Node
    installation. Under Linux, run the following command (which will
    install/upgrade to the version specified in [.nvmrc][]):

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

You're now ready to [build](#build), [serve](#serve) and/or make updates to the
website files.

## Build

To **build** the site run:

```sh
npm run build
```

You'll find the generated site files under `public`.

## Serve

To **serve** the site run:

```sh
npm run serve
```

The site will be served at [localhost:1313][].

If you need to test [Netlify] redirects, use the following command, and visit
the site at [localhost:8888][]:

```sh
npm run serve:netlify
```

> **Note 1**: The serve command serves files from memory, not from disk.
>
> **Note 2**: See an error like `too many open files` or `pipe failed` under
> macOS? You may need to increase the file descriptor limit. See
> [Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).

## Content and submodules

The website is built from the following content:

- Files under `content/`, `static/`, etc. per [Hugo][] defaults.
- Mount points, defined in [hugo.yaml][] under `mounts`. Mounts are either
  directly from git submodules under [content-modules][], or preprocessed
  content from `content-modules` (placed under `tmp/`), and no where else.

[hugo.yaml]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/hugo.yaml
[content-modules]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

## Found a problem?

If you find a problem with the content of this repo, or you would like to
request an enhancement, [create an issue][new-issue].

> **NOTE**: As a general policy, we only _assign_ issues to community members
> who have already made contributions to the [OpenTelemetry organization][org].

## Submitting a change

Enhancements and fixes to the website are most welcome! Before submitting a
[pull request][pr] (PR) to the repo, run the following command and address any
reported issues. Also commit any files changed by the `fix` script:

```sh
npm run s fix test
```

To separately test and fix issues with your files, run:

```sh
npm run test # checks but does not update any files
npm run fix  # may update files
```

To list available NPM scripts, run `npm run`.

### Submodule changes

If you change any content inside of a [content-modules][] submodule, then you'll
need to **_first_** submit a PR (containing the submodule changes) to the
submodule's repo. Only after the submodule PR has been accepted, can you update
the submodule and have the changes appear in this website.

It is easiest to manage your `content-modules` changes by working with the repo
that the corresponding submodule is linked to, rather than inside the submodule
itself.

> **For expert contributors**, you can work directly in the submodule. You'll
> then be able to directly build and serve your (submodule) changes. By default,
> the CI scripts get submodules on every invocation. To prevent this behavior
> while you work within a submodule, set the environment variable `GET=no`.
> You'll also need to `git fetch --unshallow` the submodule before you can
> submit a PR. Alternatively, set `DEPTH=100` and re-fetch submodules.

## Site deploys and PR previews

If you submit a PR, Netlify will create a [deploy preview][] so that you can
review your changes. Once your PR is merged, Netlify deploys the updated site to
the production server.

> **Note**: PR previews include _draft pages_, but production builds do not.

To see deploy logs and more, visit project's [dashboard][] -- Netlify login
required.

[.nvmrc]: .nvmrc
[clone]:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[dashboard]: https://app.netlify.com/sites/opentelemetry/overview
[deploy preview]:
  https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/
[editing files]:
  https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files
[fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[hugo]: https://gohugo.io
[localhost:1313]: http://localhost:1313
[localhost:8888]: http://localhost:8888
[netlify]: https://netlify.com
[new-issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
[nodejs-rel]: https://nodejs.org/en/about/releases/
[nodejs-win]:
  https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm]:
  https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows
[org]: https://github.com/open-telemetry
[pr]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests
