# Collector Documentation Sync

Automated synchronization of OpenTelemetry Collector component documentation
from the ecosystem registry to opentelemetry.io.

## Overview

This automation:

1. Clones the
   [opentelemetry-ecosystem-explorer](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer)
   repository to access the collector registry
2. Reads component metadata from `ecosystem-registry/collector/`
3. Generates markdown tables with component information
4. Updates documentation pages in `content/en/docs/collector/components/`
5. Fixes spelling errors in component names
6. Creates/updates pull requests with the changes

## Local Development

### Setup

```bash
# Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install Python dependencies
cd scripts/collector-sync
uv sync
```

### Running Locally

```bash
cd scripts/collector-sync
uv run python -m documentation_sync

# Or with --no-update to skip cloning/updating ecosystem-explorer
uv run python -m documentation_sync --no-update
```

### Testing

```bash
# Run all tests
npm run test:collector-sync

# Or run individually
npm run check:collector-sync        # pytest
npm run check:collector-sync:lint   # ruff linting

# Auto-fix linting issues
npm run fix:collector-sync:lint
```

## Fork Testing

Contributors can test the automation in their forks using
`.github/workflows/collector-sync-fork.yml`.

**To test in a fork:**

1. Push changes to your fork
2. Go to Actions → "Sync Collector component docs (fork)"
3. Click "Run workflow"

The fork workflow uses `GITHUB_TOKEN` instead of the otelbot app token.

## Markers in Documentation

Documentation pages must have marker comments for updates to work:

```markdown
---
title: Receivers
---

## Available receivers

<!-- BEGIN GENERATED: receiver-table SOURCE: scripts/collector-sync -->
<!-- END GENERATED: receiver-table SOURCE: scripts/collector-sync -->
```
