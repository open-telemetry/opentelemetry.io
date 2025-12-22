# OpenTelemetry Collector Documentation Refactoring

A cross-SIG effort by Communications and Collector SIGs.

## Description

The Communications SIG is prioritizing a refactor of the Collector
documentation. Our 2024 survey and usage data prove that the Collector docs are
a heavily referenced component of opentelemetry.io. This refactoring should
address user requests, such as adding more examples for end users and improving
access to component documentation housed in code repos. The information
architecture also needs to be thoughtfully redesigned to enhance findability. We
hope to leverage the experiences of end-user volunteers and Collector approvers
and maintainers to create a better docs set in preparation for the v1.0 release
and OpenTelemetry graduation.

### Current challenges

This refactoring is necessary for several reasons:

- The Collector docs have grown organically, which means there is no longer a
  clear information architecture and the top-level Table of Contents (TOC) is a
  bit sprawling.
- We've received feedback from docs users:
  - The quickstart is confusing.
  - What actually _is_ the Collector?
  - We need more examples, including diagrams.
  - Where are the component docs?

### Goals, objectives, and requirements

Our primary goals are as follows:

- Restructure the architecture to increase findability and reflect the user
  journey we want users to follow.
- Clarify and distinguish concepts and features.
- Unify terminology.
- Add examples and visual aids.
- Improve the troubleshooting documentation.
- Incorporate the component documentation into opentelemetry.io.
- Identify areas for future improvement that are beyond the scope of this
  project.

## Deliverables

The project will occur in four phases.

### Phase 1: Rearchitect the docs and begin moving pages

In this phase, we propose a new architecture for the documentation based on
analysis of 4+ years of Slack threads.

The architecture was proposed and approved by stakeholders at the Collector SIG
meeting on 3 September 2025. Here is the approved architecture:

[TODO: add image]

Following approval of the new IA, we begin the rearchitecture with sections that
require moving only existing pages or breaking up existing pages into multiple
pages. The following sections don't need new content immediately in order to
make sense:

- Install the Collector
- Deploy the Collector
- Extend the Collector

In addition to moving and breaking up pages, we will copy edit all of the
content as follows:

- Style guide compliance
  - Standardize Collector-related terminology
  - Sentence case headings
  - Capitalization of some terms and not of others
  - Using “for example” instead of e.g. and “in other words” (or similar) for
    i.e.
  - Using “using”, “with”, “by”, etc. for via
- Clarity
- Grammar
  - Unnecessary passive voice
  - Unnecessary adverbs and general wordiness
  - Future tense - should almost always be present tense
- Tone/voice continuity
- Short code admonitions instead of Markdown notes

Finally, we will ask the Collector SMEs to review the content for accuracy.

### Phase 2: Create sections that require new content

In this phase, we being work on sections that need significant changes:

- Introduction
  - New: Introduction landing page
  - New: What is the Collector?
  - New: Choose a distribution
  - Changes?: Architecture
- Configure the Collector
  - New: Configuration file structure
  - New: Components landing page
  - New: Receivers/Processors/Exporters/etc - add a hyperlinked list?
  - New: Recipes landing page
- Deploy the Collector (follow up)
  - New: Choose a deployment pattern
  - New: Other patterns landing page
  - New: Combined agent-to-gateway pattern
- Manage the Collector
  - New: Monitor the Collector landing page
  - New: Scaling and HA landing page
  - New: OpAMP docs
  - New: Scaling best practices landing page and child pages?

### Phase 3: Identify and fix what's missing or incorrect

The Collector docs haven’t been audited in a long time, if ever. Lots of content
is outdated or incorrect and lots of new stuff is missing.

Users are also clamoring for more examples of all types, including visuals.

We can use AI to help us:

- Prioritize which pages to focus on first
- Check Google analytics website usage information
- Identify the most common questions
- Create examples? Might be interesting to try.

The following are potential sources to identify gaps that lead to user
questions:

- Comms repo issues (both open and closed) for Collector docs
- Slack channel (#otel-collector)
- Kapa.ai website search information and coverage gap analytics
- User interviews - solicit participants from Slack?
- Maintainer interviews - we could also ask them to identify gaps as they review
  docs pages during the rearchitecture
- Results of Collector survey question “If you could improve one part of the
  Collector documentation, what would it be and why?”
- Reddit, StackOverflow, HackerNews, ??

The following are potential sources for examples, recipes, tutorials, etc.:

- Third-party blog posts about the Collector
- End-user OTel Me interviews
- `https://www.otelbin.io/` for diagrams of Collector configurations

We should audit the core and contrib repositories to see if any docs content can
be ported to the website. Component documentation must stay in the code repos,
but we are exploring ways to incorporate it into the website. A short-term
solution could be a hyperlinked list.

### Phase 4: Measure success and identify opportunities for future improvement

We are taking on this refactoring project to improve the Collector user
experience. So how do we measure whether we’ve succeeded? Unfortunately, as an
open source project without a backend, we don’t have access to some of the more
telling statistics. For example, we can't tell if a docs user installed the
SDK/Collector/etc. or if they are sending data.

#### Measure No. 1

One gauge we have is a question included in the annual Collector survey:

> Overall, how satisfied are you with the Collector documentation on
> opentelemetry.io? Very dissatisfied 1 2 3 4 5 Very satisfied

The 2025 results [TODO]. We could ask the question in future surveys to
determine if users are overall more satisfied with the documentation.

#### Measure No. 2

We can use the results of the “Was this page helpful?” feedback buttons on each
page as tracked in Google Analytics.

During the 12-month period October 6, 2024 to October 6, 2025, the overall
approval rating (of the visitors who hit a feedback button, the percent who
selected “yes, this page was helpful”) for page paths containing “collector” was
**69.5%**, though some pages scored considerably lower.

TODO: add table screenshot

#### Measure No. 3

Conduct a poll in the #otel-collector Slack channel. But what and how should we
ask?

## Staffing / Help Wanted

Project lead: [Tiffany Hrabusa](https://github.com/tiffany76)

Support provided by: [TODO:]

## Meeting Times

No dedicated meeting. If synchronous discussion is required, we will raise
topics in the Communications and/or Collector SIG meetings.

### Meeting Links

[TODO:]

## Discussion

[TODO:]

## Timeline

The following list of completion dates is tentative and subject to change.

Phase 1: 31 December 2025 Phase 2: 27 February 2026 Phase 3: 20 March 2026 Phase
4: 15 May 2026

## Labels

`sig:collector:refactor`

## Linked Issues and PRs

TODO:

## Project Board

[SIG Comms + SIG Collector: Doc refactoring project board](https://github.com/orgs/open-telemetry/projects/174/views/2)
