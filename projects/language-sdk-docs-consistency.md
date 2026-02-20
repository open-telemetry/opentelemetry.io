# Language SDK Documentation Consistency

<!-- markdownlint-disable no-otel-io-external-urls -->

## Ownership

- Lead: Fabrizio Ferri Benedetti (@theletterf)

## Background and description

OpenTelemetry provides SDKs for 13+ programming languages, each with its own
documentation on [opentelemetry.io](https://opentelemetry.io/docs/languages/).
While standardization efforts have improved consistency, significant gaps and
inconsistencies remain across language SDK documentation.

This project aims to standardize and complete language SDK documentation across
all supported languages, ensuring users have a consistent experience regardless
of which language they're using.

### Current challenges

The current language SDK documentation has several issues:

- **Inconsistent page structure**: Different languages have different
  documentation structures. For example, Go has a dedicated sampling page while
  .NET doesn't. Ruby is missing resource documentation that other languages
  have.
- **Missing critical documentation**:
  - Sampling documentation is missing for .NET, Python, and partially for Java.
  - Testing instrumentation guides are missing for Go and most other languages.
  - Context propagation documentation varies significantly in depth.
  - Resource management documentation is incomplete for several languages.
- **Outdated content**: Some documentation is out of sync with the actual SDK
  capabilities. For example, the Java agent instrumentation list doesn't match
  the current `supported-libraries.md` in the repository.
- **Varying code example quality**: Some languages have comprehensive, tested
  code examples while others have minimal or untested snippets.
- **No feature parity documentation**: Users cannot easily determine which
  features are available in which languages or at what stability level.

**Current state assessment** (verified against repository):

| Language   | Sampling                                          | Testing                 | Context Prop         | Resources  | Config     | Overall    |
| ---------- | ------------------------------------------------- | ----------------------- | -------------------- | ---------- | ---------- | ---------- |
| Go         | ✅ Dedicated page                                 | ❌ Missing              | ❌ No dedicated page | ✅ Yes     | ⚠️ Partial | Good       |
| .NET       | ✅ Advanced (tail-based, stratified, links-based) | ⚠️ Partial              | ⚠️ Partial           | ✅ Yes     | ✅ Yes     | Good       |
| Java       | ✅ In sdk.md (comprehensive table)                | ❌ Missing              | ⚠️ Partial           | ⚠️ Partial | ✅ Yes     | Good       |
| Python     | ❌ Missing                                        | ❌ Missing              | ✅ Yes               | ❌ Missing | ⚠️ Partial | Needs work |
| JavaScript | ✅ Yes                                            | ❌ Missing              | ✅ Yes               | ✅ Yes     | ⚠️ Partial | Good       |
| Ruby       | ✅ Dedicated page                                 | ❌ Missing              | ⚠️ In other docs     | ❌ Missing | ❌ Missing | Needs work |
| PHP        | ⚠️ Partial                                        | ❌ Missing              | ✅ Yes               | ✅ Yes     | ⚠️ Partial | Okay       |
| Erlang     | ✅ Yes                                            | ✅ Yes (only language!) | ✅ Yes               | ✅ Yes     | ⚠️ Partial | Excellent  |

**Key findings from repository analysis:**

1. **.NET has excellent sampling docs**: Contrary to initial assessment, .NET
   has advanced sampling guides including:
   - `traces/tail-based-sampling.md` - Comprehensive hybrid sampling approach
   - `traces/stratified-sampling.md` - Per-route sampling strategies
   - `traces/links-based-sampler.md` - Links-based sampling implementation

2. **Erlang is the gold standard for testing**: The only language with a
   dedicated `testing.md` that provides a complete testing approach with code
   examples.

3. **Java sampling is well-documented**: While not in a dedicated page, `sdk.md`
   includes a comprehensive sampler comparison table with 7+ sampler
   implementations.

4. **Python and Ruby need the most work**: Both lack sampling and resources
   documentation.

5. **Go lacks propagation page**: Despite other SDKs having dedicated
   propagation docs, Go doesn't have one.

If these challenges are not addressed:

- Users will have inconsistent experiences across languages, leading to
  confusion and frustration.
- Teams using multiple languages will struggle to apply learnings from one
  language to another.
- Missing documentation leads to support burden and incorrect implementations.
- OpenTelemetry's reputation for completeness and maturity suffers.

### Goals, objectives, and requirements

The goal of this project is to ensure all language SDK documentation:

1. **Follows a standardized structure**: All languages have the same
   documentation sections.
2. **Is complete**: All critical topics (sampling, testing, context propagation,
   resources, configuration) are documented for every language.
3. **Is accurate**: Documentation matches current SDK capabilities.
4. **Has quality code examples**: All examples are tested and follow best
   practices.
5. **Shows feature parity**: Users can easily see which features are available
   in which languages.

**Motivations for starting now**:

- Several language SDKs have recently reached stable status, making this an
  ideal time to complete documentation.
- User feedback consistently highlights documentation gaps as a barrier to
  adoption.
- The Java SDK documentation restructure provides a template for other
  languages.

## Deliverables

### Standardization

- **SDK documentation template**: A standardized template defining required
  sections for all language SDK documentation.
- **Gap analysis report**: Comprehensive report identifying missing pages and
  content per language.
- **Style guide updates**: Language SDK-specific guidance in the documentation
  style guide.

### Missing documentation

Implementation of missing pages for each language:

- **Sampling documentation**: For .NET, Python, Java (expand), Ruby (context),
  PHP.
- **Testing instrumentation guides**: For Go, .NET, Java, Python, JavaScript,
  Ruby, PHP.
- **Context propagation**: For .NET (expand), Java (expand), Ruby.
- **Resource management**: For Python, Ruby.
- **SDK configuration reference**: Standardized configuration documentation for
  all languages.
- **Error handling and troubleshooting**: Per-language troubleshooting guides.

### Quality improvements

- **Code example review and updates**: Audit all code examples for accuracy and
  best practices.
- **Code example testing**: Framework for testing documentation code examples.
- **SDK feature parity matrix**: Publicly visible matrix showing feature
  availability across languages.

### Automation

- **Drift detection**: Automated checks to identify when languages fall behind
  the standard structure.
- **Version tracking**: Track SDK versions documented vs. latest releases.

## Timeline

- **Month 1**: Create standardized template, complete gap analysis.
- **Month 2-3**: Address .NET documentation gaps (sampling, context
  propagation).
- **Month 4-5**: Address Python documentation gaps (sampling, resources,
  testing).
- **Month 6-7**: Address Java documentation gaps (sampling expansion, testing).
- **Month 8-9**: Address Ruby and PHP documentation gaps.
- **Month 10**: Create SDK feature parity matrix.
- **Month 11**: Implement drift detection automation.
- **Month 12**: Final review and launch.

## Labels

- `sig:dotnet`
- `sig:go`
- `sig:java`
- `sig:js`
- `sig:python`
- `sig:ruby`
- `sig:php`
- `sig:erlang`
- `sig:comms`
- `help wanted`

## Related issues

- [#7302 - .NET docs doesn't mention support for samplers](https://github.com/open-telemetry/opentelemetry.io/issues/7302)
  (open) - Missing sampling documentation for .NET.
- [#6899 - Go language docs: Add documentation for how to test instrumentation](https://github.com/open-telemetry/opentelemetry.io/issues/6899)
  (open) - Missing testing documentation for Go.
- [#1630 - Document how to test that you're instrumenting traces correctly](https://github.com/open-telemetry/opentelemetry.io/issues/1630)
  (open) - Cross-language testing documentation.
- [#971 - Guidance around using OTel for tracing in language SDKs](https://github.com/open-telemetry/opentelemetry.io/issues/971)
  (open) - SDK usage guidance.
- [#6110 - Please add Go examples of how to create LoggerProvider for unit tests](https://github.com/open-telemetry/opentelemetry.io/issues/6110)
  (open) - Go testing examples.

## Project Board

To be created upon project approval.

## SIG Meetings and Other Info

This project will require coordination across multiple SIGs:

- **Primary coordination**: SIG Communications
- **Language SIG engagement**: Regular check-ins with each language SIG.
- **Slack channel**: `#otel-comms`
- **Meeting notes**: To be linked upon project start.
