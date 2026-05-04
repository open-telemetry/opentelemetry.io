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
- [`/review-pull-request <pr-number-or-url>`][review-pull-request]: review a
  pull request for CI check semantics, CLA and approval-label workflow, refcache
  handling, locale rules, and content quality.
- [`/update-i18n-drift-status [--locale locale,...] [--create-pr]`][update-i18n-drift-status]:
  update the `drifted_from_default` front matter field for localized content,
  with optional arguments to limit which locales are processed and whether to
  open a PR automatically.

Some agent chats let you invoke a skill by typing `/` followed by its name.

## Hooks

Alongside the agent skills above, [hooks][] run automatically on certain tool
events. Configuration lives in [`.claude/hooks/hooks.json`][hooks-json]; hook
source lives under [`scripts/validate/`][validate].

- **Blog front matter check**: a `PreToolUse` hook on `Write` and `Edit` that
  blocks changes to `content/en/blog/**/*.md` when the front matter is missing
  required fields, uses a bad date format, or introduces an H1 heading. It
  applies the same conventions as [`/review-blog-post`](#agent-skills) at
  write-time, without waiting for review. Source:
  [`scripts/validate/front-matter-check/`][frontmatter-check]. Pure logic lives
  in `index.mjs` and is covered by `index.test.mjs` in the same folder
  (`npm run test:local-tools` to run it).

## Maintainer skills

See the section index below.

[`.claude/skills/`]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/.claude/skills
[agentskills.io]: https://agentskills.io
[draft-issue]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/draft-issue/SKILL.md
[resolve-refcache-conflicts]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/resolve-refcache-conflicts/SKILL.md
[review-blog-post]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/review-blog-post/SKILL.md
[review-pull-request]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/review-pull-request/SKILL.md
[update-i18n-drift-status]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/update-i18n-drift-status/SKILL.md
[hooks]: https://docs.claude.com/en/docs/claude-code/hooks
[hooks-json]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/hooks/hooks.json
[validate]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate
[frontmatter-check]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate/front-matter-check
