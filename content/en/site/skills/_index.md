---
title: Skills for agents and maintainers
linkTitle: Skills
description: Skills for agents and maintainers to use when maintaining the site.
weight: 22
cSpell:ignore: agentskills openai
---

This section describes skills and procedures for agents and maintainers to use
when maintaining the site.

We use the term **agent skill** to refer to reusable actions written in
conformance to [agentskills.io][] that can be invoked by agents or followed
manually by maintainers. We call a **_maintainer_ skill** (or maintainer
procedure) a set of steps that an agent or maintainer can follow to accomplish a
specific task. Agent skills are defined in [`.agents/skills/`][]. Maintainer
procedures are defined in this section.

In skill and procedure steps, the prose states the intent of each action; a
command given in parentheses is a suggested way to fulfill the step, not the
only valid one. Skills written before this convention was adopted might not yet
follow it.

## Agent skills

As mentioned above, skills are defined in [`.agents/skills/`][], they are:

- [`/approve-registry-update [pr-number-or-url]`][approve-registry-update]:
  assist reviewers deciding whether to merge an otelbot registry version-bump
  PR; verify it's a clean bump and, on confirmation, approve it and add it to
  the merge queue. With no argument, processes open registry auto-update PRs.
- [`/draft-issue <issue-description>`][draft-issue]: draft a GitHub issue in the
  `opentelemetry.io` repository following issue templates, contributing
  guidelines, and the label taxonomy.
- [`/refresh-link-cache-pr-fix`][refresh-link-cache-pr-fix]: fetch, review and
  attempt to fix non-2XX URLs on otelbot PRs (by default, all open `otelbot/*`
  PRs with failing link checks, or specific branches when so instructed).
- [`/resolve-link-cache-conflicts <optional-pr-number>`][resolve-link-cache-conflicts]:
  resolve `link-cache.jsonc` merge/rebase conflicts.
- [`/review-blog-post <blog-post-path-or-pr-number>`][review-blog-post]: review
  an OpenTelemetry blog post for front matter compliance, content conventions,
  GitHub link stability (`gh-url-hash`), spelling, and OTel terminology.
- [`/review-pull-request <pr-number-or-url>`][review-pull-request]: review a
  pull request for CI check semantics, CLA and approval-label workflow,
  link-cache handling, locale rules, and content quality.
- [`/setup-new-localization <kickoff-issue | lang-code>`][setup-new-localization]:
  set up a new website localization end-to-end — Hugo language block, content
  mounts, cSpell word list, `lang:<lang>` labeler config and label,
  `locale-teams.yaml` with CODEOWNERS regeneration, and the `localization.md`
  entries.
- [`/update-i18n-drift-status [--locale locale,...] [--create-pr]`][update-i18n-drift-status]:
  update the `drifted_from_default` front matter field for localized content,
  with optional arguments to limit which locales are processed and whether to
  open a PR automatically.
- [`/update-old-blog-ignores`][update-old-blog-ignores]: advance the year range
  of old blog posts excluded from lint/format checks and fix scripts.
- [`/update-git-submodule <submodule>... <version|latest|HEAD>`][update-git-submodule]:
  update one or more git submodules to a target version.

Codex discovers these skills in `.agents/skills/`. Claude Code uses the relative
symlinks in `.claude/skills/`, which point to the same skill directories. Invoke
a skill with `$skill-name` in Codex or `/skill-name` in Claude Code. Windows
checkouts need Git symlink support (`core.symlinks=true`) for Claude Code.

### Adding an agent skill

1. Create `.agents/skills/<name>/SKILL.md` with `name` and `description` in its
   YAML front matter, following [agentskills.io][].
2. Add a relative symlink for Claude Code:
   `ln -s ../../.agents/skills/<name> .claude/skills/<name>`.
3. For an explicit-only skill, set `disable-model-invocation: true` in the front
   matter for Claude Code and add `agents/openai.yaml` inside the skill
   directory for Codex:

   ```yaml
   policy:
     allow_implicit_invocation: false
   ```

4. Add the skill to the list above. Keep shared instructions and resources in
   `.agents/skills/`; keep runtime-specific hooks and settings in their
   runtime's configuration directory.

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

[`.agents/skills/`]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/.agents/skills
[agentskills.io]: https://agentskills.io
[approve-registry-update]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/approve-registry-update/SKILL.md
[draft-issue]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/draft-issue/SKILL.md
[refresh-link-cache-pr-fix]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/refresh-link-cache-pr-fix/SKILL.md
[resolve-link-cache-conflicts]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/resolve-link-cache-conflicts/SKILL.md
[review-blog-post]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/review-blog-post/SKILL.md
[review-pull-request]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/review-pull-request/SKILL.md
[setup-new-localization]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/setup-new-localization/SKILL.md
[update-i18n-drift-status]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-i18n-drift-status/SKILL.md
[update-old-blog-ignores]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-old-blog-ignores/SKILL.md
[update-git-submodule]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-git-submodule/SKILL.md
[hooks]: https://docs.claude.com/en/docs/claude-code/hooks
[hooks-json]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/hooks/hooks.json
[validate]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate
[frontmatter-check]:
  https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate/front-matter-check
