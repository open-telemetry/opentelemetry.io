# /fix Bot Commands {#fix-bot-commands}

**When to read:** when you want to recommend an automated fix via a PR comment.
The syntax is strict — even a stray word beside the command causes the comment
to be ignored.

`.github/workflows/pr-actions.yml` runs on `issue_comment` and lets anyone
trigger an automated fix run. Bot identity is `otelbot`
(`pr-actions.yml:13-14`).

**Syntax is strict** (`pr-actions.yml:42-50`): the comment body is `/fix` or
`/fix:<name>` on its own, **with no other text**. A comment like "please run
/fix:format" is rejected by the workflow.

- `/fix` — run all fixers (`fix:all`, minus i18n per `fix` alias in
  `package.json`)
- `/fix:all` — compat alias, mapped to `/fix` internally
  (`pr-actions.yml:70-74`)
- `/fix:ALL` — maintainer escape hatch that runs the _real_ `fix:all` including
  i18n (`pr-actions.yml:78-80`)
- `/fix:<name>` — run a single named fixer

Available `<name>` values (from `pull-requests.md:168-179` and `package.json`
scripts):

| Command               | What it does                                                       |
| --------------------- | ------------------------------------------------------------------ |
| `fix:dict`            | Normalize `cSpell:ignore` front-matter lists and `.cspell/*.txt`   |
| `fix:expired`         | Delete content past its `expiryDate`                               |
| `fix:filenames`       | Rename `snake_case` files to `kebab-case`                          |
| `fix:format`          | Prettier write + trim trailing whitespace                          |
| `fix:htmltest-config` | Regenerate htmltest config                                         |
| `fix:i18n`            | Update `default_lang_commit` / `drifted_from_default` front matter |
| `fix:markdown`        | `markdownlint --fix` + trim trailing whitespace                    |
| `fix:refcache`        | Prune 404s from refcache, then re-run link check                   |
| `fix:submodule`       | Pin submodules to specific commits                                 |
| `fix:text`            | Textlint `--fix`                                                   |

The bot applies the patch as a single commit with message "Results from /fix
directive" (`pr-actions.yml:175`); the author needs to `git pull` to stay in
sync before their next push.
