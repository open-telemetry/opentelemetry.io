---
title: Semantic Conventions
description: >-
  OpenTelemetry semantic conventions: the core set and the GenAI set.
cSpell:ignore: genai
# Redirects for pages that moved to GenAI when the semantic conventions were
# split into the Core and GenAI sets. The catch-all redirect for pre-split core
# paths is in layouts/index.redirects, so that it comes after all page
# redirects.
redirects:
  # Moved to GenAI
  - { from: gen-ai/*, to: genai/gen-ai/:splat }
  - from: registry/attributes/gen-ai
    to: genai/registry/attributes/gen-ai/
  - from: registry/attributes/mcp
    to: genai/registry/attributes/mcp/
  - from: registry/attributes/openai
    to: genai/registry/attributes/openai/
  # Pre-split core pages
  - from: resource/deployment_environment
    to: core/resource/deployment-environment/
---

OpenTelemetry semantic conventions are published as separate sets, each with its
own repository, release cycle, and version:

- [Core](core/): conventions for common operations and domains, such as HTTP,
  databases, messaging, and resources. Source:
  [open-telemetry/semantic-conventions](https://github.com/open-telemetry/semantic-conventions).
- [GenAI](genai/): conventions for generative AI and Model Context Protocol
  (MCP) operations. Source:
  [open-telemetry/semantic-conventions-genai](https://github.com/open-telemetry/semantic-conventions-genai).
