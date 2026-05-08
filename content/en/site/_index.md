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
- **Needs, requirements, and features** — Stakeholder needs, requirements, and
  other relevant information broken down into features.
- [**Skills**](./skills/) — Skills for agents and humans to use when maintaining
  the site.
- **Design** — Architectural design, Information Architecture (IA), layout, UX
  choices, theme related decisions, and other design-level artifacts.
- **Implementation** — Code-level structure and conventions, Hugo/Docsy
  templates, SCSS/JS customizations, patches, and internal shims.
- [**Build**](./build/) — Tooling, local development setup, CI/CD workflows,
  deployment environments, and automation details.
- **Deployment** — Deployment-specific behavior for the OpenTelemetry website.
- [**Testing**](./testing/) — Link checking, accessibility standards, tests,
  review practices, and other quality-related processes.
- **Roadmap** — Milestones, backlog, priorities, technical debt, and
  design/implementation decisions.

## Adding content

Keep pages short and high signal.

- Record decisions, rationale, constraints, and key rules.
- Prefer concise summaries over long background sections.
- Link to issues, plans, or code for detail instead of repeating them here.
- Add only the content needed to explain how the site works and why.

## Site build information

{{% td/site-build-info/netlify "opentelemetry" %}}
