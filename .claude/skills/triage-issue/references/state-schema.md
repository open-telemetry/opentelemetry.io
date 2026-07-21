# State Schema {#phase-5-update-state}

**When to read:** at the start of Phase 5 (Update State), and whenever you need
to decide whether an issue should be skipped, re-analyzed, or surfaced as
"pending execution" on a subsequent run.

Write/update `.tasks/triage/state.json` (schema:
`${CLAUDE_PLUGIN_ROOT}/schemas/triage-state.schema.json`). Create the directory
and an empty `{"version":1,"lastRun":"1970-01-01T00:00:00.000Z","issues":{}}`
file on the first run if neither exists.

## Fields

| Field            | Set by    | Required | Purpose                                                                    |
| ---------------- | --------- | -------- | -------------------------------------------------------------------------- |
| `number`         | Analysis  | Yes      | GitHub issue number                                                        |
| `decision`       | Analysis  | Yes      | Recommended action (e.g., `close:stale`, `label:triage:accepted:needs-pr`) |
| `confidence`     | Analysis  | Yes      | `HIGH`, `MEDIUM`, or `LOW`                                                 |
| `analyzedAt`     | Analysis  | Yes      | When the issue was analyzed                                                |
| `issueUpdatedAt` | Analysis  | Yes      | GitHub `updatedAt` at analysis time — used for change detection            |
| `executedAt`     | Execution | No       | When the decision was acted on (comment/label/close)                       |
| `outcome`        | Execution | No       | What was actually done — may differ from `decision` on reviewer override   |
| `note`           | Execution | No       | Rationale when outcome diverges from recommendation                        |

## Example

```json
{
  "version": 1,
  "lastRun": "2026-04-01T15:00:00-03:00",
  "issues": {
    "1234": {
      "number": 1234,
      "decision": "close:stale",
      "confidence": "HIGH",
      "analyzedAt": "2026-04-01T12:00:00-03:00",
      "issueUpdatedAt": "2024-02-01T00:00:00Z",
      "executedAt": "2026-04-02T10:00:00-03:00",
      "outcome": "close:completed"
    },
    "5678": {
      "number": 5678,
      "decision": "label:triage:accepted:needs-pr",
      "confidence": "HIGH",
      "analyzedAt": "2026-04-01T12:00:00-03:00",
      "issueUpdatedAt": "2025-01-20T08:41:07Z",
      "executedAt": "2026-04-02T10:00:00-03:00",
      "outcome": "label:triage:deciding:needs-info",
      "note": "Upstream README uses nodes/pods not nodes/proxy — needs clarification before accepting"
    }
  }
}
```

## Lifecycle

1. **Analysis phase** sets: `number`, `decision`, `confidence`, `analyzedAt`,
   `issueUpdatedAt`
2. **Execution phase** (human-driven) adds: `executedAt`, `outcome`, and
   optionally `note` when the reviewer overrides the recommendation
3. Issues with `outcome: "skipped"` remain candidates for future triage runs

## State logic on subsequent runs

- **Skip**: `issueUpdatedAt` matches current GitHub `updatedAt` AND `outcome` is
  set (already triaged and executed)
- **Re-analyze**: GitHub `updatedAt` > stored `issueUpdatedAt` (new activity)
- **Pending execution**: `decision` is set but `outcome` is absent — surface
  these to the reviewer as "awaiting action" instead of re-analyzing
- **Analyze as new**: issue number not in state
