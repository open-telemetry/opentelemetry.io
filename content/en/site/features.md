---
title: Features
description: >-
  Brief summaries of notable site features with links to their primary
  references.
weight: 20
---

## Agent-friendly content delivery

Make site content easier for agents to discover and consume. Current work adds
Markdown output for content pages and HTTP negotiation for
`Accept: text/markdown`.

- Status: in progress
- Design: [Agent support](../design/agent-support/)
- Implementation: under `netlify/edge-functions/markdown-negotiation.ts` with
  folder for logic and tests.
- References:
  [opentelemetry.io#9449](https://github.com/open-telemetry/opentelemetry.io/issues/9449),
  [docsy#2596](https://github.com/google/docsy/issues/2596)
