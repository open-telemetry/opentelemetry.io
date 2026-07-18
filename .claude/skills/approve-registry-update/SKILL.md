---
name: approve-registry-update
description: >-
  Verify that an otelbot "Auto-update registry versions" PR is a pure version
  bump, then on confirmation, approve and add it to the merge queue. Use for
  otelbot/auto-update-registry-* PRs in open-telemetry/opentelemetry.io.
argument-hint: '[PR number or URL]'
allowed-tools: Bash Read Grep Glob
model: sonnet
effort: medium
---

# Approve Registry Update

Fast-path review for otelbot **Auto-update registry versions** PRs (for example
[#10556][]), which bump the `package.version` field in `data/registry/*.yml`
entries. Per [`sig-practices.md#prs-from-bots`][bots], these can be approved and
merged immediately — but only after confirming the change is a clean version
bump with **no other field changes** and **no added or changed URLs** (including
no trailing comment on the version line).

## Arguments

- **No argument** (the happy path): discover the open registry auto-update PR(s)
  and process each one through the workflow below, confirming and approving each
  separately.

  ```bash
  gh pr list --state open --author app/otelbot \
    --search "head:otelbot/auto-update-registry" --json number,headRefName,title
  ```

  If none are open, say so and stop.

- **Argument given**: resolve `$ARGUMENTS` to a PR number — a bare number, a
  `#`-prefixed number, or a GitHub URL with `/pull/<N>`. If unrecognizable, ask.

## Scope

Use this skill **only** for otelbot _registry_ auto-update PRs. Route other
otelbot auto-update PRs (SDK, instrumentation, collector, spec) and any PR that
turns out not to be a clean bump to the `review-pull-request` skill.

## Workflow

### 1. Confirm it's a registry auto-update PR

Branch-discovered PRs already satisfy this; only re-check when a PR was passed
as an argument:

```bash
gh pr view <N> --json author,headRefName,title,state
```

Require: `author.login` is `app/otelbot`, `headRefName` starts with
`otelbot/auto-update-registry-`, `title` starts with
`Auto-update registry versions`, and `state` is `OPEN`. If not, stop and say so.

### 2. Analyze the diff

These PRs touch 100+ files, so write the diff to a file and inspect it with
`grep` — don't print it to the terminal. Prefer `./tmp` (gitignored) when it
exists, else `/tmp`. Derive everything below from the diff, not from
`gh pr view --json files` (that field caps at 100 files and under-reports large
PRs).

```bash
gh pr diff <N> > ./tmp/registry-<N>.diff
```

A clean bump produces **no output** from any guard check below:

```bash
D=./tmp/registry-<N>.diff
# a. Changed files outside data/registry/*.yml, or files added/deleted/renamed:
grep -E '^\+\+\+ ' "$D" | sed 's#^+++ b/##' | grep -vE '^data/registry/.*\.ya?ml$'
grep -E '^(new file|deleted file|rename|copy) ' "$D"
# b. Changed content lines that aren't a bare `version:` bump
#    (catches trailing comments, URLs, and any other field change):
grep -E '^[+-]' "$D" | grep -vE '^(\+\+\+|---) ' | grep -vE '^[+-][[:space:]]+version: [^#]*$'
```

Summarize the bumps grouped by old → new version (useful for the report and the
approval comment):

```bash
python3 - "$D" <<'PY'
import sys, re, collections
diff = open(sys.argv[1]).read()
bumps = collections.Counter(); n = 0
for f in re.split(r'(?m)^diff --git ', diff):
    old = re.search(r'(?m)^-\s+version:\s*(\S+)', f)
    new = re.search(r'(?m)^\+\s+version:\s*(\S+)', f)
    if old and new:
        n += 1; bumps[(old.group(1), new.group(1))] += 1
print(f"{n} files bumped")
for (o, nw), c in bumps.most_common():
    print(f"  {o} -> {nw}  ({c})")
PY
```

### 3. Report

- **Clean** (all guard checks empty): report "Version bumps only — N files, no
  other field changes, no added or changed URLs," followed by the grouped old →
  new summary.
- **Not clean**: report what each non-empty check found and point at what to
  inspect — a non-`version` line means another field changed; a `#` or `http` on
  a changed line means a trailing comment or URL was added; a non-registry path
  or add/delete/rename means the PR is doing more than a bump. **Do not
  approve** — recommend `/review-pull-request`, then ask whether to post the
  summary as a PR comment.

### 4. Approve and enqueue

Only when the verdict is clean, ask: **Approve #N and add it to the merge
queue?** On yes, approve with the summary in the comment body (not just LGTM),
then enqueue:

```bash
gh pr review <N> --approve --body "Version bumps only — no other field changes, no added or changed URLs. Per sig-practices.md (PRs from bots).

<grouped old → new summary>"
gh pr merge <N>
```

The repo uses a squash merge queue, so `gh pr merge <N>` needs no strategy: it
enqueues the PR (or enables auto-merge until checks pass). On no, stop.

## References

- [`sig-practices.md#prs-from-bots`][bots] — merge practices for bot PRs.
- `review-pull-request` skill — full review for non-clean or non-registry PRs.

[#10556]: https://github.com/open-telemetry/opentelemetry.io/pull/10556
[bots]: ../../../content/en/docs/contributing/sig-practices.md#prs-from-bots
