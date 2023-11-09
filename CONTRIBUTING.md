# Contributing to OpenTelemetry.io

Thanks for your interest in contributing to
[OpenTelemetry.io](https://opentelemetry.io/)! Here are a few general guidelines
on contributing and reporting bugs that we ask you to review. Following these
guidelines helps to communicate that you respect the time of the contributors
managing and developing this open source project. In return, they should
reciprocate that respect in addressing your issue, assessing changes, and
helping you finalize your pull requests. In that spirit of mutual respect, we
endeavor to review incoming issues and pull requests, and will close any
lingering issues or pull requests after long times of inactivity.

Note that all of your interactions in the project are subject to our
[Code of Conduct](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md).
This includes creation of issues or pull requests, commenting on issues or pull
requests, and extends to all interactions in any real-time space e.g., Slack,
Discord, etc.

Also review the general
[OpenTelemetry Contributor Guide](https://github.com/open-telemetry/community/blob/main/CONTRIBUTING.md),
that will provide additional details, especially that you need to sign a
Contributor License Agreement (CLA) before you can contribute.

## Found a security issue?

If you discover a security issue, **do not** report it through GitHub. Instead,
follow the steps in our
[Security Policy](https://github.com/open-telemetry/opentelemetry.io/security/policy).

## Found a problem?

If you find a problem with the content of this repository, or you would like to
request an enhancement, [create an issue][new-issue].

Before reporting a new issue, please ensure that the issue was not already
reported or fixed by searching through our
[issues list](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

When creating a new issue, include a short meaningful title and clear a
description, as much relevant information as possible, and, if possible, a test
case.

## Want to work on an existing issue?

This is the best way how you can help us to make our documentation better! Take
a look at issues tagged with
[help wanted](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22help+wanted%22)
and
[good first issue](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc+label%3A%22good+first+issue%22)
to find an opportunity to contribute and help us. The good first issue label
indicates that members have committed to providing extra assistance for new
contributors.

After picking an issue, read through the existing discussion, ask the
maintainers if this issue is still relevant and ask all questions you need for
clarification. Afterwards you can state in a comment that you intend to work on
this issue and it will be assumed to be yours. We will **not** assign issues to
non-community members who have already made contributions to the [OpenTelemetry
organization][org]. After confirmation through a maintainer, plan to provide a
PR shortly or let maintainers now if you run into any blockers.

## Sending Pull Requests

Enhancements and fixes to the website are most welcome!

Before sending a new [pull request][pr] (PR), take a look at existing
[pull requests](https://github.com/open-telemetry/opentelemetry.io/pulls?q=is%3Apr+is%3Aopen+sort%3Aupdated-desc)
and
[issues](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc)
to see if the proposed change or fix has been discussed in the past, or if the
change was already implemented but not yet released.

### Quick fixes

For small changes to a single file, you can edit directly in GitHub by clicking
**Edit this file** button. After forking the repository, follow the instructions
in [Editing files][].

For everything else, follow the
[instructions to setup a development environment](#development) below.

### PR Guidelines

Before a PR gets merged, it will sometimes require a few iterations of
review-and-edit. To help us and yourself make this process as easy as possible,
we ask that adhere to the following:

- If your PR isn't a [quick fix](#quick-fixes), then **work from a fork**: Click
  the [Fork](https://github.com/open-telemetry/opentelemetry.io/fork) button at
  the top of the repository and clone the fork locally. When you are ready,
  raise a PR with the upstream repository.
- **Do not work from the `main`** branch of your fork, but create a PR-specific
  branch.
- Ensure that maintainers are
  [allowed to apply changes to your pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork).

### Merge requirements

- No “changes requested” reviews by approvers, maintainers, technical committee
  members, or subject matter experts
- No unresolved conversations
- Approved by at least one approver
- No failing PR checks
- PR branch is up-to-date with the base branch

> **Important**
>
> Do not worry too much about failing PR checks! Community members will help you
> to get them fixed, by either providing you with instructions how to fix them
> or by fixing them on your behave.

## Development

The following instructions will help you to setup a development environment of
the <https://opentelemetry.io/> website.

### Setup

#### Cloud-IDE setup

These instructions are for [Gitpod.io][], adjust as needed for your favorite
cloud IDE:

1.  Fork this repository. For help, see [Fork a repository][fork].
2.  From [gitpod.io/workspaces][], create a new workspace (do this only once) or
    open an existing workspace over your fork. You can also visit a link of the
    form:
    <https://gitpod.io#https://github.com/YOUR_GITHUB_ID/opentelemetry.io>.

    > **Note**: If you have the necessary permissions to work from this
    > repository, or just want to look around, open
    > <https://gitpod.io/#https://github.com/open-telemetry/opentelemetry.io>.

Gitpod will automatically install the repo-specific packages for you. You're now
ready to [build](#build), [serve](#serve) and/or make updates to the website
files.

#### Local setup

1.  [Fork][] and then [clone][] this repository.
2.  **Change** to the repository directory.
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

### Build

To **build** the site run:

```sh
npm run build
```

You'll find the generated site files under `public`.

### Serve

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

### Submitting a change

Before submitting a to the repository, run the following command and address any
reported issues. Also commit any files changed by the `fix` script:

```sh
npm run test-and-fix
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
submodule's repository. Only after the submodule PR has been accepted, can you
update the submodule and have the changes appear in this website.

It is easiest to manage your `content-modules` changes by working with the
repository that the corresponding submodule is linked to, rather than inside the
submodule itself.

> **For expert contributors**, you can work directly in the submodule. You'll
> then be able to directly build and serve your (submodule) changes. By default,
> the CI scripts get submodules on every invocation. To prevent this behavior
> while you work within a submodule, set the environment variable `GET=no`.
> You'll also need to `git fetch --unshallow` the submodule before you can
> submit a PR. Alternatively, set `DEPTH=100` and re-fetch submodules.

### Site deploys and PR previews

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
[nodejs-rel]: https://nodejs.org/en/about/previous-releases
[nodejs-win]:
  https://docs.microsoft.com/en-us/windows/dev-environment/javascript/nodejs-on-windows
[nvm]:
  https://github.com/nvm-sh/nvm/blob/master/README.md#installing-and-updating
[nvm-windows]: https://github.com/coreybutler/nvm-windows
[org]: https://github.com/open-telemetry
[pr]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests
