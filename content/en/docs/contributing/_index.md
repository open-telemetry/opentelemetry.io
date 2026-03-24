---
title: Contributing
aliases: [/docs/contribution-guidelines]
sidebar_root_for: self
weight: 980
cascade:
  chooseAnIssueAtYourLevel: |
    Make sure to [choose an issue][] that matches your level of **experience**
    and **understanding** of OpenTelemetry. Avoid overreaching your capabilities.
  _issues: https://github.com/open-telemetry/opentelemetry.io/issues
  _issue: https://github.com/open-telemetry/opentelemetry.io/issues?q=state%3Aopen%20label%3A
---

> [!TIP] Thank you for your interest!
>
> Thank you for your interest in contributing to the OpenTelemetry docs and
> website.

## <i class='far fa-exclamation-triangle text-warning '></i> First time contributing? {#first-time-contributing}

- **[Choose an issue][]** with the following labels:
  - [Good first issue](<{{% param _issue %}}%22good%20first%20issue%22>)
  - [Help wanted](<{{% param _issue %}}%22help%20wanted%22>)

  > [!WARNING] We do not assign issues
  >
  > We **_do not_ assign issues** to those who have not already made
  > contributions to the [OpenTelemetry organization][org], unless part of a
  > confirmed mentorship or onboarding process.
  >
  > [org]: https://github.com/open-telemetry

- {{% param chooseAnIssueAtYourLevel %}}

- Read our [Generative AI contribution policy](pull-requests#using-ai)

- Want to work other issues or larger changes? [Discuss it with maintainers
  first][].

[discuss it with maintainers first]: issues/#fixing-an-existing-issue

## Jump right in!

What do you want to do?

- Correct a **typo or other quick fixes**, see
  [Submitting content using GitHub](pull-requests/#changes-using-github)
- For more significant contributions, read the pages in this section starting
  with:
  - [Prerequisites][]
  - [Issues][]
  - [Submitting content][]

[Prerequisites]: prerequisites/
[Submitting content]: pull-requests/

## What can I contribute to?

If you want to contribute to the core OpenTelemetry projects, here is a list of the main repositories:

- **[Specification](https://github.com/open-telemetry/opentelemetry-specification)** - Cross-language requirements and expectations for all implementations. ([Contributing Guide](https://github.com/open-telemetry/opentelemetry-specification/blob/main/CONTRIBUTING.md))
- **[Semantic Conventions](https://github.com/open-telemetry/semantic-conventions)** - Defines standard attribute names for telemetry data. ([Contributing Guide](https://github.com/open-telemetry/semantic-conventions/blob/main/CONTRIBUTING.md))
- **[Collector](https://github.com/open-telemetry/opentelemetry-collector)** - A vendor-agnostic proxy that can receive, process, and export telemetry data. ([Contributing Guide](https://github.com/open-telemetry/opentelemetry-collector/blob/main/CONTRIBUTING.md))
- **Language SDKs**: Every [language implementation repository][org] contains its own project-specific contributing guide.

For general guidance on contributing to the overall project, see the community [OpenTelemetry New Contributor Guide][].

If you would like to contribute to OpenTelemetry **documentation**, you can:

- Improve existing or create new content
- [Submit a blog post](blog/) or case study
- Add to or update the [OpenTelemetry Registry](/ecosystem/registry/)
- Improve the code that builds the site

[choose an issue]: issues/#fixing-an-existing-issue
[issues]: issues/
[OpenTelemetry New Contributor Guide]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor
