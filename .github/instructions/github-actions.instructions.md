---
applyTo: '.github/**'
---

## GitHub Actions Best Practices

When working with GitHub Actions in this repository:

- **Always pin actions to full semver tags** (e.g., `@v6.0.2`), not major-only
  tags (e.g., `@v6`) or commit SHAs
- **Verify the version exists** before using — check the action's repository
  releases page to ensure the tag is published
- **Never generate or guess versions** — always look up the correct version from
  the action's repository
- **Format**: `uses: owner/action@vX.Y.Z`

Example:

```yaml
- uses: actions/checkout@v6.0.2
```
