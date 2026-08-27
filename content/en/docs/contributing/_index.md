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

## Thank you for your interest!

Thank for your interest in contributing to OpenTelemetry. Contributors help sustain OpenTelemetry, and every contribution helps make the project better for the entire community.

Here is some advice to help you get started:

- **Contributions can come out of necessity:** While we do appreciate regular contributors, it is alright to contribute out of necessity, such as if you find a bug in the Collector, or wish to develop a feature that your team needs.

- **Spotted a gap? That counts too:** OpenTelemetry is a large project, and even with the best efforts of contributors and maintainers, gaps in documentation and functionality are inevitable. If you notice one, filing an issue or submitting a fix is a meaningful contribution.

- **Response times may vary:** Contributors and maintainers often work on OpenTelemetry in their own time, and are frequently juggling multiple things. Don't be discouraged if you don't hear back immediately.

- **You don't need to be an OTel expert:** Your existing skills and professional context are themselves useful. SREs, DevRel folks, and non-native English speakers all bring diverse perspectives that the project actively benefits from.

### <i class='far fa-exclamation-triangle text-warning '></i> First time contributing? {#first-time-contributing}

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

- Join the [#opentelemetry-new-contributors](https://cloud-native.slack.com/archives/C09H3MNMBQV) Slack channel to learn about development etiquette and connect with other new contributors.

- Want to work on other issues or larger changes? [Discuss it with maintainers
  first][].

[discuss it with maintainers first]: issues/#fixing-an-existing-issue

## Jump right in!

What do you want to do?

- Correct a **typo or other quick fixes**, see
  [Submitting content using GitHub](pull-requests/#changes-using-github)
- Add or update a homepage announcement, see
  [Homepage announcements](/site/build/announcements/)
- For more significant contributions, read the pages in this section starting
  with:
  - [Prerequisites][]
  - [Issues][]
  - [Submitting content][]

[Prerequisites]: prerequisites/
[Submitting content]: pull-requests/

## What can I contribute to?

OpenTelemetry is a large project with many ways to get involved. Documentation is one entry point, but far from the only one.

### Documentation

OpenTelemetry documentation contributors can:

- Improve existing or create new content
- [Submit a blog post](blog/) or case study
- Add to or update the [OpenTelemetry Registry](/ecosystem/registry/)
- Improve the code that builds the site

The pages in this section describe how to contribute to OpenTelemetry
**documentation**.

### Code contributions

For guidance on contributing code to the OpenTelemetry project, see the community
[OpenTelemetry New Contributor Guide][]. Every [OTel repository][org] for language
implementations, the Collector, and conventions has its own project-specific contributing guide.

The [OTel Demo](https://github.com/open-telemetry/opentelemetry-demo) is a good starting
point if you want to dip your feet into code contributions. It features 15+ services
across multiple languages, giving you a concrete feel for how instrumentation
works in practice across real distributed systems.

### SIG participation

Joining a Special Interest Group (SIG) is one of the most effective ways to
contribute to OTel. SIGs focus on specific areas of the project, such as
language-specific SDKs, the Collector, end users, contributor experience, and more.

SIG participation helps you:

- Gain insight into current priorities within a smaller, focused section of the OpenTelemetry project
- Connect with maintainers, approvers, and other contributors
- Bring your own topics and help decide the direction of the project

The [OTel community repo](https://github.com/open-telemetry/community#specification-sigs) lists
all active SIGs with calendar invite and Slack channel links.

### Community

Contributing to OTel doesn't mean limiting yourself to writing code or docs. You can also:

- Volunteer for note-taking at SIG meetings
- Help organize community events, like the OpenTelemetry Contributor Day at KubeCon
- Contribute to [localization efforts](localization/)
  to help make OTel accessible to developers in different languages
- Participate in the [End User SIG](https://cloud-native.slack.com/archives/C01RT3MSWGZ)
  by sharing your practitioner experience, or contribute to community podcasts like
  [OTel Me](https://www.youtube.com/playlist?list=PLVYDBkQ1TdywIl9xKEo5_u7zlwY38dW43) and
  [OTel in Practice](https://www.youtube.com/playlist?list=PLVYDBkQ1TdyxKgdGE4ThYLkNRCuLLYy9x)


[choose an issue]: issues/#fixing-an-existing-issue
[issues]: issues/
[OpenTelemetry New Contributor Guide]:
  https://github.com/open-telemetry/community/blob/main/guides/contributor
