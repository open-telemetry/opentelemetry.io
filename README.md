# <img src="https://opentelemetry.io/img/logos/opentelemetry-logo-nav.png" alt="OpenTelemetry Icon" width="45" height=""> OpenTelemetry.io

This is the source repo for the [OpenTelemetry][] website and project
documentation. The site is [built][contributing.md] using [Hugo][] and hosted on
[Netlify][].

## Adding a project to the OpenTelemetry Registry

Do you maintain or contribute to an integration for OpenTelemetry? We'd love to
feature your project in the [registry][]!

To add your project, submit a [pull request][pr]. You'll need to create a data
file in `/content/en/registry` for your project. You can find a template in
`./templates/registry-entry.md`

## Submitting a blog post

Follow the [setup instructions][contributing.md] then, to create a skeletal blog
post, run the following command from the repo root:

```console
$ npx hugo new content/en/blog/2022/file-name-for-your-blog-post.md
```

Start editing the markdown file at the path you provided in the previous
command. The file is initialized from the blog-post starter under
[archetypes](archetypes). Once your post is ready, submit it through a [pull
request][pr].

## Contributing

See [CONTRIBUTING.md][].

We (OTel Comms SIG) meet every two weeks on Thursdays at 10:30 PT.
Check out the [OpenTelemetry community calendar](https://calendar.google.com/calendar/embed?src=google.com_b79e3e90j7bbsa2n2p5an5lf60%40group.calendar.google.com)
for the Zoom link and any updates to this schedule.

Meeting notes are available as a public [Google
doc](https://docs.google.com/document/d/1wW0jLldwXN8Nptq2xmgETGbGn9eWP8fitvD5njM-xZY/edit?usp=sharing).
If you have trouble accessing the doc, please get in touch on
[Slack](https://cloud-native.slack.com/archives/C02UN96HZH6).

Roles:

- Approvers: [@open-telemetry/docs-approvers][]
- Maintainers: [@open-telemetry/docs-maintainers][]
- Blog approvers: [@open-telemetry/blog-approvers][]

Learn more about roles in the [community repository][]. Thanks to [all who have
already contributed][contributors]!

## Licenses

- Documentation: [CC-BY-4.0](LICENSE)
- Code: [Apache-2.0](LICENSE-CODE)

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
[pr]:
  https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry]: https://opentelemetry.io/registry/
