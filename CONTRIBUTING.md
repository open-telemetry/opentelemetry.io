# Contributing to OpenTelemetry.io

## Quick fixes

For small changes to a single file, you can edit directly in GitHub by clicking
**Edit this file** button and then following the instructions in [Editing
files][].

## Dev setup

### Cloud-IDE setup

These instructions are for [Gitpod.io][], adjust as needed for your favorite
cloud IDE:

 1. Fork this repo. For help, see [Fork a repo][Fork].
 2. From [gitpod.io/workspaces][], create a new workspace (do this only once) or
    open an existing workspace over your fork. You can also visit a link of the
    form:
    <https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io>.

    > **Note**: If you have the necessary permissions to work from this repo, or
    just want to look around, open
    <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod will automatically install the repo-specific packages for you. You're now
ready to [build](#build), [serve](#serve) and/or make updates to the website
files.

### Local setup

 1. Install the latest [LTS release][] of **Node**. We recommend using
    **[nvm][]** to manage your Node installation (Linux command shown):
    ```console
    $ nvm install --lts
    ```
 2. [Fork][] and then [clone][] this repo.
 3. Change to the repo directory.
 4. Get npm packages and other prerequisites:
    ```console
    $ npm install
    ```

You're now ready to [build](#build), [serve](#serve) and/or make updates to the
website files.

## Build

To **build** the site run:

```console
$ npm run build
```

You'll find the generated site files under `public`.

## Serve

To **serve** the site run:

```console
$ npm run serve
```

> **Note 1**: The Netlify CLI will locally serve the site at  at [localhost:8888][].

> **Note 2**: The serve command serves files from memory, not from disk.

> **Note 3**: See an error like `too many open files` or `pipe failed` under
> macOS? You may need to increase the file descriptor limit. See [Hugo issue
> #6109](https://github.com/gohugoio/hugo/issues/6109).

## Content and submodules

The website is built from the following content:

- Files under `content/`, `static/`, etc. per [Hugo][] defaults.
- Mount points, defined in [config.yaml][] under `mounts`.
- Content from git submodules under [content-modules][].

Note that nonstandard mount points and symlinked sections under `content/` refer
to directories under [content-modules][], and no where else.

[config.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/config.yaml
[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

## Submitting a change

Before submitting a PR, run `npm run test` and address any reported issues.

### Submodule changes

If you change any content inside of a [content-modules][] submodule, then you'll
need to **_first_** submit a PR (containing the submodule changes) to the
submodule's repo. Only after the submodule PR has been accepted, can you update
the submodule and have the changes appear in this website.

It is easiest to manage your `content-modules` changes by working with the repo
that the corresponding submodule is linked to, rather than inside the submodule
itself.

> **For expert contributors**, you can work directly in the submodule. You'll
then be able to directly build and serve your (submodule) changes. By default,
the CI scripts get submodules on every invocation. To prevent this behavior
while you work within a submodule, set the environment variable `GET="no"`.
You'll also need to `git fetch --unshallow` the submodule before you can submit
a PR. Alternatively, set `DEPTH=" "` and re-fetch submodules.

## Site deploys and PR previews

If you submit a PR, Netlify will create a [deploy preview][] so that you can
review your changes. Once your PR is merged, Netlify deploys the updated site to
the production server.

> **Note**: PR previews include _draft pages_, but production builds do not.

To see deploy logs and more, visit project's [dashboard][] -- Netlify login
required.

[clone]: https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
[dashboard]: https://app.netlify.com/sites/opentelemetry/overview
[deploy preview]: https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/
[Editing files]: https://docs.github.com/en/repositories/working-with-files/managing-files/editing-files
[Fork]: https://docs.github.com/en/get-started/quickstart/fork-a-repo
[Gitpod.io]: https://gitpod.io
[gitpod.io/workspaces]: https://gitpod.io/workspaces
[Hugo]: https://gohugo.io
[localhost:8888]: http://localhost:8888
[LTS release]: https://nodejs.org/en/about/releases/
[Netlify]: https://netlify.com
[nvm]: https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
