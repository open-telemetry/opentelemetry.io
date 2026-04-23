# Label Taxonomy Reference {#label-taxonomy-reference}

**When to read:** once before emitting any label-adding command, to confirm the
target labels exist in the repo and to avoid PR-only labels. The taxonomy is
repo-specific, so read this in combination with the active
`PROFILE.repo.label_taxonomy` (or the sibling `draft-issue` skill when targeting
`open-telemetry/opentelemetry.io`).

Label suggestions come from `PROFILE.repo.label_taxonomy` when a repo profile is
active. Use only labels confirmed to exist in the target repo — do not invent
labels.

For repositories without a repo profile, fetch the actual label list:

```bash
gh label list --repo <REPO> --json name --limit 100 | jq -r '.[].name'
```

The built-in `opentelemetry-website` profile defines the full taxonomy for
`open-telemetry/opentelemetry.io` — see
`${CLAUDE_PLUGIN_ROOT}/data/opentelemetry-website.yml`.

**For `open-telemetry/opentelemetry.io` specifically**, the sibling skill
`draft-issue` has the validated taxonomy grouped by area / SIG / localization /
effort / priority / triage / type / assignment, already checked against the live
label set. Treat it as the source of truth and refer to it instead of
hand-typing label names. Also honor the PR-only labels warning in that skill
(`#pr-only-labels-do-not-suggest`) — never apply those to an issue.
