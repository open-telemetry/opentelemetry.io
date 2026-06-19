---
name: setup-new-localization
description: >-
  Set up a new website localization (language) for opentelemetry.io: Hugo
  language config, content mounts, cSpell wiring, label map, CODEOWNERS via the
  locale-teams registry, and the localization project page. Use when adding a
  new language/locale, wiring a new `content/<lang>/` tree, or onboarding a
  localization team.
argument-hint: '<kickoff-issue | lang-code>'
allowed-tools: Bash Read Edit Write Grep Glob
cSpell:ignore: endonym unstaffed
---

# Set up a new localization

Wire a new language into the site end-to-end. Start from one of:

- **A kickoff issue (preferred)** — its number or URL, e.g.
  [#9577][kickoff-example]. Read it with
  `gh issue view <n> -R open-telemetry/opentelemetry.io` and pull out:
  - ISO 639-1 code → `<lang>`
  - Language name → `<native-label>`
  - Locale mentor + Contributors → the **approvers** (`data/locale-teams.yaml`)
- **A bare `<lang>` ISO 639-1 code** when there's no issue yet. You then gather
  the team handles and native label yourself.

Either way, derive these; don't ask for them as separate arguments:

- **Hugo locale** — usually the bare code, so you **omit the `locale:` field**
  (Hugo defaults it to `<lang>`, as `bn`, `es`, `fr`, and `ja` do). When
  `<lang>` has several regional variants in real use, you must ask which one.
  See step (a).
- **`<native-label>`** — the endonym for that language (from the issue, or see
  gotchas for picking the right one).
- **`<country>`** — the language's primary country, for the Slack channel / team
  naming and the label color (step (e)).

[kickoff-example]:
  https://github.com/open-telemetry/opentelemetry.io/issues/9577

> [!NOTE]
>
> All list entries below stay in **alphabetical order by `<lang>`** (English
> `en` stays first as the default). Match the placement of an existing neighbor
> (e.g. insert `ko` between `ja` and `pl`).

## Steps

### a. `config/_default/hugo.yaml` — language block

First decide the locale:

- If `<lang>` maps to a single common locale, **omit `locale:`**. Hugo defaults
  it to `<lang>` (the ISO 639-1 code), as `bn`, `es`, `fr`, and `ja` do.
- If `<lang>` has several regional variants in real use (e.g. `pt` → `pt-BR` /
  `pt-PT`, `zh` → `zh-CN` / `zh-TW`, `en` → `en-US` / `en-GB`), **ask the user
  which locale** with the `AskUserQuestion` tool (if available; otherwise ask in
  plain text), then set `locale:` to their answer.

Then add the block under `languages:`, in alphabetical order:

```yaml
<lang>:
  label: <native-label> # e.g. 한국어
  locale: <LOCALE> # only when <lang> has multiple regional variants; else omit
  params:
    description: <translated site description>
```

### b. `config/_default/module-template.yaml` — content mounts

Copy the shape of an existing block (e.g. `## ja`), in alphabetical order:

```yaml
  ## <lang>
  - source: content/<lang>
    target: content
    sites: &<lang>-matrix
      matrix: { languages: [<lang>] }
  # fallback pages
  - source: content/en/_includes
    target: content/_includes
    sites: *<lang>-matrix
  - source: content/en/announcements
    target: content/announcements
    sites: *<lang>-matrix
  - source: content/en/docs
    target: content/docs
    files: ['! specs/**']
    sites: *<lang>-matrix
```

### c. `.cspell.yml` — custom word list

Add the custom list in **both** sections (alphabetical):

```yaml
dictionaryDefinitions:
  - name: <lang>-words
    path: .cspell/<lang>-words.txt
# ...
dictionaries:
  - <lang>-words
```

**Upstream dict: check the cspell-dicts repo, not a guessed npm name.** The
published package names are inconsistent (`dict-es-es` with a hyphen vs
`dict-pl_pl` with an underscore), but the [dictionary folders][cspell-dicts]
follow one rule: `<lang>` (e.g. `bn`) or `<lang>_<REGION>` (e.g. `es_ES`,
`pl_PL`, `pt_BR`, `uk_UA`). A matching folder means a dict exists; no folder (no
`ko`, `ja`, `zh`) means there isn't one.

```bash
gh api repos/streetsidesoftware/cspell-dicts/contents/dictionaries \
  --jq '.[].name' | grep -i '^<lang>'
```

The **dictionary id** is the folder name lowercased with `_` → `-` (`pl_PL` →
`pl-pl`). For the exact **package name** and version, read them from npm
(`npm view @cspell/dict-<id> name version`, falling back to the underscore form
if the hyphen one 404s). Then wire it in three places:

- `.cspell.yml` import: `'@cspell/dict-pl_pl/cspell-ext.json'` (exact package
  name)
- `.cspell.yml` `dictionaries:` id: `pl-pl` (hyphen, even though the package
  uses `_`)
- `package.json` devDependency: `"@cspell/dict-pl_pl": "<version>"`

**Korean has no folder**, so for `ko` add only the custom `ko-words` list and
leave `package.json` unchanged.

[cspell-dicts]:
  https://github.com/streetsidesoftware/cspell-dicts/tree/main/dictionaries

### d. `.cspell/<lang>-words.txt` — empty custom list

```bash
touch .cspell/<lang>-words.txt
```

### e. `lang:<lang>` label — labeler config **and** the GitHub label

Wire the auto-labeler in `.github/component-label-map.yml`:

```yaml
lang:<lang>:
  - changed-files:
      - any-glob-to-any-file:
          - content/<lang>/**
```

The `lang:<lang>` GitHub label must also exist, or the labeler has nothing to
apply. Create it with the country's **main flag color** (a maintainer action —
needs repo triage/write):

```bash
gh label create "lang:<lang>" -R open-telemetry/opentelemetry.io --color <hex>
# flag color, no leading '#', e.g. ko=0047A0  pl=DC143C  pt=009739  uk=ffdd00
```

### f. `data/locale-teams.yaml` — the CODEOWNERS source of truth

Since #10295 this registry **generates** the locale section of CODEOWNERS. It
records the expected membership of the `docs-<lang>-*` teams (created in the
admin repo — see [Out-of-repo](#out-of-repo-create-the-org-teams)). Under the
`locales:` map, in alphabetical order, add:

```yaml
<lang>:
  maintainers: []
  approvers: [<mentor-and-contribs>] # issue's "Locale mentor" + "Contributors"
```

Empty `maintainers` marks the locale **unstaffed**: its CODEOWNERS lines fall
back to `@open-telemetry/docs-approvers`.

### g. Regenerate CODEOWNERS

```bash
npm run fix:codeowners     # regenerates the BEGIN/END locale-owners block
npm run check:codeowners   # must report "up to date"
```

**Never hand-edit** the generated block in `.github/CODEOWNERS`.

### h. `projects/localization.md` — 5 alphabetical insertions

1. Supported-languages list: `- [<native-label> - <Lang> (<lang>)][<lang>]`
   **and** its link ref `[<lang>]: https://opentelemetry.io/<lang>/`
2. "Current language teams" section block (Website / Slack / Maintainers /
   Approvers, mirroring a sibling)
3. Labels list: `` - [`lang:<lang>`][issues-lang-<lang>] - <Lang> localization``
4. Slack channel ref: `[otel-localization-<lang>]: <channel-url>`
5. Issues label ref: `[issues-lang-<lang>]: <issues-search-url>`

## Do NOT (gotchas)

- **Do NOT touch `.github/component-owners.yml`.** Pre-#10295 the old process
  added a `content/<lang>:` block there; #10295 removed **all** locale teams
  from that file. It now holds only non-locale component reviewers. Re-adding a
  locale duplicates ownership.
- **Do NOT hand-edit** the generated locale section of `.github/CODEOWNERS`.
  Edit `data/locale-teams.yaml` and run `npm run fix:codeowners`.
- **Pick the right endonym.** Korean is `한국어` (South Korea), not `조선말`
  (North Korea). Choose the endonym matching the language's primary country.
- **Never assume an upstream cSpell dict exists.** Check the cspell-dicts repo
  folders (there is no `ko`, `ja`, or `zh`).

## Out-of-repo: create the org teams {#out-of-repo-create-the-org-teams}

The generated CODEOWNERS references `@open-telemetry/docs-<lang>-approvers`;
GitHub flags it as invalid until that team exists. The two teams live in the
[`open-telemetry/admin`][admin] repo's `teams.tf`, with
`docs-<lang>-maintainers` as a **child** of `docs-<lang>-approvers`:

```hcl
resource "github_team" "docs-<lang>-approvers" {
  name        = "docs-<lang>-approvers"
  description = ""
  privacy     = "closed"
}

resource "github_team" "docs-<lang>-maintainers" {
  name           = "docs-<lang>-maintainers"
  parent_team_id = github_team.docs-<lang>-approvers.id
  description    = ""
  privacy        = "closed"
}
```

This is a **separate PR against `open-telemetry/admin`** (example:
[admin#716][admin-716]) that an **org admin** must merge; the admin then applies
team membership to match `data/locale-teams.yaml`. You can prepare and describe
this PR, but you can't merge it.

[admin]: https://github.com/open-telemetry/admin
[admin-716]: https://github.com/open-telemetry/admin/pull/716

## Validation checklist

```bash
npm run check:codeowners                  # "up to date"
git diff --name-only                      # exactly the files below, nothing more
git diff --name-only | grep component-owners.yml && echo "BUG: do not touch" || echo OK
gh label list -R open-telemetry/opentelemetry.io | grep "lang:<lang>"  # label exists
```

Expected changed/added paths:

- `config/_default/hugo.yaml`
- `config/_default/module-template.yaml`
- `.cspell.yml`
- `.cspell/<lang>-words.txt` (new)
- `.github/component-label-map.yml`
- `.github/CODEOWNERS` (generated)
- `data/locale-teams.yaml`
- `projects/localization.md`
- `package.json` **only if** an upstream `@cspell/dict-*` was added
