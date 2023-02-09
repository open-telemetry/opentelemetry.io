# <img src="https://opentelemetry.io/img/logos/opentelemetry-logo-nav.png" alt="OpenTelemetry Icon" width="45" height=""> OpenTelemetry.io

This is the source repo for the [OpenTelemetry][] website, project documentation
and blog. The site is [built][contributing.md] using [Hugo][] and hosted on
[Netlify][].

## Get involved

If you are new to OpenTelemetry and just get started with it, you are in a
perfect position to help us get better: the website and documentation is the
entry point for newcomers like you, so if something is unclear or something is
missing [let us know][]!

Read on to learn about other ways on how you can help.

## Adding a project to the OpenTelemetry Registry

For details, see [Adding to the registry][].

## Submitting a blog post

You can submit a blog post either by forking this repository and writing it
locally or by using the GitHub UI. In both cases we ask you to follow the
instructions provided by the [blog post template](archetypes/blog.md).

**Note**: Before writing a blog post, please ask yourself, if your content also
might be a good addition to the documentation. If the answer is yes, create a
new issue/PR with your content to get it added to the docs.

### Fork & Write locally

Follow the [setup instructions][contributing.md] then, to create a skeletal blog
post, run the following command from the repo root:

```sh
npx hugo new content/en/blog/2023/short-name-for-post.md
```

If your post will have images or other assets, instead run:

```sh
npx hugo new content/en/blog/2023/short-name-for-post/index.md
```

Edit the markdown file at the path you provided in the previous command. The
file is initialized from the blog-post starter under [archetypes](archetypes).

Put assets, if any, like images into the folder created.

Once your post is ready, submit it through a [pull request][].

### Using the Github UI

- Go to the [blog post template](archetypes/blog.md) and click on
  `Copy raw content` at the top right of the menu
- [Create a new file](https://github.com/open-telemetry/opentelemetry.io/new/main)
- Paste the content from the template
- Name your file, e.g.
  `content/en/blog/2022/short-name-for-your-blog-post/index.md`
- Start editing the markdown file
- Once your post is ready click on `Propose changes` at the bottom.

## Contributing

See [CONTRIBUTING.md][].

We have curated some issues with the tags [help wanted][] and [good first
issue][]. This should allow you to quickly find a place to contribute

We (OTel Comms SIG) meet every two weeks on Thursdays at 10:30 PT. Check out the
[OpenTelemetry community calendar][] for the Zoom link and any updates to this
schedule.

Meeting notes are available as a public [Google doc][]. If you have trouble
accessing the doc, please get in touch on [Slack][].

Roles:

- Approvers: [@open-telemetry/docs-approvers][]
- Maintainers: [@open-telemetry/docs-maintainers][]
- Blog approvers: [@open-telemetry/blog-approvers][]

Learn more about roles in the [community repository][]. Thanks to [all who have
already contributed][contributors]!

## Licenses

- Documentation: [CC-BY-4.0](LICENSE)
- Code: [Apache-2.0](LICENSE-CODE)

[adding to the registry]: https://opentelemetry.io/ecosystem/registry/adding/
[let us know]:
  https://github.com/open-telemetry/opentelemetry.io/issues/new/choose
[@open-telemetry/blog-approvers]:
  https://github.com/orgs/open-telemetry/teams/blog-approvers
[@open-telemetry/docs-approvers]:
  https://github.com/orgs/open-telemetry/teams/docs-approvers
[@open-telemetry/docs-maintainers]:
  https://github.com/orgs/open-telemetry/teams/docs-maintainers
[community repository]:
  https://github.com/open-telemetry/community/blob/main/community-membership.md
[contributing.md]: CONTRIBUTING.md
[contributors]:
  https://github.com/open-telemetry/opentelemetry.io/graphs/contributors
[hugo]: https://gohugo.io
[netlify]: https://netlify.com
[opentelemetry]: https://opentelemetry.io
[pull request]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry]: https://opentelemetry.io/ecosystem/registry/
[opentelemetry community calendar]:
  https://calendar.google.com/calendar/embed?src=google.com_b79e3e90j7bbsa2n2p5an5lf60%40group.calendar.google.com
[help wanted]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22
[good first issue]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22
[google doc]:
  https://docs.google.com/document/d/1wW0jLldwXN8Nptq2xmgETGbGn9eWP8fitvD5njM-xZY/edit?usp=sharing
[slack]: https://cloud-native.slack.com/archives/C02UN96HZH6
