---
title: About this website
linkTitle: Website docs
description: How this site is built, maintained, and deployed.
# NOTE: aliases are not currently enabled for this section.
cascade:
  type: docs
  params:
    hide_feedback: true
---

This section is for site maintainers and contributors. It documents how the
OpenTelemetry website is organized, built, maintained, and deployed.

<span class="badge fs-6 py-2">
{{% _param FAS person-digging " pe-2" %}} Section under construction. {{%
_param FAS person-digging " ps-2" %}}
</span>

## Content (planned) {#content}

Tentatively planned content organization:

- **About** — High-level information about the website project, including its
  purpose, ownership, and overall status.
- **Design** — Architectural design, Information Architecture (IA), layout, UX
  choices, theme related decisions, and other design-level artifacts.
- **Implementation** — Code-level structure and conventions, Hugo/Docsy
  templates, SCSS/JS customizations, patches, and internal shims.
- [**Build**](./build/) — Tooling, local development setup, CI/CD workflows,
  deployment environments, and automation details.
- **Quality** — Link checking, accessibility standards, tests, review practices,
  and other quality-related processes.
- **Roadmap** — Milestones, backlog, priorities, technical debt, and
  design/implementation decisions.

## Site build information

{{% td/site-build-info/netlify "opentelemetry" %}}
