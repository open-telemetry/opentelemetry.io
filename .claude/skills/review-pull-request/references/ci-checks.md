# CI Checks {#ci-checks}

**When to read:** once when walking the `gh pr checks` output for the PR under
review. Match each reported check name against the table to understand what
failed and how to point the author at a fix.

Check names in `gh pr checks` follow `<workflow name> / <job name>`. Grouped by
workflow file:

| Workflow                               | Job(s)                                                                                                                                         | What it validates                                                                      | How to fix                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------- |
| _(external)_                           | `Easy CLA`                                                                                                                                     | CNCF CLA signed on every commit author email                                           | See [CLA](./process-rules.md#cla)                  |
| _(external)_                           | `netlify/opentelemetry Deploy Preview`                                                                                                         | Hugo build deploys on Netlify preview                                                  | Click **Details** for build log                    |
| `.github/workflows/check-text.yml`     | `Linter / TEXT linter`, `Linter / MARKDOWN linter`                                                                                             | textlint terminology + markdownlint (custom rules in `scripts/_md-rules/`)             | `npm run fix:text`, `npm run fix:markdown`         |
| `.github/workflows/check-spelling.yml` | `Spelling / SPELLING check`, `Spelling / CSPELL word lists check`                                                                              | cSpell + normalization of `cSpell:ignore` front-matter lists                           | Add to `cSpell:ignore` or `npm run fix:dict`       |
| `.github/workflows/check-file.yml`     | `Files / EXPIRED FILE check`, `Files / FILENAME check`, `Files / FILE FORMAT`, `Files / BRANCH NAME check`                                     | Expired `expiryDate`, kebab-case filenames, Prettier format, branch name is not `main` | `npm run fix:expired`/`fix:filenames`/`fix:format` |
| `.github/workflows/check-links.yml`    | `Links / BUILD`, `Links / CHECK LINKS (en \| locales-A-to-M \| locales-N-to-Z)`, `Links / REFCACHE updates?`, `Links / WARNINGS in build log?` | Hugo build, sharded htmltest link check, refcache freshness, build warnings            | See Refcache in SKILL.md                           |
| `.github/workflows/check-registry.yml` | `Registry / check:registry`                                                                                                                    | `data/registry/**` schema (only runs when registry files change)                       | `npm run check:registry` locally                   |
| `.github/workflows/check-i18n.yml`     | i18n drift check                                                                                                                               | `default_lang_commit` / `drifted_from_default` front-matter consistency                | `npm run fix:i18n`                                 |

Link checking is **sharded** into `en`, `locales-A-to-M`, `locales-N-to-Z`
(`.github/workflows/check-links.yml:82-90`). A single shard failing does not
necessarily block merge — read the specific failure. Fork PRs can have
restricted token scope; a check failure on a fork may be a permissions artifact
rather than a real issue. Look at the log before concluding.

**Site-local links.** The build emits a warning when a page links to a full
`https://opentelemetry.io/...` URL instead of a path. Use `/docs/concepts/` not
`https://opentelemetry.io/docs/concepts/`
(`content/en/docs/contributing/pr-checks.md:151-169`). The warning is enforced
via `layouts/_markup/render-link.html`; the script
`scripts/content-modules/adjust-pages.pl` auto-rewrites some cases.

**Link-check escape hatch.** If an external link returns a non-200 but is
manually validated (LinkedIn, servers that block checkers), append
`?link-check=no` or `&link-check=no` to the URL (`pr-checks.md:123-129`).
Maintainers can run `./scripts/double-check-refcache-4XX.mjs` to revalidate 4xx
entries via Puppeteer (`pr-checks.md:131-143`).
