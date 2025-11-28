# Introductory Materials and Conceptual Documentation

## Description

OpenTelemetry's conceptual documentation serves as the foundation for understanding the project. However, the current documentation assumes significant prior knowledge of observability concepts and jumps quickly into technical details without providing adequate context for newcomers.

This project aims to create comprehensive, beginner-friendly conceptual content that helps users understand not just *what* OpenTelemetry is, but *why* it matters and *how* it solves real-world problems.

### Current challenges

The current conceptual documentation has several gaps that create barriers for new users:

- **Assumes too much prior knowledge**: The documentation jumps directly into technical concepts like spans, traces, and exporters without explaining why these concepts exist or what problems they solve.
- **No clear problem-solution narrative**: Users don't get a clear understanding of "what problem does OpenTelemetry solve?" before being presented with technical details.
- **Missing visual explanations**: Complex concepts like distributed tracing, context propagation, and the Collector pipeline lack visual diagrams that would aid comprehension.
- **No progressive learning structure**: There's no clear path from beginner to intermediate to advanced understanding. Users are expected to absorb all concepts at once.
- **Lack of real-world examples**: The documentation doesn't show how OpenTelemetry concepts apply to real-world scenarios that users can relate to.
- **Disconnected from implementation**: Concepts are explained in isolation without clear connections to how users would actually implement them.
- **Missing motivation**: Each concept lacks a "why should I care?" section that explains its practical benefits.
- **Underutilized glossary**: The glossary exists but isn't integrated into the learning flow or referenced contextually.
- **Missing key concepts**: Documentation for Entities, Events, Profiles, and Attributes is missing from the concepts section.
- **Fragmented content**: Concept documentation (e.g., metrics types) is split across concepts, specs, and other sections rather than being consolidated.

**Current state assessment** (verified against repository):

| Page | Status | Actual Content | Issues |
|------|--------|----------------|--------|
| `what-is-opentelemetry.md` | **Better than expected** | 152 lines with video, "Why OpenTelemetry?" section, components list | Could use more visual diagrams, better "what problem does this solve" framing |
| `observability-primer.md` | Good foundation | Explains observability concept | Jumps quickly to technical details |
| `concepts/_index.md` | **Minimal** | Only 2 meaningful lines: "This section covers data sources and key components" | Needs proper introduction and learning path |
| `signals/_index.md` | Reasonable | 35 lines explaining signals concept with links | Good structure but could be more beginner-friendly |
| `instrumentation/_index.md` | Good structure | Proper hierarchy with code-based, zero-code, libraries subsections | Technical but well-organized |
| `context-propagation/` | **Good** | Recently updated with SVG diagram | Can serve as model for other concept pages |
| `sampling/` | **Good** | Dedicated page with diagrams (traces-venn-diagram.svg, tail-sampling-process.svg) | Well-structured with visual aids |
| `resources/` | Good | Has screenshot example | Reasonable coverage |

**Verified missing concepts:**
- **Entities** - No dedicated page in concepts/
- **Events** - Only mentioned in signals/_index.md as "under development"
- **Profiles** - Only mentioned as "being worked on by the Profiling Working Group"
- **Attributes** - No dedicated page (mentioned throughout but no comprehensive guide)

If these challenges are not addressed, new users will continue to struggle with understanding OpenTelemetry, leading to:

- Higher abandonment rates during onboarding.
- Increased support burden on community channels.
- Slower adoption of OpenTelemetry.
- Users making suboptimal implementation decisions due to incomplete understanding.

### Goals, objectives, and requirements

The goal of this project is to create a comprehensive, beginner-friendly conceptual documentation experience that:

1. **Explains the "why" before the "what"**: Each concept should start with the problem it solves.
2. **Provides progressive learning**: Clear pathways from beginner to advanced understanding.
3. **Uses visual explanations**: Diagrams, flowcharts, and illustrations for all major concepts.
4. **Includes real-world examples**: Practical scenarios that demonstrate concepts in action.
5. **Connects concepts to implementation**: Bridge content that shows how concepts translate to code.
6. **Integrates the glossary**: Contextual definitions and cross-references throughout.
7. **Supports multiple learning styles**: Text, visuals, videos, and interactive elements.
8. **Consolidates concept documentation**: Ensure complete concept coverage without requiring users to navigate to specs.

**Motivations for starting now**:

- User feedback consistently indicates that conceptual documentation is a barrier to adoption.
- As OpenTelemetry approaches CNCF graduation, comprehensive documentation is essential.
- New signals (profiles, events) are being added, requiring a scalable conceptual framework.
- Recent improvements to context propagation documentation (PR #8468) show a path forward.

## Deliverables

### Documentation restructure

- Expanded `concepts/_index.md` with a proper introduction and learning path.
- Rewritten "What is OpenTelemetry?" page with deeper content.
- Enhanced observability primer with more context and examples.
- Consolidate concept documentation to avoid fragmentation across specs and concepts.

### New content - Missing concepts

Address the missing concepts identified in [#7280](https://github.com/open-telemetry/opentelemetry.io/issues/7280):

- **Entities** - Documentation explaining the concept of entities in OpenTelemetry.
- **Events** - Documentation explaining the concept of events.
- **Profiles** - Documentation explaining the new profiles signal.
- **Attributes** - Comprehensive documentation on attributes usage and best practices.

### New content - Introductory materials

- **"Why Observability?"** - A new page explaining the business and technical value of observability.
- **"OpenTelemetry for Beginners"** - A comprehensive introduction for users with no prior observability experience.
- **Signal-specific guides**:
  - "Understanding Traces" with visual trace diagrams.
  - "Understanding Metrics" with practical examples and metric types (addressing [#7281](https://github.com/open-telemetry/opentelemetry.io/issues/7281)).
  - "Understanding Logs" with correlation examples.
- **"How OpenTelemetry Works"** - An architectural overview with diagrams.
- **Use case examples**:
  - Debugging a slow API endpoint.
  - Investigating a production incident.
  - Monitoring application performance.
  - Tracking user journeys across services.

### Visual content

- Architectural diagrams for OpenTelemetry components.
- Flowcharts for data flow (instrumentation → collection → export).
- Visual explanations of context propagation (building on PR #8468).
- Comparison diagrams (before/after OpenTelemetry).

### Learning aids

- Progressive learning path with suggested reading order.
- Concept checklists ("Do you understand X? If not, read Y").
- Glossary integration with hover definitions or contextual links.
- Video content recommendations or embedded videos.

### Terminology improvements

Address terminology confusion identified in [#3228](https://github.com/open-telemetry/opentelemetry.io/issues/3228):

- Clarify instrumentation terminology (automatic, assisted, zero-code, code-based).
- Ensure consistent terminology usage across all conceptual documentation.

## Timeline

- **Month 1**: Audit existing content, define learning paths, and create content outline.
- **Month 2**: Write "Why Observability?" and "OpenTelemetry for Beginners" pages.
- **Month 3**: Create signal-specific guides (Traces, Metrics, Logs) and missing concepts (Entities, Events, Profiles, Attributes).
- **Month 4**: Develop visual content and diagrams.
- **Month 5**: Create use case examples and integrate glossary.
- **Month 6**: User testing, refinement, and launch.

## Labels

- `docs:concepts`
- `sig:comms`
- `sig:spec`
- `good first issue` (for some tasks)
- `help wanted`

## Linked Issues and PRs

### Open issues

- [#7280 - Concepts are missing from the concept section](https://github.com/open-telemetry/opentelemetry.io/issues/7280) - Documents need for Entities, Events, Profiles, and Attributes concept pages.
- [#7281 - Concept section needs to be able to provide complete concept](https://github.com/open-telemetry/opentelemetry.io/issues/7281) - Concept documentation (like metrics types) should be consolidated, not split across sections.
- [#3228 - Terminology Suggestion: Change "Manual Instrumentation" to "Code based Instrumentation"](https://github.com/open-telemetry/opentelemetry.io/issues/3228) - Related to clarifying instrumentation terminology.

### Merged PRs (reference implementations)

- [#8468 - Update context propagation concept page](https://github.com/open-telemetry/opentelemetry.io/pull/8468) (merged) - Major rework of context propagation documentation, can serve as a model for other concept pages.
- [#7157 - Update Assisted and Automatic Instrumentation](https://github.com/open-telemetry/opentelemetry.io/pull/7157) (blocked) - Renames "zero-code" terminology, introduces "assisted" concept.

### Closed issues (reference)

- [#1689 - Add a section in Components about "agents" & what to use instead of "agent"?](https://github.com/open-telemetry/opentelemetry.io/issues/1689) (closed) - Related to clarifying terminology and concepts.

## Project Board

To be created upon project approval.

## Discussion

- **Slack channel**: `#otel-comms`

## Meeting Times

To be determined upon project approval.

### Meeting Links

To be added upon project start.
