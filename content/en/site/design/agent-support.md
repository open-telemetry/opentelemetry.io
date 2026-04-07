---
title: Agent support
description: >-
  Design notes for making OpenTelemetry website content easier for agents to
  consume.
weight: 10
---

Design notes for the broader [agent-friendly content delivery](/site/features/)
feature.

## Markdown content negotiation

Use a Netlify Edge Function to serve Hugo's prebuilt `index.md` output when a
request explicitly asks for `text/markdown`.

### Rationale

- Not every HTML page should have a Markdown equivalent.
- HTTP negotiation belongs at the delivery layer.
- The function can fall back to normal HTML when no Markdown artifact exists.

### Rules

- Only `GET` and `HEAD` are considered.
- Requests for `.md` and other non-page resources bypass negotiation.
- Pretty URLs map to Hugo's `.../index.md` output.
- Markdown is served only when `text/markdown` is explicitly accepted and HTML
  is not preferred more strongly via `q`.
- Missing Markdown falls back to the normal HTML response.
- Negotiated responses set `Vary: Accept`.
- `/search/` emits only HTML and therefore always falls back to HTML.

### Related implementation

- `config/_default/hugo.yaml` defines the Markdown output format.
- `content/en/search.md` opts the search page out with `outputs: [HTML]`.
- `netlify.toml` wires the Edge Function ahead of other route handling.
- `netlify/edge-functions/markdown-negotiation.ts` implements the request
  handling logic.
