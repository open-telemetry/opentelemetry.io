---
title: Blog publish labels
linkTitle: Blog publish labels
description: >-
  Daily scheduled workflow that applies ready-to-be-merged labels to blog PRs
  whose publish date has arrived and sends Slack notifications.
weight: 200
---

The [`blog-publish-labels.yml`][blog] workflow runs daily at 7 AM UTC. It
executes [`blog-publish-check.sh`][batch-script], which iterates over all open
PRs with `blog` label and calls `pr-approval-labels.sh` for each one. When
`ready-to-be-merged` is newly applied to any of them, a Slack notification is
posted. You can also trigger it manually via `workflow_dispatch` with the
`force_notify` input to send a test Slack notification. When `force_notify` is
`true`, the labeling step is skipped entirely (dry run) — only the test Slack
payload is sent.

| Workflow file                     | Trigger                                                                           | Secrets required                                |
| --------------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------- |
| [`blog-publish-labels.yml`][blog] | `schedule` (daily 7 AM UTC), `workflow_dispatch` (manual test via `force_notify`) | `OTELBOT_DOCS_PRIVATE_KEY`, `SLACK_WEBHOOK_URL` |

The Slack notification fires only when the label transitions from absent to
present on that run — repeated daily runs for an already-labeled PR do not
re-notify. When triggering the workflow manually, set `force_notify` to `true`
to send a one-off test notification (no labels are applied) so you can verify
the Slack formatting.

## Slack webhook setup {#slack-webhook-setup}

The workflow uses a **Slack Workflow Builder webhook trigger**, which allows
non-engineers to own the message format without touching workflow code.

**Create the webhook:**

1. In Slack: **Tools → Workflow Builder → New Workflow → Start from scratch**
2. Choose trigger: **Webhook**
3. Declare one variable — name: `pr_list`, type: **Text**
4. Add a step: **Send a message** to the desired channel, with body:

   ```text
   :newspaper: *Blog posts ready to publish*

   The following PRs have reached their publish date and all required
   approvals — they are ready to be merged:

   {{pr_list}}

   Have a great day! :sunny:
   ```

   Then click **Add button** and configure:
   - **Label**: `Review and merge`
   - **Color**: Primary (green)
   - **Action**: Open a link
   - **URL**:
     `https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Apr+state%3Aopen+label%3Ablog+label%3Aready-to-be-merged`

5. **Publish** the workflow and copy the webhook URL
6. Add it to the repository: **Settings → Secrets and variables → Actions → New
   repository secret**, name: `SLACK_WEBHOOK_URL`

**Payload sent by the workflow:**

```json
{
  "pr_list": "• #123: Add blog post: OTel 1.0 — https://github.com/.../pull/123\n• #456: Announce: new SIG — https://github.com/.../pull/456"
}
```

Each PR is a bulleted line with its title and URL. Slack auto-links bare URLs.
Multiple PRs labeled on the same day are batched into a single message — one
webhook call regardless of how many PRs are ready.

```mermaid
sequenceDiagram
    participant GH as GitHub
    participant W as blog-publish-labels
    participant B as blog-publish-check.sh
    participant L as pr-approval-labels.sh
    participant S as Slack

    Note over GH: schedule event (daily, 7 AM UTC)

    GH->>W: Trigger (base repository context, with secrets)
    W->>B: Run blog-publish-check.sh
    B->>GH: Query open PRs with PUBLISH_DATE_LABELS labels
    GH-->>B: List of PRs
    loop Each PR
        B->>L: Run pr-approval-labels.sh (PR=number)
        L->>GH: Add/remove labels
    end
    alt Any PR newly labeled ready-to-be-merged
        W->>S: POST Slack notification with PR links
    end
```

[blog]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/blog-publish-labels.yml
[batch-script]:
  https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/blog-publish-check.sh
