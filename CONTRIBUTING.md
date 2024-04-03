# Contributing to OpenTelemetry.io

**Thanks for your interest in contributing to
[OpenTelemetry.io](https://opentelemetry.io/)!**

Follow these guidelines helps to communicate that you respect the time of the
contributors managing and developing this open source project. In return,
maintainers and approvers should reciprocate that respect in addressing your
issue, assessing changes, and helping you finalize your pull requests. In that
spirit of mutual respect, we endeavor to review incoming issues and pull
requests, and will close any lingering issues or pull requests after long times
of inactivity.

## Before you get started

### Code of Conduct

All of your interactions in this project are subject to our
[Code of Conduct](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md).
This includes the creation of issues or pull requests, commenting on issues or
pull requests, and extends to all interactions in any real-time space, for
example Slack, Discord, and so on.

### Contributor License Agreement

Review the general
[OpenTelemetry Contributor Guide](https://github.com/open-telemetry/community/blob/main/CONTRIBUTING.md),
as it provides additional details, especially that you need to sign a
Contributor License Agreement (CLA) before you can contribute.

### Found a security issue?

If you discover a security issue, read the
[Security Policy](https://github.com/open-telemetry/opentelemetry.io/security/policy)
before opening an issue.

### Found a problem?

If you find a bug or a problem with the content of this repository, or you would
like to request an enhancement, [create an issue][new-issue].

Before reporting a new issue, make sure that the issue was not already reported
or fixed by searching through our
[issues list](https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+sort%3Aupdated-desc).

When creating a new issue, include a short, meaningful title and a clear
description. Add as much relevant information as you can, and, if possible, a
test case.

### Want to work on an existing issue?

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

## Contributor's guide

To learn how to contribute fixes and new content to this project, read the
[Contributor's guide](https://opentelemetry.io/docs/contributing/), which
includes a style guide and useful information on the review process.

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

## Approver and Maintainer practices

This last section includes guidelines and some common practices used by
approvers and maintainers while doing code reviews:

- PRs with changes to documentation co-owned by a SIG (collector, demo,
  language-specific...) should aim for two approvals: one by a docs approver and
  one by a SIG approver:
  - Doc approver label such PRs with `sig:<name>` and tag the SIG `-approvers`
    group on that PR
  - If no SIG approval is given within a certain grace period (two weeks in
    general, but may be less in urgent cases), docs maintainer may use their own
    judgement to merge that PR
- If the PR branch is `out-of-date with the base branch`, they do not need to be
  updated continuously: every update triggers all the PR CI checks to be run!
  It's often enough to update them before merging.
- A PR by non-maintainers should **never** update git sub modules. This happens
  by accident from time to time. Let the PR author know that they should not
  worry about it, we will fix this before merging, but in the future they should
  make sure that they work from an up-to-date fork.
- If the contributor is having trouble signing the CLA or used the wrong email
  by mistake in one of their commits, ask them to fix the issue or rebase the
  pull request. Worst case scenario, close and re-open the PR to trigger a new
  CLA check.
- Words unknown to cspell should be added to the cspell ignore list per page by
  PR authors. Only approvers and maintainers will add commonly used terms to the
  global list.
- When an approver or maintainer won't be available to contribute for an
  extended period of time (more than a few days or a week) or won't be available
  in that period of time, they should communicate this using the
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) channel and
  updating the GitHub status.

[.nvmrc]: .nvmrc
[clone]:
  https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository
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
