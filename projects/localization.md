# Website Localization

<!-- markdownlint-disable no-otel-io-external-urls -->

## Ownership

- Lead: Vitor Vasconcellos (@vitorvasc)

## Description

The website localization project makes the OpenTelemetry documentation and
resources accessible to a global audience by providing translations in multiple
languages. [Launched in August 2024][multilingual docs announcement], this
initiative enables contributors, organizations, and end-users worldwide to
engage with OpenTelemetry in their native language, regardless of their English
proficiency.

The project currently supports the following languages in addition to English:

- [বাংলা - Bengali (bn)][bn]
- [Español - Spanish (es)][es]
- [Français - French (fr)][fr]
- [日本語 - Japanese (ja)][ja]
- [Português - Portuguese (pt)][pt]
- [Română - Romanian (ro)][ro]
- [Українська - Ukrainian (uk)][uk]
- [中文 - Chinese (zh)][zh]

This multilingual approach helps ensure that OpenTelemetry's observability
tools, concepts, and best practices are accessible to the global community,
fostering broader adoption and contribution to the project.

[multilingual docs announcement]:
  https://opentelemetry.io/blog/2024/docs-localized/
[bn]: https://opentelemetry.io/bn/
[es]: https://opentelemetry.io/es/
[fr]: https://opentelemetry.io/fr/
[ja]: https://opentelemetry.io/ja/
[pt]: https://opentelemetry.io/pt/
[ro]: https://opentelemetry.io/ro/
[uk]: https://opentelemetry.io/uk/
[zh]: https://opentelemetry.io/zh/

### Current challenges

Managing localized content at scale presents several challenges:

- **Translation drift**: As English content evolves, keeping all translations
  current and synchronized requires continuous effort and monitoring
- **Terminology consistency**: Ensuring consistent translation of technical
  terms across all pages within each language, especially when terms don't have
  direct equivalents
- **Review capacity**: Scaling the number of qualified reviewers and approvers
  for each language as localization efforts expand
- **Cross-team coordination**: Coordinating between different language teams
  while maintaining consistent quality standards and processes

### Goals, objectives, and requirements

The localization project aims to:

- **Quality**: Maintain high-quality translations that preserve technical
  accuracy, meaning, and style of the original English content
- **Community**: Build active, engaged communities around each localization with
  dedicated approvers and contributors
- **Accessibility**: Ensure all critical documentation is available in multiple
  languages, prioritizing core concepts and getting-started content

Requirements for each localization:

- At least one localization mentor familiar with both the language and CNCF
  documentation practices
- Minimum of two active contributors
- Adherence to the [translation guidance][localization contributing guide] and
  style conventions
- Proper tracking of translation drift using the `default_lang_commit` front
  matter field

## Deliverables

### Infrastructure and Tooling

- **Hugo multilingual framework**: Configured language routing and fallback
  mechanisms
- **Drift tracking automation**: Scripts and CI workflows to identify pages that
  need updating when English content changes
- **Spell checking**: Language-specific dictionaries and custom word lists for
  technical terms
- **Translation workflow**: Documented processes for submitting, reviewing, and
  maintaining translations

### Documentation and Guidelines

- **Translation guidance**: Comprehensive documentation at
  [/docs/contributing/localization/][localization contributing guide]
- **Template and standards**: Clear guidelines on what to translate, what to
  preserve, and how to maintain consistency
- **npm scripts**: Commands to check drift status, update commit hashes, and
  manage localized content

### Governance Structure

- **Language-specific teams**: Dedicated approver teams for each language (e.g.,
  `@open-telemetry/docs-[LANGUAGE_CODE]-approvers`)
- **Component ownership**: Clear ownership structure defined in
  `.github/component-owners.yml`
- **Review process**: Established workflows for translation reviews and
  approvals

### Quality Assurance

- **Automated CI checks**: Validation of required front matter fields and commit
  hash tracking
- **Link validation**: Ensuring all cross-references and external links work
  correctly across localizations
- **Drift indicators**: Visual markers on pages that have drifted from the
  English version

## Staffing / Help Wanted

Each language has a dedicated approver team responsible for reviewing and
maintaining translations. Teams are defined in
[`.github/component-owners.yml`](https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml).

All language teams also work with `@open-telemetry/docs-approvers` and
`@open-telemetry/docs-maintainers` for overall guidance and support.

### Current language teams

**Bengali**:

- Website: <https://opentelemetry.io/bn/>
- Slack channel: [`#otel-localization-bn`][otel-localization-bn]
- Maintainers: `@open-telemetry/docs-bn-maintainers`
- Approvers: `@open-telemetry/docs-bn-approvers`

**Chinese**:

- Website: <https://opentelemetry.io/zh/>
- Slack channel: [`#otel-localization-zhcn`][otel-localization-zhcn]
- Maintainers: `@open-telemetry/docs-zh-maintainers`
- Approvers: `@open-telemetry/docs-zh-approvers`

**French**:

- Website: <https://opentelemetry.io/fr/>
- Slack channel: [`#otel-localization-fr`][otel-localization-fr]
- Maintainers: `@open-telemetry/docs-fr-maintainers`
- Approvers: `@open-telemetry/docs-fr-approvers`

**Japanese**:

- Website: <https://opentelemetry.io/ja/>
- Slack channel: [`#otel-localization-ja`][otel-localization-ja]
- Maintainers: `@open-telemetry/docs-ja-maintainers`
- Approvers: `@open-telemetry/docs-ja-approvers`

**Portuguese**:

- Website: <https://opentelemetry.io/pt/>
- Slack channel: [`#otel-localization-ptbr`][otel-localization-ptbr]
- Maintainers: `@open-telemetry/docs-pt-maintainers`
- Approvers: `@open-telemetry/docs-pt-approvers`

**Romanian**:

- Website: <https://opentelemetry.io/ro/>
- Slack channel: [`#otel-localization-ro`][otel-localization-ro]
- Maintainers: `@open-telemetry/docs-ro-maintainers`
- Approvers: `@open-telemetry/docs-ro-approvers`

**Spanish**:

- Website: <https://opentelemetry.io/es/>
- Slack channel: [`#otel-localization-es`][otel-localization-es]
- Maintainers: `@open-telemetry/docs-es-maintainers`
- Approvers: `@open-telemetry/docs-es-approvers`

**Ukrainian**:

- Website: <https://opentelemetry.io/uk/>
- Slack channel: [`#otel-localization-uk`][otel-localization-uk]
- Maintainers: `@open-telemetry/docs-uk-maintainers`
- Approvers: `@open-telemetry/docs-uk-approvers`

### Contributing to existing localizations

We welcome contributors for all existing language localizations. If you're
interested in helping with translation or review, you might consider:

1. Join the CNCF Slack and introduce yourself in
   [`#otel-docs-localization`][otel-docs-localization]
2. Review the [localization contributing guide][]
3. Look for issues tagged with your language label (e.g.,
   [`lang:pt`][issues-lang-pt])
4. [Submit a pull request][submitting content] following the established
   guidelines

[submitting content]: https://opentelemetry.io/docs/contributing/pull-requests/

### Starting a new localization

To propose a new language localization, you will need:

1. A localization mentor familiar with your language (ideally an active approver
   from the CNCF Glossary or Kubernetes documentation)
2. At least two committed contributors
3. Submit an
   [issue](https://github.com/open-telemetry/opentelemetry.io/issues/new)
   outlining your proposal

> [!NOTE] If you're interested in starting a new localization, do not hesitate
> to read our [new localization guide][] for detailed steps.

## Meeting Times

The localization teams operate as part of the Communications SIG. Each team is
free to establish their own meeting schedule based on their needs and
preferences. Some teams coordinate asynchronously, while others may hold regular
meetings.

See the
[open-telemetry/community repository](https://github.com/open-telemetry/community#localization-teams-part-of-sig-communications)
for details on meeting times, notes, and calendar links for teams that have
regular meetings.

## Discussion

Primary communication channels:

- **CNCF Slack**: [#otel-docs-localization][otel-docs-localization] - Main
  channel for all localization discussions
- **CNCF Slack**: [#otel-comms][otel-comms] - General Communications SIG channel
- **CNCF Slack**: Language-specific channels listed in the
  [Staffing / Help Wanted](#staffing--help-wanted) section

## Timeline

- **August 2024**: Official launch of multilingual website with initial
  localizations for Chinese, Japanese, Portuguese, and Spanish
- **Ongoing**: Each language team operates at its own pace, prioritizing content
  based on community needs and contributor availability
- **Continuous**: This is a long-term maintenance project with no defined end
  date

Key milestones:

- Initial homepage translations and infrastructure setup
- Glossary translations for each language
- Expanding coverage to core documentation sections
- Establishing language-specific style guides and terminology standards

## Labels

GitHub labels for tracking localization work:

- [`docs:i18n`][issues-docs-i18n] - General localization issues
- [`lang:bn`][issues-lang-bn] - Bengali localization
- [`lang:es`][issues-lang-es] - Spanish localization
- [`lang:fr`][issues-lang-fr] - French localization
- [`lang:ja`][issues-lang-ja] - Japanese localization
- [`lang:pt`][issues-lang-pt] - Portuguese localization
- [`lang:ro`][issues-lang-ro] - Romanian localization
- [`lang:uk`][issues-lang-uk] - Ukrainian localization
- [`lang:zh`][issues-lang-zh] - Chinese localization

## Linked Issues and PRs

- [Localization documentation][localization contributing guide] - Comprehensive
  guide for contributors and maintainers
- [Website goes multilingual blog post](/blog/2024/docs-localized/) - Official
  announcement of the localization initiative

## Project Board

Localization work can be tracked through the
[OpenTelemetry Localization project board](https://github.com/orgs/open-telemetry/projects/106).
The board has dedicated tabs for each language, allowing teams to organize and
prioritize their work independently while maintaining visibility across all
localization efforts.

[localization contributing guide]:
  https://opentelemetry.io/docs/contributing/localization/
[new localization guide]:
  https://opentelemetry.io/docs/contributing/localization/#new-localizations
[otel-localization-bn]: https://cloud-native.slack.com/archives/C08TBCSAY1F
[otel-localization-zhcn]: https://cloud-native.slack.com/archives/C08SSK25Y7L
[otel-localization-fr]: https://cloud-native.slack.com/archives/C08TBCU7I3L
[otel-localization-ja]: https://cloud-native.slack.com/archives/C08SGPBN44E
[otel-localization-ptbr]: https://cloud-native.slack.com/archives/C076LET8YSK
[otel-localization-ro]: https://cloud-native.slack.com/archives/C09E9KNNLP4
[otel-localization-es]: https://cloud-native.slack.com/archives/C07PVQVCHA6
[otel-localization-uk]: https://cloud-native.slack.com/archives/C097ZNPM3LK
[otel-docs-localization]: https://cloud-native.slack.com/archives/C076RUAGP37
[otel-comms]: https://cloud-native.slack.com/archives/C02UN96HZH6
[issues-docs-i18n]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Adocs%3Ai18n
[issues-lang-bn]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Abn
[issues-lang-es]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Aes
[issues-lang-fr]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Afr
[issues-lang-ja]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Aja
[issues-lang-pt]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Apt
[issues-lang-ro]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Aro
[issues-lang-uk]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Auk
[issues-lang-zh]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Azh
