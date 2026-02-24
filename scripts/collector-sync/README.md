# Collector Documentation Sync

Automated synchronization of OpenTelemetry Collector component documentation from the ecosystem registry to opentelemetry.io.

## Overview

This automation:

1. Clones the [opentelemetry-ecosystem-explorer](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer) repository to access the collector registry
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

The script will:

1. **Auto-detect repository root** - Searches upward for `hugo.yaml` and changes to repo root
2. Clone/update `tmp_repos/opentelemetry-ecosystem-explorer`
3. Load component metadata
4. Generate tables
5. Update files in `content/en/docs/collector/components/`
6. Run spell check and fixes
7. Create `metadata-issues.md` if there are quality issues

**Note:** You can run the script from any subdirectory within the repository. It will automatically find the repository root and adjust paths accordingly.

### Testing

```bash
# Run all tests
npm run test:collector-sync

# Or run individually
npm run check:collector-sync        # pytest
npm run check:collector-sync:types  # mypy type checking
npm run check:collector-sync:lint   # ruff linting

# Auto-fix linting issues
npm run fix:collector-sync:lint
```

## CI/CD Workflow

### Scheduled Runs

The automation runs daily at 3:00 AM UTC via GitHub Actions (`.github/workflows/collector-sync.yml`).

**Process:**

1. Checkout opentelemetry.io with full history
2. Install uv and Node.js
3. Run `.github/scripts/collector-sync.sh`:
   - Install Python dependencies
   - Install Node dependencies
   - Run documentation sync
   - Format changes with Prettier
   - Check for file changes
   - Create/update PR if changes detected
4. Create/update metadata quality issue if needed

### Fork Testing

Contributors can test the automation in their forks using `.github/workflows/collector-sync-fork.yml`.

**To test in a fork:**

1. Push changes to your fork
2. Go to Actions → "Sync Collector component docs (fork)"
3. Click "Run workflow"

The fork workflow uses `GITHUB_TOKEN` instead of the otelbot app token.

## File Structure

```
scripts/collector-sync/
├── src/
│   └── documentation_sync/
│       ├── __init__.py
│       ├── __main__.py                     # Entry point
│       ├── main.py                         # Main orchestration
│       ├── explorer_repository_manager.py  # Clones ecosystem-explorer
│       ├── inventory_manager.py            # VENDORED: Loads registry data
│       ├── type_defs.py                    # VENDORED: Type definitions
│       ├── update_docs.py                  # Inventory merging logic
│       ├── doc_content_generator.py        # Markdown table generation
│       ├── doc_marker_updater.py           # File update logic
│       ├── fix_spelling.py                 # Spell check fixes
│       └── metadata_diagnostics.py         # Quality reporting
├── tests/
│   └── documentation_sync/
│       ├── test_*.py
│       └── fixtures/
├── pyproject.toml                          # Python dependencies
├── uv.lock                                 # Locked dependencies
├── .python-version                         # Python 3.11
└── README.md                               # This file
```

## How It Works

### 1. Cloning ecosystem-explorer

`ExplorerRepositoryManager` clones or updates the ecosystem-explorer repository to `tmp_repos/opentelemetry-ecosystem-explorer`.

### 2. Loading Registry Data

`InventoryManager` reads YAML files from:

- `ecosystem-registry/collector/core/vX.Y.Z/*.yaml`
- `ecosystem-registry/collector/contrib/vX.Y.Z/*.yaml`

Each file contains component metadata including:

- Component name and type
- Stability levels per signal (traces/metrics/logs)
- Distributions (core/contrib/k8s)
- Repository information

### 3. Merging Inventories

`update_docs.py` merges core and contrib inventories:

- Components in both distributions show merged distribution lists
- Skips experimental components (x-prefixed)
- Prefers core as source repo when components overlap

### 4. Generating Tables

`DocContentGenerator` creates markdown tables with:

- Component name (linked to GitHub)
- Distributions column (core, contrib, K8s, etc.)
- Stability levels (per signal for receivers/processors/exporters, single for extensions)
- Unmaintained warning emoji (⚠️) for deprecated components

### 5. Updating Documentation

`DocMarkerUpdater` uses HTML comment markers to update content:

```markdown
<!-- BEGIN GENERATED: receiver-table SOURCE: open-telemetry/opentelemetry-ecosystem-explorer -->
[generated table content]
<!-- END GENERATED: receiver-table SOURCE: open-telemetry/opentelemetry-ecosystem-explorer -->
```

### 6. Fixing Spelling

`fix_spelling.py` runs cspell and adds unknown component names to `cSpell:ignore` in file frontmatter.

### 7. Quality Reporting

`MetadataDiagnostics` tracks components with missing/incomplete metadata and generates `metadata-issues.md` for GitHub issue creation.

## Markers in Documentation

Documentation pages must have marker comments for updates to work:

```markdown
---
title: Receivers
---

## Available receivers

<!-- BEGIN GENERATED: receiver-table SOURCE: open-telemetry/opentelemetry-ecosystem-explorer -->
<!-- END GENERATED: receiver-table SOURCE: open-telemetry/opentelemetry-ecosystem-explorer -->
```

## Environment Variables

Used by `.github/scripts/collector-sync.sh`:

- `GH_TOKEN` - GitHub token for PR creation (from otelbot app)
- `BRANCH_OWNER` - Owner where branch is pushed (e.g., "open-telemetry")
- `PR_BASE_OWNER` - Owner of base repo for PRs (e.g., "open-telemetry")
- `GITHUB_REPOSITORY` - Current repository (e.g., "open-telemetry/opentelemetry.io")

## Vendored Code

Two files are vendored from opentelemetry-ecosystem-explorer's collector-watcher:

- `inventory_manager.py` - Manages component inventory storage/retrieval
- `type_defs.py` - Shared type definitions

These are copied to avoid package dependencies and simplify the migration. If the upstream versions change significantly, they should be updated here.

## Troubleshooting

### Sync fails with "No versions found"

The ecosystem-explorer repository may not have been cloned successfully. Check:

1. `tmp_repos/opentelemetry-ecosystem-explorer` exists
2. The directory contains `ecosystem-registry/collector/core/`
3. Version directories exist (e.g., `v0.140.0`)

### Tables not updating

Check that documentation files have the correct markers:

```bash
grep -r "BEGIN GENERATED: receiver-table" content/en/docs/collector/components/
```

### Type errors from mypy

Run mypy locally to see detailed errors:

```bash
cd scripts/collector-sync
uv run mypy src/
```

### Linting errors

Auto-fix most issues:

```bash
npm run fix:collector-sync:lint
```

## Related Resources

- [Ecosystem Explorer Repository](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer)
- [Collector Components Documentation](https://opentelemetry.io/docs/collector/components/)
- [uv Documentation](https://docs.astral.sh/uv/)
