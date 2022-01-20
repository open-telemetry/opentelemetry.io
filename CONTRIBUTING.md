# Contributing to OpenTelemetry.io

## Dev setup

Follow these steps for local or [cloud-IDE][] (via [Gitpod.io][]) development:

- Fork and clone this repository (for local development only).
- Install the latest [LTS release][] of **Node**, using **[nvm][]** for example:
  ```console
  $ nvm install lts
  ```
- Use the latest LTS release
  ```console
  $ nvm use lts
  ```
- Get npm packages and other prerequisites:
  ```console
  $ npm install
  ```
- Serve the site locally at [localhost:8888][]:
  ```console
  $ npm run serve
  ```
  > **Note**: See an error like `too many open files` or `pipe failed` under macOS? You may need to increase the file descriptor limit. See [Hugo issue #6109](https://github.com/gohugoio/hugo/issues/6109).
- To build the site only, run:
  ```console
  $ npm run build
  ```
  You'll find the generated site files under `public`.

## Content and submodules

The website is built from:

- Content under `content/`, `static/`, etc. per usual for [Hugo][] sites.
- Mount points, defined in [config.yaml][] under `mounts`.
- Content from git submodules under [content-modules][].

Note that nonstandard mount points and symlinked sections under `content/` refer
to directories under [content-modules][], and no where else.

[config.yaml]: https://github.com/open-telemetry/opentelemetry.io/blob/main/config.yaml
[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules

## Submitting a change

Before submitting a PR, run `npm run test` and address any issues uncovered.

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

[cloud-IDE]: https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io
[dashboard]: https://app.netlify.com/sites/opentelemetry/overview
[deploy preview]: https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/
[Gitpod.io]: https://gitpod.io
[Hugo]: https://gohugo.io
[localhost:8888]: http://localhost:8888
[LTS release]: https://nodejs.org/en/about/releases/
[Netlify]: https://netlify.com
[nvm]: https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
