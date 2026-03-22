# Skill: `new-page-scaffold`

Scaffold a new documentation page with correct frontmatter and directory structure for `opentelemetry.io`.

## Parameters

- `title`: The title of the page.
- `description`: A brief description for SEO and site search.
- `path`: The target path relative to `content/en/docs/`.

## Steps

1.  **Validate path**: Ensure the target directory exists under `content/en/docs/`.
2.  **Determine filename**: Use kebab-case for the filename. If it's a section landing page, use `_index.md`.
3.  **Generate frontmatter**:
    ```yaml
    ---
    title: <title>
    description: <description>
    weight: <calculated-weight>
    ---
    ```
4.  **Calculate weight**: Check existing files in the directory to determine the next logical `weight` (increment by 10 or 5).
5.  **Create file**: Write the scaffolding to the calculated path.
6.  **Verify**: Run `npm run check:markdown` on the new file.
