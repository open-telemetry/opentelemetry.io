# Portuguese Localization

<!-- markdownlint-disable no-otel-io-external-urls -->

## Description

> **Note**: This project is part of the broader
> [Website Localization](/projects/localization.md) initiative, which supports
> multiple languages for the OpenTelemetry documentation.

The Portuguese localization project brings OpenTelemetry documentation to
Portuguese-speaking communities, with a primary focus on Brazilian Portuguese
(pt-BR). This initiative makes observability concepts, implementation guides,
and best practices accessible to millions of Portuguese speakers worldwide.

### Current challenges

The Portuguese localization team faces several ongoing challenges:

- **Technical terminology consistency**: Establishing and maintaining consistent
  translations for OpenTelemetry-specific terms across all content
- **Managing drift**: Keeping pace with frequent updates to the English
  documentation, especially for actively maintained sections
- **Contributor growth**: Expanding the team of active contributors and
  reviewers to increase translation velocity
- **Comprehensive glossary**: Building a complete reference of established
  Portuguese translations for technical terms to guide future contributions

### Goals, objectives, and requirements

The Portuguese localization aims to achieve:

- **Maintain Portuguese documentation**: Ensure the OpenTelemetry documentation
  remains available, accurate, and up-to-date in Portuguese for the
  Portuguese-speaking community
- **Quality assurance**: Maintain rigorous review processes to ensure technical
  accuracy and linguistic quality
- **Current**: Keep documentation synchronized with English source material,
  minimizing drift across critical pages
- **Terminology consistency**: Maintain a comprehensive glossary of
  OpenTelemetry terminology in Portuguese to ensure consistent translations
  across all documentation
- **Community building**: Grow an active community of Portuguese-speaking
  contributors and users

Requirements:

- All translations must follow the general [localization
  guidelines][localization guidelines]
- Technical terms should follow the established glossary — See
  [Glossary & Terminology](#glossary--terminology)
- Maintain the `default_lang_commit` field in all translated pages for drift
  tracking
- Submit translations in small, focused PRs for efficient review

## Reference Materials

- **Comprehensive glossary** of OpenTelemetry terms — See
  [Glossary & Terminology](#glossary--terminology)
- **Portuguese style guide** with language-specific conventions — See
  [Style Guide](#style-guide-specifics)

## Infrastructure

- **Portuguese-specific spell check**:
  - Brazilian Portuguese dictionary for cspell
    ([`@cspell/dict-pt-br`](https://github.com/streetsidesoftware/cspell-dicts/tree/main/dictionaries/pt_BR#readme))
  - Custom wordlist ([`.cspell/pt-palavras.txt`](.cspell/pt-palavras.txt))

## Staffing / Help Wanted

### Current Team

The Portuguese localization team is composed of:

- **Approvers**: `@open-telemetry/docs-pt-approvers`
- **Maintainers**: `@open-telemetry/docs-pt-maintainers`

### Looking for Contributors

The Portuguese localization team welcomes new contributors! If you're a
Portuguese-speaker, and either have OpenTelemetry experience, or are eager to
learn, we'd love to have you on the team.

We are particularly seeking:

- **Translators**: Help expand coverage of documentation sections
- **Reviewers**: Review translation PRs and ensure quality
- **Technical experts**: Validate technical accuracy of translations
- **Community members**: Identify priority content for translation based on user
  needs

#### Getting Started

If you're interested in contributing:

1. Join the CNCF Slack [`#otel-localization-ptbr`][otel-localization-ptbr] and
   [`#otel-docs-localization`][otel-docs-localization] channels, and introduce
   yourself
2. Review the [localization documentation][localization guidelines]
3. Browse [issues labeled `lang:pt`][issues-lang-pt] to find pages that need
   translation or updating
4. Comment on an issue you'd like to work on to let the team know you're
   starting
5. Submit your first localization PR — the team is here to help!

> [!TIP] New to CNCF Slack?
> [Request an invite here](https://communityinviter.com/apps/cloud-native/cncf)

## Meeting Times

The Portuguese localization team operates as part of the Communications SIG. For
meeting schedules, notes, and calendar links, see the
[open-telemetry/community repository](https://github.com/open-telemetry/community#localization-teams-part-of-sig-communications).

## Discussion

Communication channels for the Portuguese localization team:

- **CNCF Slack**: [#otel-localization-ptbr][otel-localization-ptbr] - Primary
  channel for Portuguese team coordination and discussions
- **CNCF Slack**: [#otel-docs-localization][otel-docs-localization] - General
  localization discussions across all languages
- **GitHub**: Mention `@open-telemetry/docs-pt-approvers` in issues or PRs for
  review, questions, or assistance
- **GitHub Issues**: Use the [`lang:pt`][issues-lang-pt] label to filter for
  Portuguese-specific issues

## Timeline

- **August 2024**: Portuguese announced as one of the initial supported
  localizations in the multilingual website launch
- **Current phase**: Expanding coverage of core documentation sections and
  maintaining existing translations
- **Ongoing**: Continuous translation, review, and maintenance work driven by
  community needs and contributor availability

The Portuguese team operates on a flexible timeline, allowing contributors to
work at their own pace while prioritizing content based on user impact and
community feedback.

## Labels

- [`lang:pt`][issues-lang-pt] - Portuguese localization issues and PRs
- [`docs:i18n`][issues-docs-i18n] - General localization issues that may affect
  Portuguese content

## Glossary & Terminology

This section documents the established Portuguese translations for key
OpenTelemetry and observability terms. This glossary serves as the authoritative
reference for all Portuguese translations to ensure consistency across the
documentation.

| English Term        | Portuguese Translation             | Notes                                                                      |
| ------------------- | ---------------------------------- | -------------------------------------------------------------------------- |
| API                 | API                                | Keep acronym                                                               |
| Attribute           | Atributo                           |                                                                            |
| Baggage             | Bagagem                            |                                                                            |
| Backend             | Backend                            | Keep in English; software/system running behind the scenes                 |
| Callback            | Função de retorno                  |                                                                            |
| Cardinality         | Cardinalidade                      |                                                                            |
| Child (span)        | Filho                              |                                                                            |
| Code-based          | Manual                             | Preferred over "Baseado em código"                                         |
| Collector           | Collector                          | Component name, follows project wordlist                                   |
| Context Propagation | Propagação de Contexto             |                                                                            |
| Debugging           | Debugging                          |                                                                            |
| Endpoint            | Rota                               |                                                                            |
| Exporter            | Exporter                           | Component name, follows project wordlist                                   |
| Extension           | Extension                          | Component name                                                             |
| Fetch               | Obter                              | When used as verb; keep as "fetch" for command examples                    |
| Framework           | Framework                          | Keep in English                                                            |
| Handler             | Manipulador                        |                                                                            |
| Hook                | Hook                               | "Ganchos" possible but typically kept in English in software context       |
| Instrumentation     | Instrumentação                     |                                                                            |
| Latency             | Latência                           |                                                                            |
| Log                 | Log                                | Keep in English, universally understood                                    |
| Logger              | Logger                             |                                                                            |
| Log appender        | Anexadores                         |                                                                            |
| Log Bridge          | Log Bridge                         |                                                                            |
| Logging             | Logging                            |                                                                            |
| LogRecordExporter   | LogRecordExporter                  | Component name                                                             |
| LogRecordProcessor  | LogRecordProcessor                 | Component name                                                             |
| Metadata            | Metadados                          |                                                                            |
| Meter Exporter      | Meter Exporter                     | Component name                                                             |
| Meter Provider      | Meter Provider                     | Component name                                                             |
| Metric              | Métrica                            |                                                                            |
| MetricExporter      | MetricExporter                     | Component name                                                             |
| MetricReader        | MetricReader                       | Component name                                                             |
| Observability       | Observabilidade                    | Direct translation, widely accepted                                        |
| Parent (span)       | Pai                                |                                                                            |
| Performance         | Desempenho                         |                                                                            |
| Pipeline            | Pipeline                           | Keep in English                                                            |
| Processor           | Processor                          | Component name                                                             |
| Propagator          | Propagator                         | Component name                                                             |
| Receiver            | Receiver                           | Component name                                                             |
| Registry            | Registro                           |                                                                            |
| Resource            | Recursos                           |                                                                            |
| Sample/Sampling     | Amostragem                         |                                                                            |
| SDK                 | SDK                                | Keep acronym                                                               |
| Scrape              | Extrair/Extração                   |                                                                            |
| Signal              | Sinal                              |                                                                            |
| Span                | Trecho                             | Standard translation; "span" acceptable in technical contexts              |
| SpanExporter        | SpanExporter                       | Component name                                                             |
| SpanProcessor       | SpanProcessor                      | Component name                                                             |
| Stack Trace         | Stack Trace                        |                                                                            |
| Status              | Estado                             |                                                                            |
| Telemetry           | Telemetria                         |                                                                            |
| TextMapPropagator   | TextMapPropagator                  | Component name                                                             |
| Throughput          | Taxa de transferência / Throughput | Context dependent                                                          |
| Trace               | Rastro                             | Standard translation; "trace" acceptable for technical terms like trace ID |
| Tracer              | Tracer                             | Component name                                                             |
| Tracer Exporter     | Tracer Exporter                    | Component name                                                             |
| Tracer Provider     | Tracer Provider                    | Component name                                                             |
| Upstream            | Upstream                           | Keep in English                                                            |
| Vendor              | Fornecedor                         |                                                                            |
| Workflow            | Workflow                           | Keep in English; "fluxo de trabalho" acceptable                            |
| Zero-code           | Sem código                         | Standard translation; sometimes kept as "zero-code"                        |

> [!NOTE] Many component names (Collector, Exporter, Processor, etc.) are kept
> in English as they follow the OpenTelemetry project's official terminology,
> and their definition can be translated.

## Style Guide Specifics

This section documents Portuguese-specific translation conventions and style
decisions.

### Voice and Tone

- **Formal vs. Informal**: Use formal "você" rather than informal "tu" to
  maintain consistency across regions
- **Imperative mood**: Use imperative for instructions (e.g., "Execute o
  comando" rather than "Você deve executar o comando")
- **Active voice**: Prefer active voice for clarity and conciseness, matching
  the English style

### Technical Term Handling

1. **When to translate**:
   - General technical concepts that have clear Portuguese equivalents (e.g.,
     "performance" → "desempenho")
   - OpenTelemetry-specific terms where Portuguese translation improves clarity
     (e.g., "observability" → "observabilidade")

2. **When to keep English**:
   - Widely adopted terms in the tech community (e.g., "framework", "backend")
   - Acronyms and proper nouns (e.g., "SDK", "API", "OpenTelemetry")

3. **Hybrid approach**:
   - On first use, you may provide both: "rastros (_traces_)" or "trechos
     (_spans_)"
   - Use Portuguese term primarily, with English in parentheses if needed for
     clarity

### Code and Comments

- **Code blocks**: Never translate code itself (variable names, function calls,
  etc.)
- **Code comments**: Translation of code comments is optional and should be
  decided case-by-case:
  - Translate comments if they provide important context for understanding
  - Keep in English if translation would be awkward or if code is copied from
    external sources

### Headings and Capitalization

- **Heading style**: Use sentence case (capitalize only the first word and
  proper nouns)
- **Heading IDs**: Always preserve or explicitly set heading IDs to match the
  English version (e.g., `## Instalação {#installation}`)
- **Proper nouns**: Always preserve original capitalization (e.g.,
  OpenTelemetry, Kubernetes, Docker)

### Links and References

- **Internal links**: Use absolute paths (e.g., `/docs/concepts/...`) which
  automatically route to Portuguese versions
- **External links**: Replace with Portuguese versions only if an official
  Portuguese resource exists (e.g., Wikipedia `en.wikipedia.org` →
  `pt.wikipedia.org`)
- **Link text**: Translate link text but preserve the URL unless a Portuguese
  equivalent exists

### Numbers and Units

- **Decimal separator**: Use comma for decimals (e.g., "3,14" not "3.14") in
  prose
- **Thousand separator**: Use period for thousands (e.g., "1.000" not "1,000")
- **Code examples**: Keep numbers in code as-is (using period for decimals as
  per code conventions)

### Formatting Conventions

- **Quotation marks**: Use "double quotes" for quotations
- **Emphasis**: Follow the same bold/italic patterns as English
  - **Exception**: English terms, when included in Portuguese text, should be
    italicized (e.g., _trace_, _span_)
- **Lists**: Maintain the same structure and punctuation as English lists

## Roadmap

### Areas of Focus

The team prioritizes translations based on:

- **User impact**: Documentation that helps users get started and implement
  OpenTelemetry successfully
- **Community requests**: Content requested by Portuguese-speaking community
  members
- **Completeness**: Filling gaps in partially translated sections
- **Timely**: Updating drifted content in high-traffic pages

### Flexible Prioritization

The Portuguese localization team operates with a flexible, community-driven
approach to prioritization:

- Contributors are encouraged to translate content they find most valuable or
  interesting
- Priority is given to foundational content that serves the broadest audience
- The team regularly reviews drift reports to identify pages that need updating
- Decisions on what to translate next are made collaboratively based on team
  capacity and community needs

No rigid targets or deadlines are set. The focus is on sustainable, quality
contributions that grow organically with the team.

## Contributor Resources

### Portuguese-Specific Contribution Guide

The team maintains a comprehensive contribution guide in Portuguese:

- **Blog post**:
  [Guia: Contribuindo com a Localização da Documentação do OpenTelemetry para Português](https://vasconcellos.dev/posts/2024-07-26-guia-contribuicao-otel-docs-pt) -
  Detailed step-by-step guide covering:
  - Getting started with localization
  - Priority pages for translation
  - Working with the `default_lang_commit` field
  - Handling drift and updating existing translations
  - Creating issues and pull requests
  - Common troubleshooting (e.g., EasyCLA author ID issues)

This guide is specifically tailored to Portuguese-speaking contributors and
includes examples relevant to the pt-BR localization.

### Key Workflow Commands

When working on Portuguese translations, use these npm scripts:

```bash
# Check drift for Portuguese pages
npm run check:i18n -- content/pt

# View diff details for a specific page
npm run check:i18n -- -d content/pt/docs/languages/go/instrumentation.md

# Add commit hash to new translations
npm run check:i18n -- -c HEAD content/pt/docs/your-new-page.md

# Update drift status
npm run fix:i18n:status content/pt/docs/your-updated-page.md

# Format pages before submitting PR
npm run fix:format
```

See the [localization documentation][localization guidelines] for more details.

## Linked Issues and PRs

- [`lang:pt` labeled issues][issues-lang-pt] - All Portuguese localization
  issues
- [Portuguese localization PRs][prs-lang-pt] - Recent and ongoing translation
  work
- [#4863](https://github.com/open-telemetry/opentelemetry.io/issues/4863) -
  Multilingual website launch announcement
- [Localization documentation][localization guidelines] - General guidelines for
  all localizations
- [Example PR with extensive feedback](https://github.com/open-telemetry/opentelemetry.io/pull/5380) -
  Go instrumentation translation (146 comments)

## Project Board

Portuguese localization work is tracked through:

- **Language-specific tab** on the
  [OpenTelemetry Localization project board](https://github.com/orgs/open-telemetry/projects/106)
- **GitHub issues** with the
  [`lang:pt`](https://github.com/open-telemetry/opentelemetry.io/labels/lang%3Apt)
  label

Contributors and reviewers use both the project board and issue labels to
coordinate work and track progress.

[localization guidelines]:
  https://opentelemetry.io/docs/contributing/localization/
[otel-docs-localization]: https://cloud-native.slack.com/archives/C076RUAGP37
[otel-localization-ptbr]: https://cloud-native.slack.com/archives/C076LET8YSK
[issues-lang-pt]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3Apt
[issues-docs-i18n]:
  https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Adocs%3Ai18n
[prs-lang-pt]:
  https://github.com/open-telemetry/opentelemetry.io/pulls?q=is%3Apr+is%3Aopen+label%3Alang%3Apt
