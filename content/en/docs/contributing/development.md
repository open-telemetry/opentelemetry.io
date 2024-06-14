---
title: Development
description:
  Learn how to set up a development environment for the opentelemetry.io site.
weight: 60
---

The following instructions explain how to set up a development environment for
the <https://opentelemetry.io/> website.

## Cloud-IDE setup

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

Gitpod automatically installs the repo-specific packages for you.

You're now ready to [build](#build), [serve](#serve) or make updates to the
website files.

## Local setup

1.  [Fork][] and then [clone][] this repository.
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

## Approver and maintainer practices

This last section includes guidelines and some common practices used by
approvers and maintainers while doing code reviews:

- PRs with changes to documentation co-owned by a SIG (collector, demo,
  language-specific...) should aim for two approvals: one by a docs approver and
  one by a SIG approver:
  - Doc approver label such PRs with `sig:<name>` and tag the SIG `-approvers`
    group on that PR
  - After a doc approver has reviewed and approved the PR, they can add the
    label
    [`sig-approval-missing`](https://github.com/open-telemetry/opentelemetry.io/labels/sig-approval-missing).
    This signals to the SIG that they need to handle the PR
  - If no SIG approval is given within a certain grace period (two weeks in
    general, but may be less in urgent cases), docs maintainer may use their own
    judgement to merge that PR
- PRs created by bots can be merged by the following practice:
  - PRs that auto-update versions in the registry can be fixed, approved and
    merged immediately
  - PRs that auto-update the versions of SDKs, zero-code instrumentations or the
    collector can be approved and merged except the corresponding SIG signals
    that merging should be postponed
  - PRs that auto-update the version of any specification often require updates
    to scripts for the CI checks to pass. In that case often
    [@chalin](https://github.com/chalin/) will handle that PR. Otherwise those
    PRs can as well be approved and merged except the corresponding SIG signals
    that merging should be postponed.
- PRs with changes to translations should aim for two approvals: one by a docs
  approver and one by a translation approver. Similar practices apply as
  suggested for the co-owned PRs.
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
- Approvers and maintainers have different work schedules and circumstances.
  That's why all communication is assumed to be asynchronously and they should
  not feel obligated to reply outside of their normal schedule.
- When an approver or maintainer won't be available to contribute for an
  extended period of time (more than a few days or a week) or won't be available
  in that period of time, they should communicate this using the
  [#otel-comms](https://cloud-native.slack.com/archives/C02UN96HZH6) channel and
  updating the GitHub status.
- Approver and maintainer adhere to the
  [OTel Code of Conduct](https://github.com/open-telemetry/community/?tab=coc-ov-file#opentelemetry-community-code-of-conduct)
  and are friendly and helpful towards contributors. In the case of a conflict,
  misunderstanding or any other kind of situation that makes an
  approver/maintainer feel uncomfortable they can step back from a conversation,
  issue or PR and ask another approver/maintainer to step in.

The following workflow can be applied by maintainers to merge PRs:

- Make sure that a PR has all approvals and all CI checks pass
- If the branch is out-of-date, rebase update it via the GitHub UI.
- The update will trigger all CI checks to run again, wait for them to pass or
  execute a script like the following to make it happen in the background:

  ```shell
  export PR=<ID OF THE PR>; gh pr checks ${PR} --watch && gh pr merge ${PR} --squash
  ```

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
