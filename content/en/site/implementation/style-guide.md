---
title: Style guide
description: Code-level style conventions for Hugo templates
---

This page records code-level style conventions for the OpenTelemetry website,
currently covering Hugo templates. For prose and Markdown _content_ style, see
the [Documentation style guide](/docs/contributing/style-guide/) instead.

## Hugo templates

### Indentation

For code readability, use proper indentation for nested code blocks, including
inside `{{ if }}`, `{{ range }}`, and `{{ with }}` actions.

### Whitespace control

Use Hugo's [whitespace control][] trim markers, `{{- ... }}` and `{{ ... -}}`,
to keep generated output free of unnecessary blank lines and indentation, while
keeping the template source readable.

- **Default to right-trim only.** Write `{{ ... -}}`, which is generally enough
  to keep generated output tidy.
- Use a **left trim** (`{{- ... }}`) or a **double-sided trim** (`{{- ... -}}`)
  only when justified, for example to collapse surrounding blank lines.
- **Inline outputs inside markup** take no trim. For example, an action that
  emits an attribute value, such as `class="{{ $class }}"`, needs no trim
  markers.

### Newlines in `range` blocks

Inside `range` blocks, consider using `{{ "\n" -}}` or `{{- "\n" -}}` to control
newlines between iterations, while avoiding leading and trailing blank lines in
the generated output.

[whitespace control]: https://gohugo.io/templates/introduction/#whitespace
