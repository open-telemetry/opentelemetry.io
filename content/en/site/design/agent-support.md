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
request explicitly asks for or prefers `text/markdown`.

### Rationale

- Not every HTML page should have a Markdown equivalent.
- HTTP negotiation belongs at the delivery layer.
- The function can fall back to normal HTML when no Markdown artifact exists.

### Rules

- Only `GET` and `HEAD` are considered.
- Requests for `.md` and other non-page resources bypass negotiation.
- Page-like requests include:
  - slash paths
  - extensionless paths
  - `.../index.html` paths
- Markdown is served when `text/markdown` is accepted with `q` greater than zero
  and its `q` is **greater than or equal to** the highest `q` for `text/html` /
  `application/xhtml+xml` (equal weights choose Markdown).
- Missing Markdown falls back to the normal HTML response.
- Negotiated responses set `Vary: Accept`.
- `/search/` emits only HTML and therefore always falls back to HTML.

A note on path mapping:

- Pretty URLs like `/docs/` map to Hugo's `/docs/index.md` output;
- `index.html` maps to the sibling `.md` file (for example `/docs/index.html` →
  `/docs/index.md`).
- Other `.html` paths are left to Netlify's normal redirects and routing: e.g.,
  Netlify redirects `/docs.html` to `/docs/`.

### Related implementation

- `config/_default/hugo.yaml` defines the Markdown output format.
- `content/en/search.md` opts the search page out with `outputs: [HTML]`.
- `netlify.toml` wires the Edge Function ahead of other route handling.
- `netlify/edge-functions/markdown-negotiation/index.ts` implements negotiation;
  `netlify/edge-functions/markdown-negotiation.ts` is the Netlify entry stub
  that re-exports it.
