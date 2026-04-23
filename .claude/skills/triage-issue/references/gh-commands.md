# gh Command Templates {#gh-command-templates}

**When to read:** whenever you're about to emit a `gh` command (close, label,
comment) in a dossier. Start with the close-reason mapping below so you never
emit a `--reason` value that `gh` rejects.

## Close-Reason Mapping {#close-reason-mapping}

The internal action tokens from the
[analysis checklist](./analysis-checklist.md#8-recommendation) are decision
labels, not `gh` command flags. `gh issue close --reason` accepts only three
values (`gh issue close --help`); map as follows when emitting commands:

| Internal action   | `gh issue close --reason` value                         |
| ----------------- | ------------------------------------------------------- |
| `close:completed` | `"completed"`                                           |
| `close:stale`     | `"not planned"`                                         |
| `close:wontfix`   | `"not planned"`                                         |
| `close:invalid`   | `"not planned"`                                         |
| `close:duplicate` | `"duplicate"` — prefer `--duplicate-of <N>` (see below) |

Never emit `--reason "stale"` / `"wontfix"` / `"invalid"` — `gh` rejects them.

## Add triage label

```bash
gh issue edit <number> --repo <REPO> \
  --add-label "triage:accepted:needs-pr"
```

## Add co-ownership / area labels

```bash
gh issue edit <number> --repo <REPO> \
  --add-label "sig:collector,docs"
```

## Post comment

```bash
gh issue comment <number> --repo <REPO> \
  --body "<comment text>"
```

## Close as completed (merged PR resolved it)

```bash
gh issue close <number> --repo <REPO> \
  --reason "completed" \
  --comment "<resolution notice>"
```

## Close as not planned (stale / wontfix / invalid)

```bash
gh issue close <number> --repo <REPO> \
  --reason "not planned" \
  --comment "<stale/wontfix/invalid notice>"
```

## Close as duplicate

Preferred form — sets a GitHub-native duplicate relationship:

```bash
gh issue close <number> --repo <REPO> \
  --duplicate-of <dup-number> \
  --comment "Duplicate of #<dup-number>."
```

Fallback form:

```bash
gh issue close <number> --repo <REPO> \
  --reason "duplicate" \
  --comment "Duplicate of #<dup-number>."
```
