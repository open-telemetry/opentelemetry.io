# <img src="https://opentelemetry.io/img/logos/opentelemetry-logo-nav.png" alt="OpenTelemetry Icon" width="45" height=""> OpenTelemetry.io

This is the source repo for the [OpenTelemetry][] website and project
documentation. The site is [built][CONTRIBUTING.md] using [Hugo][] and hosted on
[Netlify][].

## Adding a project to the OpenTelemetry Registry

Do you maintain or contribute to an integration for OpenTelemetry? We'd love to
feature your project in the [registry][]!

To add your project, submit a [pull request][PR]. You'll need to create a data
file in `/content/en/registry` for your project. You can find a template in
`./templates/registry-entry.md`

## Adding a blog post

Follow the [setup instructions][CONTRIBUTING.md]. To create a skeletal blog
post, run the following command from the repo root:

```console
$ hugo new content/en/blog/2022/file-name-for-your-blog-post.md
```

Start editing the file at the path your provided in the previous command. The
file is initialized from the blog-post starter under [archetypes](archetypes).
Once your post is ready, submit it through a [pull request][PR].

## Contributing

See [CONTRIBUTING.md][].

Roles:
- Approvers: [@open-telemetry/docs-approvers][]
- Maintainers: [@open-telemetry/docs-maintainers][]

Learn more about roles in the [community repository][]. Thanks to [all who have
already contributed][contributors]!

## Documentation license

This work is licensed under a <a rel="license"
href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution
4.0 International License</a>.

The Creative Commons Attribution 4.0 license applies to the creative work of
this site (documentation, visual assets, etc.) and not to the underlying code
and does not supersede any licenses of the source code, its dependencies, etc.

<a rel="license" href="http://creativecommons.org/licenses/by/4.0/">
  <img alt="Creative Commons License" src="https://i.creativecommons.org/l/by/4.0/88x31.png" />
</a>

[@open-telemetry/docs-approvers]: https://github.com/orgs/open-telemetry/teams/docs-approvers
[@open-telemetry/docs-maintainers]: https://github.com/orgs/open-telemetry/teams/docs-maintainers
[community repository]: https://github.com/open-telemetry/community/blob/main/community-membership.md
[CONTRIBUTING.md]: CONTRIBUTING.md
[contributors]: https://github.com/open-telemetry/opentelemetry.io/graphs/contributors
[Hugo]: https://gohugo.io
[Netlify]: https://netlify.com
[OpenTelemetry]: https://opentelemetry.io
[PR]: https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request
[registry]: https://opentelemetry.io/registry/
