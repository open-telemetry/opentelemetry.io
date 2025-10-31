---
applyTo:
  - "content/*/**",
  - "!content/en/**"
---

# OpenTelemetry.io Localization Instructions

Always reference these instructions first and fallback to search or bash
commands only when you encounter unexpected information that does not match the
info here.

## Working with Localization

### Environment Setup

- Follow the main development setup in `.github/copilot-instructions.md`
- Install Node.js 22.x and run `npm install` with `PUPPETEER_SKIP_DOWNLOAD=true`
- Ensure all submodules are initialized: `npm run get:submodule`

### Translation Guidelines

**✅ DO Translate:**

- Page content including mermaid diagram text fields
- Code comments from code excerpts (optional)
- Front matter fields: `title`, `linkTitle`, and `description`
- All page content and front matter unless indicated otherwise
- Text in Mermaid diagrams
- Page fragments under `_includes` directories

**❌ DO NOT Translate:**

- File or directory names of resources
- Links (internal or external paths)
- Heading IDs marked with `{#some-id}` syntax
- Inline code spans like `inline code example`
- Markdown elements marked as `notranslate`
- Front matter fields other than `title`, `linkTitle`, `description`
- Code blocks
- Image file names (unless localizing text within images)

### Key Localization Commands

**Check Drift Status:**

```bash
npm run check:i18n                    # Check all localizations for drift
npm run check:i18n -- content/zh      # Check specific localization
npm run check:i18n -- -d content/zh   # Show detailed diff for drift
```

**Update Localization Tracking:**

```bash
npm run check:i18n -- -n -c HEAD content/zh        # Add default_lang_commit to new pages
npm run check:i18n -- -c <hash> content/zh         # Update existing pages commit hash
npm run fix:i18n:status                            # Add drift markers to drifted pages
```

**Validation for Localized Content:**

```bash
npm run check:spelling                # Spell check (configure cSpell for your language)
npm run check:format                  # Format check (may need Prettier ignore rules)
npm run check:markdown                # Markdown validation
npm run build && npm run serve        # Test localized site
```

### Directory Structure for Localizations

```
content/
├── en/           # English (default)
├── ja/           # Japanese
├── zh/           # Chinese
├── es/           # Spanish
├── fr/           # French
├── pt/           # Portuguese
├── bn/           # Bengali
├── ro/           # Romanian
└── uk/           # Ukrainian
```

### Required Front Matter for Localized Pages

```yaml
---
title: Your localized page title
linkTitle: Short title (if different)
description: Localized page description
# CRITICAL: Track the English page version this translation is based on
default_lang_commit: <commit-hash-of-english-page>
---
```

### Working with Links and Heading IDs

**Heading ID Preservation:**

- Keep explicit IDs: `## My Heading {#my-heading}`
- Add IDs for translated headings to match English auto-generated IDs
- This ensures anchor links work consistently across languages

**Link Handling:**

- Keep all internal links unchanged (Hugo automatically prefixes with language
  code)
- External links: Only change `en` to your language code for localized versions
- Example: `https://en.wikipedia.org/wiki/Example` →
  `https://ja.wikipedia.org/wiki/Example`

### Shortcodes and Includes

**Custom Shortcodes for Localization:**

- Place localized shortcodes in `layouts/_shortcodes/xx/` (where xx = language
  code)
- Use same relative path as original English shortcode
- Translate shortcode content while preserving functionality

### Drift Management

**Understanding Drift:**

- Drift occurs when English pages are updated after localization
- Use `default_lang_commit` to track which English version was translated
- Check drift regularly with `npm run check:i18n`

**Handling Drifted Content:**

1. Review changes: `npm run check:i18n -- -d content/xx/path/to/page`
2. Update your localized page to match new English content
3. Update `default_lang_commit` to latest hash:
   `npm run check:i18n -- -c HEAD content/xx/path/to/page`

**Targeted Updates (Advanced):**

- For small additions to drifted files, you can make targeted updates
- Add `# patched` comment to `default_lang_commit` line in front matter
- Document rationale in PR description
- Example use cases: Adding new glossary terms, fixing broken links

### Starting New Localizations

**Requirements:**

- Localization mentor (familiar with your language)
- At least 2 potential contributors
- ISO 639-1 language code for your language

**Process:**

1. Create issue with localization request
2. Translate homepage only: `content/LANG_ID/_index.md`
3. Maintainers will update Hugo config, cSpell configuration, and create
   language-specific tools

### Language-Specific Tooling

**Spell Checking:**

- Language dictionaries: Look for `@cspell/dict-LANG_ID` packages
- Site-local dictionary: `.cspell/LANG_ID-words.txt`
- Configure in `.cspell.yml` under `import`, `dictionaryDefinitions`, and
  `dictionaries`

**Formatting:**

- Some languages may need Prettier ignore rules in `.prettierignore`
- Test formatting: `npm run check:format`

### Validation Workflow for Localization

**Before Submitting:**

1. `npm run check:i18n -- content/xx` - Verify no unexpected drift
2. `npm run check:format` - Ensure proper formatting
3. `npm run check:spelling` - Validate spelling (if language dictionary
   available)
4. `npm run build` - Test build with your changes
5. `npm run serve` - Verify rendered site looks correct

**Testing Localized Changes:**

- Navigate to `http://localhost:1313/xx/` (replace xx with your language code)
- Test language switcher in navigation
- Verify all translated content renders correctly
- Check that links work properly (internal and external)

### Common Localization Tasks

**Translating Blog Posts:**

- Create in `content/xx/blog/YYYY/post-name.md`
- Preserve original publication date and author information
- Add `default_lang_commit` referencing original English post

**Translating Documentation:**

- Follow English structure: `content/xx/docs/section/page.md`
- Maintain navigation hierarchy
- Preserve code examples (translate comments only)
- Keep technical terms consistent within language

**Registry and Data Files:**

- Registry entries in `data/registry/*.yml` are shared across languages
- Do not create language-specific registry files
- Contribute translations through the original projects

### PR Guidelines for Localization

**Single-Language PRs:**

- Semantic changes should affect only one language per PR
- Exception: Pure editorial changes (link fixes, resource updates) can span
  locales

**PR Description Requirements:**

- Specify which pages were translated/updated
- Note any drift status changes
- Document any targeted updates to drifted files
- Include screenshots for UI-affecting changes

### Maintenance Commands

**Regular Maintenance:**

```bash
# Check all localizations for drift
npm run check:i18n

# Update drift status markers
npm run fix:i18n:status

# Batch update commit hashes after updating multiple files
npm run check:i18n -- -c HEAD content/xx/

# Help and options
npm run check:i18n -- -h
```

**Time Expectations:**

- Localization checks: ~5-10 seconds
- Build with multiple languages: ~2-3 minutes
- Full drift analysis: ~15-30 seconds depending on content volume

**Critical Notes:**

- Always preserve the meaning and style of original English content
- Ask maintainers via Slack (#otel-docs-localization) or GitHub discussions when
  in doubt
- Use `default_lang_commit` consistently to enable proper drift tracking
- Test localized changes in both your target language and English for comparison
