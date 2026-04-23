# Content Review & Checklist {#content-review}

**When to read:** during PR Review Workflow step 5 (Review content). Use the top
section for what to look for in docs PRs; use the checklist at the bottom as a
final pass before writing the review output.

For blog PRs (`content/en/blog/**`), defer to the `review-blog-post` skill — it
covers frontmatter, multi-author format, `gh-url-hash`, publish-date gating, and
cross-posting.

## Docs content review

For docs PRs (`content/en/docs/**`), check:

- **Frontmatter.** Valid YAML, appropriate `title`, `linkTitle`, `weight`,
  `description`. Hugo-specific fields intact.
- **Terminology.** "OpenTelemetry" one word; "OTel" only after first full
  mention; signal names lowercase (`traces`, `metrics`, `logs`); component names
  cased (`SDK`, `API`, `Collector`); proper nouns cased. Enforced by `textlint`
  via `.textlintrc.yml` (`style-guide.md:42-60`).
- **Link references.** Prefer collapsed form `[text][]` over shortcut `[text]`;
  enforced by the custom `no-shortcut-ref-link` rule in `scripts/_md-rules/`
  (`style-guide.md:103-125`).
- **Markdown extensions.** GitHub alerts and Obsidian callouts are OK
  (`style-guide.md:76-101`).
- **Alt text on images.**
- **Hugo `ref` / `relref`** for internal cross-links, or plain paths
  (`/docs/...`) — not full `https://opentelemetry.io` URLs.
- **Code blocks** have a language tag.

## Final review checklist {#pr-review-checklist}

### CI and process

- [ ] `Easy CLA` green (or author has a fix path)
- [ ] Netlify preview builds
- [ ] Each failing `check-*` check assessed against the table in
      [`ci-checks.md`](./ci-checks.md)
- [ ] Linked issue is `triage:accepted` (or this is an auto/hotfix PR)
- [ ] Does not span multiple locales with semantic changes — or uses `# patched`
      for editorial cross-locale edits
- [ ] First-time contributor AI checklist in PR description is filled in and
      looks human-written
- [ ] No unrelated changes bundled

### Labels

- [ ] Auto-applied labels look correct (sig/lang/blog/registry/i18n); none added
      by hand
- [ ] `ready-to-be-merged` / `missing:*` not touched manually
- [ ] `sig-approval-missing` added if docs approval landed without SIG approval
      on a co-owned PR

### Content

- [ ] Frontmatter valid and complete
- [ ] Terminology consistent with style guide
- [ ] Code blocks have language tags
- [ ] Images have alt text
- [ ] Internal links use `/docs/...` paths or Hugo `ref`/`relref`; no full
      `opentelemetry.io` URLs
- [ ] No shortcut-form reference links

### Refcache and links

- [ ] `refcache.json` updates (if any) committed in the PR
- [ ] No hand-edits to `refcache.json`
- [ ] Unreachable-but-valid URLs use `?link-check=no`

### Blog PRs

- [ ] Deferred to `review-blog-post` skill
