---
title: Contributing
description: Learn how to contribute to OpenTelemetry documentation.
aliases: [/docs/contribution-guidelines]
weight: 200
cSpell:ignore: prepopulated spacewhite
---

You can open an issue about OpenTelemetry documentation, or contribute a change
with a pull request (PR) to the
[`opentelemetry.io` GitHub repository](https://github.com/open-telemetry/opentelemetry.io).

OpenTelemetry documentation contributors:

- Improve existing content.
- Create new content.
- Update the OpenTelemetry Registry.
- Improve the code that builds the site.

See also the general
[OpenTelemetry Contributor Guide](https://github.com/open-telemetry/community/blob/main/CONTRIBUTING.md)
, which provides details on the Contributor License Agreement and the Code of
Conduct.

## Requirements

To contribute, you need to be familiar with the following techs and tools:

- [git](https://git-scm.com/)
- [GitHub](https://github.com/)
- Markdown ([CommonMark](https://commonmark.org/))
- YAML

For technical details concerning how the documentation is built and tested
locally, see the
[CONTRIBUTING.md](https://github.com/open-telemetry/opentelemetry.io/blob/main/CONTRIBUTING.md)
file.

### Sign the CNCF CLA {#sign-the-cla}

All OpenTelemetry contributors must read the
[Contributor guide](https://github.com/open-telemetry/community/blob/main/CONTRIBUTING.md)
and
[sign the Contributor License Agreement (CLA)](https://docs.linuxfoundation.org/lfx/easycla/contributors)
.

Pull requests from contributors who haven't signed the CLA fail the automated
tests. The name and email you provide must match those found in your
`git config`, and your git name and email must match those used for the CNCF
CLA.

## Contribute new content

```mermaid
flowchart LR
    subgraph first[How to contribute]
    direction TB
       T[ ] -.-
       B[Fork the repo in GitHub] --- C[Write docs in markdown<br>and build site with Hugo]
       C --- D[Push source to the fork]
       D --- E[Open a pull request]
       E --- F[Sign the CNCF CLA]
    end

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
classDef spacewhite fill:#ffffff,stroke:#fff,stroke-width:0px,color:#000
class A,B,C,D,E,F,G,H grey
class S,T spacewhite
class first,second white
```

**_Figure - Contributing new content_**

The previous figure presents the basic steps for new docs contributions.

To contribute new content pages or improve existing content pages, open a pull
request (PR):

- If your change is small, or you're unfamiliar with Git, read
  [Changes using GitHub](#changes-using-github) to learn how to edit a page.
- If your changes are large, read [Work from a local fork](#fork-the-repo) to
  learn how to make changes locally on your computer.

### Changes using GitHub {#changes-using-github}

If you're less experienced with Git workflows, here's an easier method of
opening a pull request. Figure 1 outlines the steps and the details follow.

```mermaid
flowchart LR
A([fa:fa-user New<br>Contributor]) --- id1[(open-telemetry/opentelemetry.io<br>GitHub)]
subgraph tasks[Changes using GitHub]
direction TB
    0[ ] -.-
    1[1. Edit this page] --> 2[2. Use GitHub markdown<br>editor to make changes]
    2 --> 3[3. fill in Propose file change]

end
subgraph tasks2[ ]
direction TB
4[4. select Propose file change] --> 5[5. select Create pull request] --> 6[6. fill in Open a pull request]
6 --> 7[7. select Create pull request]
end

id1 --> tasks --> tasks2

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
classDef k8s fill:#326ce5,stroke:#fff,stroke-width:1px,color:#fff;
classDef spacewhite fill:#ffffff,stroke:#fff,stroke-width:0px,color:#000
class A,1,2,3,4,5,6,7 grey
class 0 spacewhite
class tasks,tasks2 white
class id1 k8s
```

Figure 1. Steps for opening a PR using GitHub.

1. On the page where you see the issue, select the **Edit this page** option in
   the right-hand side navigation panel.

1. If you're not a member of the project, GitHub will offer to create a fork of
   the repository. Select **Fork this repository**.

1. Make your changes in the GitHub editor.

1. Below the editor, fill in the **Propose file change** form.

1. Select **Propose file change**.

1. Select **Create pull request**.

1. The **Open a pull request** screen appears. Your description helps reviewers
   understand your change.

1. Select **Create pull request**.

Before merging a pull request, OpenTelemetry community members review and
approve it.

If a reviewer asks you to make changes:

1. Go to the **Files changed** tab.
1. Select the pencil (edit) icon on any files changed by the pull request.
1. Make the changes requested. If there's a code suggestion, apply it.
1. Commit the changes.

When your review is complete, a reviewer merges your PR and your changes goes
live a few minutes later.

{{% alert title="Tip" %}}

Comment `/fix:format` on your pull request to trigger an automated check for
formatting issues.

{{% /alert %}}

### Work from a local fork {#fork-the-repo}

If you're more experienced with Git, or if your changes are larger than a few
lines, work from a local fork.

Make sure you have
[git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) installed
on your computer. You can also use a user interface for Git.

Figure 2 shows the steps to follow when you work from a local fork. The details
for each step follow.

```mermaid
flowchart LR
1[Fork the open-telemetry/opentelemetry<br>repository] --> 2[Create local clone<br>and set upstream]
subgraph changes[Your changes]
direction TB
S[ ] -.-
3[Create a branch<br>example: my_new_branch] --> 3a[Make changes using<br>a text editor] --> 4["Preview your changes<br>locally using Hugo<br>(localhost:1313)"]
end
subgraph changes2[Commit / Push]
direction TB
T[ ] -.-
5[Commit your changes] --> 6[Push commit to<br>origin/my_new_branch]
end

2 --> changes --> changes2

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
classDef k8s fill:#326ce5,stroke:#fff,stroke-width:1px,color:#fff;
classDef spacewhite fill:#ffffff,stroke:#fff,stroke-width:0px,color:#000
class 1,2,3,3a,4,5,6 grey
class S,T spacewhite
class changes,changes2 white
```

Figure 2. Working from a local fork to make your changes.

#### Fork the opentelemetry.io repository

1. Navigate to the
   [`opentelemetry.io`](https://github.com/open-telemetry/opentelemetry.io/)
   repository.
1. Select **Fork**.

#### Create a local clone and set the upstream

1. In a terminal window, clone your fork and install the requirements:

   ```shell
   git clone git@github.com:<your_github_username>/opentelemetry.io.git
   cd opentelemetry.io
   npm install
   ```

1. Set the `open-telemetry/opentelemetry.io` repository as the `upstream`
   remote:

   ```shell
   git remote add upstream https://github.com/open-telemetry/opentelemetry.io.git
   ```

1. Confirm your `origin` and `upstream` repositories:

   ```shell
   git remote -v
   ```

   Output is similar to:

   ```none
   origin	git@github.com:<your_github_username>/opentelemetry.io.git (fetch)
   origin	git@github.com:<your_github_username>/opentelemetry.io.git (push)
   upstream	https://github.com/open-telemetry/opentelemetry.io.git (fetch)
   upstream	https://github.com/open-telemetry/opentelemetry.io.git (push)
   ```

1. Fetch commits from your fork's `origin/main` and
   `open-telemetry/opentelemetry.io`'s `upstream/main`:

   ```shell
   git fetch origin
   git fetch upstream
   ```

   This makes sure your local repository is up to date before you start making
   changes. Push changes from upstream to origin regularly to keep you fork in
   sync with upstream.

#### Create a branch

1. Create a new branch. This example assumes the base branch is `upstream/main`:

   ```shell
   git checkout -b <my_new_branch> upstream/main
   ```

1. Make your changes using a code or text editor.

At any time, use the `git status` command to see what files you've changed.

#### Commit your changes

When you are ready to submit a pull request, commit your changes.

1. In your local repository, check which files you need to commit:

   ```shell
   git status
   ```

   Output is similar to:

   ```none
   On branch <my_new_branch>
   Your branch is up to date with 'origin/<my_new_branch>'.

   Changes not staged for commit:
   (use "git add <file>..." to update what will be committed)
   (use "git checkout -- <file>..." to discard changes in working directory)

   modified:   content/en/docs/file-you-are-editing.md

   no changes added to commit (use "git add" and/or "git commit -a")
   ```

1. Add the files listed under **Changes not staged for commit** to the commit:

   ```shell
   git add <your_file_name>
   ```

   Repeat this for each file.

1. After adding all the files, create a commit:

   ```shell
   git commit -m "Your commit message"
   ```

1. Push your local branch and its new commit to your remote fork:

   ```shell
   git push origin <my_new_branch>
   ```

1. Once the changes are pushed, GitHub lets you know that you can create a PR.

#### Open a pull request from your fork {#open-a-pr}

Figure 3 shows the steps to open a PR from your fork to the
[opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io) .

```mermaid
flowchart LR
subgraph first[ ]
direction TB
1[1. Go to opentelemetry.io repository] --> 2[2. Select New Pull Request]
2 --> 3[3. Select compare across forks]
3 --> 4[4. Select your fork from<br>head repository drop-down menu]
end
subgraph second [ ]
direction TB
5[5. Select your branch from<br>the compare drop-down menu] --> 6[6. Select Create Pull Request]
6 --> 7[7. Add a description<br>to your PR]
7 --> 8[8. Select Create pull request]
end

first --> second

classDef grey fill:#dddddd,stroke:#ffffff,stroke-width:px,color:#000000, font-size:15px;
classDef white fill:#ffffff,stroke:#000,stroke-width:px,color:#000,font-weight:bold
class 1,2,3,4,5,6,7,8 grey
class first,second white
```

Figure 3. Steps to open a PR from your fork to the
[opentelemetry.io](https://github.com/open-telemetry/opentelemetry.io).

1. In a web browser, go to the
   [`opentelemetry.io`](https://github.com/open-telemetry/opentelemetry.io)
   repository.
1. Select **New Pull Request**.
1. Select **compare across forks**.
1. From the **head repository** drop-down menu, select your fork.
1. From the **compare** drop-down menu, select your branch.
1. Select **Create Pull Request**.
1. Add a description for your pull request:

   - **Title** (50 characters or less): Summarize the intent of the change.
   - **Description**: Describe the change in more detail.

     - If there is a related GitHub issue, include `Fixes #12345` or
       `Closes #12345` in the description. GitHub's automation closes the
       mentioned issue after merging the PR if used. If there are other related
       PRs, link those as well.
     - If you want advice on something specific, include any questions you'd
       like reviewers to think about in your description.

1. Select the **Create pull request** button.

Your pull request is available in
[Pull requests](https://github.com/open-telemetry/opentelemetry.io/pulls).

After opening a PR, GitHub runs automated tests and tries to deploy a preview
using [Netlify](https://www.netlify.com/).

- If the Netlify build fails, select **Details** for more information.
- If the Netlify build succeeds, select **Details** opens a staged version of
  the OpenTelemetry website with your changes applied. This is how reviewers
  check your changes.

Other checks might also fail, including:

- File name checks
- Links resolution
- Markdown formatting
- Spelling

GitHub also automatically assigns labels to a PR to help reviewers.

#### Fix content issues automatically

Before submitting a change to the repository, run the following command and
address any reported issues. Also commit any files changed by the `fix` script:

```sh
npm run test-and-fix
```

To separately test and fix issues with your files, run:

```sh
npm run test # checks but does not update any files
npm run fix  # may update files
```

To list available NPM scripts, run `npm run`.

#### Preview your changes locally {#preview-locally}

Preview your changes locally before pushing them or opening a pull request. A
preview lets you catch build errors or markdown formatting problems.

To build and serve the site locally with Hugo, run the following command:

```shell
npm run serve
```

Navigate to `https://localhost:1313` in your web browser to see the local
preview. Hugo watches the changes and rebuilds the site as needed.

To stop the local Hugo instance, go back to the terminal and type `Ctrl+C`, or
close the terminal window.

#### Site deploys and PR previews

If you submit a PR, Netlify will create a [deploy preview][] so that you can
review your changes. Once your PR is merged, Netlify deploys the updated site to
the production server.

> **Note**: PR previews include _draft pages_, but production builds do not.

To see deploy logs and more, visit project's [dashboard][] -- Netlify login
required.

#### PR guidelines

Before a PR gets merged, it will sometimes require a few iterations of
review-and-edit. To help us and yourself make this process as easy as possible,
we ask that adhere to the following:

- If your PR isn't a quick fix, then **work from a fork**: Click the
  [Fork](https://github.com/open-telemetry/opentelemetry.io/fork) button at the
  top of the repository and clone the fork locally. When you are ready, raise a
  PR with the upstream repository.
- **Do not work from the `main`** branch of your fork, but create a PR-specific
  branch.
- Ensure that maintainers are
  [allowed to apply changes to your pull request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/allowing-changes-to-a-pull-request-branch-created-from-a-fork).

#### Changes from reviewers

Sometimes reviewers commit to your pull request. Before making any other
changes, fetch those commits.

1. Fetch commits from your remote fork and rebase your working branch:

   ```shell
   git fetch origin
   git rebase origin/<your-branch-name>
   ```

1. After rebasing, force-push new changes to your fork:

   ```shell
   git push --force-with-lease origin <your-branch-name>
   ```

You can also solve merge conflicts from the GitHub UI.

#### Merge conflicts and rebasing

If another contributor commits changes to the same file in another PR, it can
create a merge conflict. You must resolve all merge conflicts in your PR.

1. Update your fork and rebase your local branch:

   ```shell
   git fetch origin
   git rebase origin/<your-branch-name>
   ```

   Then force-push the changes to your fork:

   ```shell
   git push --force-with-lease origin <your-branch-name>
   ```

1. Fetch changes from `open-telemetry/opentelemetry.io`'s `upstream/main` and
   rebase your branch:

   ```shell
   git fetch upstream
   git rebase upstream/main
   ```

1. Inspect the results of the rebase:

   ```shell
   git status
   ```

   This results in a number of files marked as conflicted.

1. Open each conflicted file and look for the conflict markers: `>>>`, `<<<`,
   and `===`. Resolve the conflict and delete the conflict marker.

   For more information, see
   [How conflicts are presented](https://git-scm.com/docs/git-merge#_how_conflicts_are_presented).

1. Add the files to the changeset:

   ```shell
   git add <filename>
   ```

1. Continue the rebase:

   ```shell
   git rebase --continue
   ```

1. Repeat steps 2 to 5 as needed.

   After applying all commits, the `git status` command shows that the rebase is
   complete.

1. Force-push the branch to your fork:

   ```shell
   git push --force-with-lease origin <your-branch-name>
   ```

   The pull request no longer shows any conflicts.

#### Merge requirements

Pull requests are merged when they comply with the following criteria:

- All reviews by approvers, maintainers, technical committee members, or subject
  matter experts have the status "Approved"
- No unresolved conversations
- Approved by at least one approver
- No failing PR checks
- PR branch is up-to-date with the base branch

> **Important**
>
> Do not worry too much about failing PR checks. Community members will help you
> to get them fixed, by either providing you with instructions how to fix them
> or by fixing them on your behave.

## Open an issue

If you want to suggest improvements to existing content or notice an error, open
an issue.

1. Click the **Create documentation issue** link on any document. This redirects
   you to a GitHub issue page prepopulated with some headers.
2. Describe the issue or suggestion for improvement. Provide as many details as
   you can.
3. Click **Submit new issue**.

After submitting, check in on your issue occasionally or turn on GitHub
notifications. It might take a few days until maintainers and approvers respond.
Reviewers and other community members might ask questions before they can take
action on your issue.

### Suggesting new content or features

If you have an idea for new content or a feature, but you aren't sure where it
should go, you can still file an issue. You can also report bugs and security
vulnerabilities.

1. Go to
   [GitHub](https://github.com/open-telemetry/opentelemetry.io/issues/new/) and
   select **New issue** inside the **Issues** tab.

1. Select the type of issue that best applies to your request or doubt.

1. Fill out the template.

1. Submit the issue.

### How to file great issues

Keep the following in mind when filing an issue:

- Provide a clear issue description. Describe what specifically is missing, out
  of date, wrong, or needs improvement.
- Explain the specific impact the issue has on users.
- Limit the scope of a given issue to a reasonable unit of work. For problems
  with a large scope, break them down into smaller issues. For example, "Fix the
  security docs" is too broad, but "Add details to the 'Restricting network
  access' topic" is specific enough to be actionable.
- Search the existing issues to see if there's anything related or similar to
  the new issue.
- If the new issue relates to another issue or pull request, refer to it either
  by its full URL or by the issue or pull request number prefixed with a `#`
  character. For example, `Introduced by #987654`.
- Follow the
  [Code of Conduct](https://github.com/open-telemetry/community/blob/main/code-of-conduct.md).
  Respect your fellow contributors. For example, "The docs are terrible" is not
  helpful or polite feedback.

## Contribute to other repositories

OpenTelemetry is an open source project, and we gladly accept new contributions
and contributors. See the CONTRIBUTING.md file in each SIG repository for
information on getting started.

Individual SIGs may maintain documentation above and beyond what is offered
here, but we strive for accurate general guidance on using the project from our
main website. 

If you see text you'd like to improve, use GitHub to search all
repositories in the OpenTelemetry organization. This can help you figure out
where to submit your issue or PR. Each repository has its own processes and
procedures. Before you file an issue or submit a PR, read that repository's
`README.md`, `CONTRIBUTING.md`, and `code-of-conduct.md`, if they exist.

Most repositories use issue and PR templates. Have a look through some open
issues and PRs to get a feel for that team's processes. Make sure to fill out
the templates with as much detail as possible when you file issues or PRs.

## Other ways to contribute

- Visit the [OpenTelemetry community site](/community/).
- Add your application to the [Registry](/ecosystem).
- Submit a [blog post or case study](/docs/contributing/blog/).

[dashboard]: https://app.netlify.com/sites/opentelemetry/overview
[deploy preview]:
  https://www.netlify.com/blog/2016/07/20/introducing-deploy-previews-in-netlify/

## Code of conduct

OpenTelemetry follows the
[CNCF Community Code of Conduct](https://github.com/cncf/foundation/blob/main/code-of-conduct.md).
