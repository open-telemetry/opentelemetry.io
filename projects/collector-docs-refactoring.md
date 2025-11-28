# Collector Documentation Refactoring

## Background and description

The OpenTelemetry Collector is a critical component of the OpenTelemetry
ecosystem, serving as a vendor-agnostic way to receive, process, and export
telemetry data. The Collector documentation on
[opentelemetry.io](https://opentelemetry.io/docs/collector/) is currently
undergoing a significant refactoring effort to improve organization, clarity,
and completeness.

This project coordinates the ongoing refactoring of Collector documentation,
which is being tracked through the `sig:collector:refactor` label and organized
into multiple phases.

**Note**: This project is already underway with active issues and a milestone.
This document serves to formalize the project scope and track progress within
the community projects framework.

### Current challenges

The current Collector documentation has several issues being addressed:

- **Information architecture needs improvement**: Pages are not organized
  optimally for different user journeys (installation, deployment,
  configuration, extension).
- **Large monolithic pages**: Some pages (like installation) need to be split
  into focused child pages.
- **Inconsistent examples**: Examples sometimes use core vs. contrib
  inconsistently.
- **Missing operational guidance**: Best practices, troubleshooting, and
  disaster recovery documentation is incomplete.
- **Copy editing needed**: Many pages need style guide compliance, grammar
  fixes, and clarity improvements.
- **Cross-reference maintenance**: Page renames require updating
  cross-references throughout the documentation.

**Current structure verified in repository (`content/en/docs/collector/`):**

```
collector/
├── _index.md              # Landing page
├── architecture.md        # Architecture overview
├── benchmarks.md          # Performance benchmarks
├── building/              # ✅ Custom collector building
│   ├── _index.md
│   ├── authenticator-extension.md
│   ├── connector/
│   └── receiver.md
├── components/            # ✅ Component documentation
│   ├── connector.md
│   ├── exporter.md
│   ├── extension.md
│   ├── processor.md
│   └── receiver.md
├── configuration.md       # Configuration reference
├── custom-collector.md    # Custom collector guide
├── deployment/            # ✅ Deployment patterns
│   ├── _index.md
│   ├── agent.md
│   ├── gateway/
│   └── no-collector.md
├── distributions.md       # Distribution information
├── installation.md        # Installation (needs splitting)
├── internal-telemetry.md  # Internal metrics
├── management.md          # OpAMP management
├── quick-start.md         # Quick start guide
├── resiliency.md          # Resiliency features
├── scaling.md             # Scaling guide
├── transforming-telemetry.md
└── troubleshooting.md     # Troubleshooting guide
```

**Progress on refactoring:**

- ✅ `building/` section exists with custom component guides
- ✅ `deployment/` section has agent, gateway, no-collector patterns
- ✅ `components/` section documents all component types
- ⚠️ `installation.md` still monolithic (issue #8353)
- ⚠️ Troubleshooting exists but needs expansion

### Goals, objectives, and requirements

The goal of this project is to:

1. **Restructure information architecture**: Create a logical hierarchy
   (Install, Deploy, Extend sections).
2. **Split large pages**: Break monolithic pages into focused, scannable
   content.
3. **Standardize examples**: Ensure consistent use of Collector distributions in
   examples.
4. **Add operational content**: Include best practices, troubleshooting, and
   scaling documentation.
5. **Copy edit all pages**: Ensure style guide compliance and clear writing.
6. **Maintain cross-references**: Update all links when pages are renamed or
   moved.

## Deliverables

### Phase 1 (otelcol-phase-1) - Current

Focus on moving existing content to conform to the new information architecture:

- Rename and split Collector installation page.
- Rename Collector deployment pages and create new child pages.
- Create new "Extend the Collector" section.
- Copy edit installation, deployment, and extension pages.
- Update cross-references throughout documentation.

### Phase 2 (otelcol-phase-2)

Focus on writing and editing content (details TBD based on Phase 1 completion).

### Phase 3 (otelcol-phase-3)

Gap analysis of the new documentation set:

- Audit documentation for missing or incorrect content.
- Identify which examples to add first.
- Use AI, user interviews, and community feedback for analysis.
- Address disaster recovery recommendations.
- Follow up on deployment documentation improvements.

## Timeline

- **Phase 1**: Due December 31, 2025.
- **Phase 2**: TBD.
- **Phase 3**: Due March 20, 2026.

## Labels

- `sig:collector`
- `sig:collector:refactor`
- `docs:information-architecture`
- `help wanted`
- `good first issue` (for some tasks)

## Related issues

### Phase 1 issues (otelcol-phase-1 milestone)

- [#8353 - Rename and split up Collector installation page](https://github.com/open-telemetry/opentelemetry.io/issues/8353)
  (open)
- [#8354 - Copy edit the Collector installation page](https://github.com/open-telemetry/opentelemetry.io/issues/8354)
  (open)
- [#8355 - Rename Collector deployment pages and create new child pages](https://github.com/open-telemetry/opentelemetry.io/issues/8355)
  (open)
- [#8356 - Copy edit the Collector deployment landing, no collector, and agent pages](https://github.com/open-telemetry/opentelemetry.io/issues/8356)
  (closed)
- [#8358 - Copy edit the Collector deployment gateway page](https://github.com/open-telemetry/opentelemetry.io/issues/8358)
  (closed)
- [#8360 - Create new "Extend the Collector" section and rename child pages](https://github.com/open-telemetry/opentelemetry.io/issues/8360)
  (open)
- [#8361 - Copy edit the Building a custom Collector page](https://github.com/open-telemetry/opentelemetry.io/issues/8361)
  (open)
- [#8362 - Copy edit the custom component pages](https://github.com/open-telemetry/opentelemetry.io/issues/8362)
  (open)

### Phase 3 issues (otelcol-phase-3 milestone)

- [#5932 - Disaster recovery recommendations for Daemonset deployments](https://github.com/open-telemetry/opentelemetry.io/issues/5932)
  (open)
- [#2692 - Follow up on collector deployment](https://github.com/open-telemetry/opentelemetry.io/issues/2692)
  (open)

### Other related issues

- [#7268 - Add example for validating internal telemetry connection](https://github.com/open-telemetry/opentelemetry.io/issues/7268)
  (open)
- [#3699 - Benchmarks page clarity](https://github.com/open-telemetry/opentelemetry.io/issues/3699)
  (open)

## Project Board

The project is tracked via GitHub milestones:

- [otelcol-phase-1](https://github.com/open-telemetry/opentelemetry.io/milestone/20)
- [otelcol-phase-3](https://github.com/open-telemetry/opentelemetry.io/milestone/22)

## SIG Meetings and Other Info

This project is coordinated through SIG Communications and SIG Collector
meetings.

- **Slack channel**: `#otel-comms`
- **Meeting notes**: To be linked upon project start.
