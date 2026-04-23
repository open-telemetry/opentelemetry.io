---
title: Skills for agents and maintainers
linkTitle: Skills
description: Skills for agents and maintainers to use when maintaining the site.
weight: 22
cSpell:ignore: agentskills
---

This section describes skills and procedures for agents and maintainers to use
when maintaining the site.

We use the term **agent skill** to refer to reusable actions written in
conformance to [agentskills.io][] that can be invoked by agents or followed
manually by maintainers. We call a **_maintainer_ skill** (or maintainer
procedure) a set of steps that an agent or maintainer can follow to accomplish a
specific task. Agent skills are defined in [`.claude/skills/`][]. Maintainer
procedures are defined in this section.

## Agent skills

As mentioned above, skills are defined in [`.claude/skills/`][], they are:

- [`/draft-issue <issue-description>`][draft-issue]: draft a GitHub issue in the
  `opentelemetry.io` repository following issue templates, contributing
  guidelines, and the label taxonomy.
- [`/resolve-refcache-conflicts <optional-pr-number>`][resolve-refcache-conflicts]:
  resolve `static/refcache.json` merge/rebase conflicts.
- [`/review-blog-post <blog-post-path-or-pr-number>`][review-blog-post]: review
  an OpenTelemetry blog post for front matter compliance, content conventions,
  GitHub link stability (`gh-url-hash`), spelling, and OTel terminology.

Some agent chats let you invoke a skill by typing `/` followed by its name.

## Maintainer skills

See the section index below.

[`.claude/skills/`]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/.claude/skills
[agentskills.io]: https://agentskills.io
[resolve-refcache-conflicts]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/resolve-refcache-conflicts/SKILL.md
[review-blog-post]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/review-blog-post/SKILL.md
[draft-issue]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/draft-issue/SKILL.md
