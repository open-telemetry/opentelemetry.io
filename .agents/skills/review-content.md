# Skill: `review-content`

Review `opentelemetry.io` documentation content for compliance with the OTel
style guide and markdown standards.

## Parameters

- `path`: The path to the markdown file to review.

## Steps

1.  **Format and lint check**:
    - Run `npm run check:markdown -- <path>` to verify basic markdown
      formatting.
    - Run `npm run check:text -- <path>` for terminology and textlint rules.
2.  **Style guide alignment**:
    - **Alerts**: Verify alert types use the standard `> [!NOTE]`, `> [!TIP]`,
      `> [!IMPORTANT]`, `> [!WARNING]`, or `> [!CAUTION]` syntax.
    - **Headings**: Ensure each page has exactly one `H1` and that heading
      levels follow a logical hierarchy.
    - **Heading IDs**: Check if headings have explicit IDs (e.g.,
      `## Heading {#id}`) as required by the site's Hugo configuration.
    - **Inclusive language**: Ensure the content follows inclusive language
      principles (e.g., avoiding "master/slave", "whitelist/blacklist").
3.  **Frontmatter validation**:
    - Verify mandatory fields: `title`, `description`.
    - Check for appropriate `weight` if the page is part of a sequence.
4.  **Links and images**:
    - Run `npm run check:links -- <path>` to verify all links are valid.
    - For images, ensure they have descriptive alt text.
5.  **Summarize results**: Provide a clear list of violations and suggested
    fixes.
