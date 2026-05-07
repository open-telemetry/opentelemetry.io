# Comment Templates {#comment-templates}

**When to read:** when you need fallback comment text for a suggested action and
no repo profile defines its own templates. Prefer
`PROFILE.repo.comment_templates` (e.g., the `opentelemetry-website` profile)
whenever one is loaded.

Comment templates come from `PROFILE.repo.comment_templates` when a repo profile
is active. The built-in `opentelemetry-website` profile provides templates for
`stale`, `needs_info`, `duplicate`, `accepted`, and `good_first_issue`.

When no repo profile is active, use generic variants:

**Stale:**

```text
This issue has had no activity for {N} months. Closing as stale. If still
relevant, please reopen with updated details.
```

**Needs info:**

```text
Thank you for filing this issue. Could you provide more details?
- {specific missing info}

We'll revisit once more details are available.
```

**Duplicate:**

```text
This appears to be a duplicate of #{duplicate_number}. Please check that
issue for updates. If your case is different, please reopen.
```

**Accepted:**

```text
This issue has been triaged and accepted. It's ready for a contributor to
pick up.
```

**Good first issue:**

```text
This issue has been triaged as a good first issue for new contributors.
```
