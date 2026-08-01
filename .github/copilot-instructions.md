# OpenTelemetry.io Website Development Instructions

Always reference these instructions first and fallback to search or bash
commands only when you encounter unexpected information that does not match the
info here.

## Working Effectively

### Bootstrap, Build, and Test the Repository

**Environment Setup:**

- Install Node.js LTS (currently v22.x): Use `nvm install` or
  `nvm install lts && nvm use lts`
- If Puppeteer download fails due to network issues: Set
  `export PUPPETEER_SKIP_DOWNLOAD=true`
- Clone repository:
  `git clone https://github.com/open-telemetry/opentelemetry.io.git && cd opentelemetry.io`

**Initial Setup and Dependencies:**

- `npm install` -- takes ~45 seconds. NEVER CANCEL. Set timeout to 2+ minutes.
- Initial setup automatically runs: `npm run prepare` which executes
  `get:submodule` and `_prepare:docsy`
- Submodules are essential - they contain OpenTelemetry specifications,
  community docs, and theme components

**Build Commands:**

- `npm run build` -- takes ~1.5 minutes. NEVER CANCEL. Set timeout to 3+
  minutes.
- `npm run build:production` -- production build with minification, same timing
- Build generates content in `public/` directory despite warnings about external
  CDN resources
- CDN warnings (mermaid, etc.) are expected in restricted network environments
  and do not prevent successful builds

**Testing and Validation:**

- `npm run check` -- runs ALL validation checks, takes ~2 minutes. NEVER CANCEL.
  Set timeout to 4+ minutes.
- `npm run check:spelling` -- ~5 seconds, validates content spelling
- `npm run check:format` -- ~25 seconds, validates Prettier formatting
- `npm run check:markdown` -- ~10 seconds, validates markdown syntax
- `npm run check:registry` -- ~1 second, validates registry YAML files

### Development Server

**Serve the Site Locally:**

- `npm run serve` -- starts Hugo development server at http://localhost:1313
- Takes ~1.5 minutes initial build, then serves from memory with live reload
- Alternative: `npm run serve:netlify` -- serves at http://localhost:8888 for
  testing Netlify redirects
- NEVER CANCEL serve startup. Set timeout to 3+ minutes for initial build.

### Critical Warnings and Known Issues

**Network-Related Build Warnings (EXPECTED):**

- Mermaid CDN errors: `Could not retrieve mermaid script from CDN` - build
  continues successfully
- Semantic conventions link warnings: Multiple warnings about
  `/docs/specs/semconv/gen-ai/` references - these are tracked in
  `.warnings-skip-list.txt`
- These warnings do NOT prevent successful builds or deployments

**Submodule Management:**

- Content lives in `content-modules/` submodules: `community`,
  `opentelemetry-specification`, `semantic-conventions`, etc.
- Always run `npm run get:submodule` or use `GET=no` environment variable to
  skip if working within submodules
- Changes to submodules require separate PRs to their respective repositories
  first

## Validation

**Pre-commit Validation (REQUIRED):**

- Always run `npm run fix:format` to format code
- Always run `npm run check:spelling` and fix any issues
- Always run `npm run check:markdown` to validate markdown syntax
- CI will fail without proper formatting and validation

**Manual Testing Scenarios:**

- Always build and serve the site locally after making changes:
  `npm run build && npm run serve`
- Navigate to key pages: homepage, docs sections, blog, ecosystem/registry
- Test search functionality if modifying search-related components
- Verify multi-language support if editing translated content

**Environment Variables for Development:**

- `PUPPETEER_SKIP_DOWNLOAD=true` - Skip Puppeteer download in restricted
  networks
- `GET=no` - Skip submodule updates when working directly in submodules
- `PIN_SKIP=content-modules` - Skip pinning specific submodules during
  development

## Common Tasks

### Repository Structure

```
.
├── README.md             # Project overview and contribution guidelines
├── package.json          # Node.js dependencies and npm scripts
├── config/**/*.yaml      # Hugo configuration with mounts and language settings
├── content/              # Main content (English and translations)
├── content-modules/      # Git submodules for specifications and community docs
├── layouts/              # Hugo templates and partial templates
├── static/               # Static assets (images, CSS, JS)
├── themes/docsy/         # Docsy theme submodule
├── scripts/              # Build and validation helper scripts
├── gulp-src/             # Gulp task definitions for validation
├── data/                 # YAML data files (registry, etc.)
└── public/               # Generated site output (git-ignored)
```

### Key Scripts and Their Purpose

```bash
# Setup and dependencies
npm install               # Install all dependencies (~45s)
npm run prepare          # Get submodules and prepare Docsy theme

# Building
npm run build            # Development build (~1.5min)
npm run build:production # Production build with minification (~1.5min)

# Development server
npm run serve            # Serve at localhost:1313 (~1.5min startup)
npm run serve:netlify    # Serve at localhost:8888 with Netlify config

# Validation and testing
npm run check            # Run ALL validation checks (~2min)
npm run check:spelling   # Spell check content (~5s)
npm run check:format     # Check Prettier formatting (~25s)
npm run check:markdown   # Lint markdown files (~10s)
npm run check:registry   # Validate registry YAML (~1s)

# Fixing issues
npm run fix:format       # Auto-fix formatting issues
npm run fix:spelling     # Interactive spelling fix
npm run fix:markdown     # Auto-fix markdown issues
```

### Working with Content

- Main English content: `content/en/`
- Translated content: `content/ja/`, `content/zh/`, `content/es/`, etc.
- Blog posts: `content/en/blog/YYYY/post-name.md`
- Documentation: `content/en/docs/`
- Registry entries: `data/registry/*.yml`

### Git Submodule Important Notes

- Submodules contain: OpenTelemetry specification, semantic conventions,
  community docs, examples
- Changes to submodule content require PRs to the source repositories first
- Use `npm run update:submodule` to update all submodules to latest
- Set `GET=no` when working directly within submodules to prevent updates

### Hugo-Specific Details

- Uses Hugo v0.148.2 with extended features
- Theme: Docsy (Google's documentation theme)
- Multilingual support enabled for 8+ languages
- Content mounting from submodules defined in
  `config/_default/module-template.yaml`
- Generated files placed in `public/` directory

### Frequently Accessed Files

- `package.json` - Dependencies and scripts
- `config/_default/*.yaml` - Site configuration and content mounts
- `content/en/docs/contributing/development.md` - Development setup guide
- `.warnings-skip-list.txt` - Known acceptable build warnings
- `.cspell.yml` - Spell checking configuration
- `netlify.toml` - Deployment configuration

## Time Expectations and Timeouts

**NEVER CANCEL these commands - use generous timeouts:**

- `npm install`: 2+ minutes (network dependent)
- `npm run build`: 3+ minutes (includes submodule processing)
- `npm run serve`: 3+ minutes (initial build before serving)
- `npm run check`: 4+ minutes (comprehensive validation)

**Quick commands (under 30 seconds):**

- `npm run check:spelling`
- `npm run check:format`
- `npm run check:registry`
- `npm run check:markdown`

**Common Timing Issues:**

- First build after clone: Expect 3-5 minutes due to submodule setup
- Subsequent builds: ~1.5 minutes
- Hugo serves from memory, not disk, so changes reflect immediately after
  initial build
- Network restrictions may cause CDN warnings but do not prevent successful
  builds
