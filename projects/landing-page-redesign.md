# Landing Page Redesign

## Ownership

- Lead: Fabrizio Ferri Benedetti (@theletterf)

## Background and description

The OpenTelemetry website landing page serves as the first impression for
thousands of potential users, contributors, and adopters. As OpenTelemetry has
matured into a widely adopted observability standard, the homepage needs to
evolve to better communicate its value proposition and guide diverse user
personas to relevant content.

This project aims to modernize the OpenTelemetry homepage at
[opentelemetry.io](https://opentelemetry.io) to better serve the needs of
developers, operators, SREs, platform engineers, and decision-makers evaluating
OpenTelemetry for their organizations.

### Inspiration Analysis: Kubernetes and Prometheus

To inform this redesign, we analyzed the landing pages of two highly successful
CNCF projects: **Kubernetes** (kubernetes.io) and **Prometheus**
(prometheus.io). Both excel at communicating complex technical concepts to
beginners while maintaining depth for advanced users.

#### Kubernetes.io Design Patterns

1. **Concise, Powerful Tagline**: "Production-Grade Container Orchestration" —
   Just 4 words that communicate both quality ("Production-Grade") and purpose
   ("Container Orchestration"). No jargon, immediately understandable.

2. **"Why Kubernetes?" Section**: Six clear feature cards that answer the
   beginner's first question. Each card has:
   - A descriptive title (e.g., "Automated rollouts and rollbacks")
   - A 1-2 sentence explanation in plain English
   - No assumed prior knowledge

3. **Feature Cards with Clear Benefits**:
   - **Service discovery and load balancing**: Kubernetes can expose a container
     using the DNS name or using their own IP address.
   - **Storage orchestration**: Automatically mount the storage system of your
     choice.
   - **Self-healing**: Restarts containers that fail, replaces containers, kills
     containers that don't respond to your user-defined health check.
   - **Horizontal scaling**: Scale your application up and down with a simple
     command, with a UI, or automatically based on CPU usage.

4. **Case Studies Section**: Real company logos and stories showing Kubernetes
   in production — builds trust and demonstrates maturity.

5. **Community Events**: Prominent display of KubeCon and community events —
   shows the project is alive and thriving.

6. **Clean Navigation**: Documentation, Blog, Training, Community — simple
   hierarchy.

#### Prometheus.io Design Patterns

1. **Minimalist Hero**: Clean design with flame logo and tagline "From metrics
   to insight" — elegant and memorable.

2. **Technical Features Clearly Explained**:
   - **Dimensional data model**: Time series identified by metric name and
     key/value pairs
   - **Powerful queries**: PromQL allows slicing and dicing of collected data
   - **No reliance on distributed storage**: Single server nodes are autonomous
   - **Pull model over HTTP**: Targets discovered via service discovery or
     static config
   - **Dashboarding and graphing**: Multiple modes of graphing and dashboarding
     support

3. **Architecture Diagram**: Visual representation of how Prometheus works —
   helps beginners understand the system at a glance.

4. **"Get Started" Prominence**: Clear pathway to first steps, not buried in
   navigation.

5. **Component Breakdown**: Clear explanation of each piece (Prometheus server,
   Alertmanager, exporters, etc.).

#### Key Lessons for OpenTelemetry

| Aspect              | Current OpenTelemetry                                                                                     | Kubernetes/Prometheus Best Practice |
| ------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| **Tagline**         | "High-quality, ubiquitous, and portable telemetry to enable effective observability" (15 words, abstract) | 4-6 words, concrete benefit         |
| **First Question**  | Not answered                                                                                              | "Why X?" or "What is X?" section    |
| **Features**        | Listed as technical concepts                                                                              | Explained as user benefits          |
| **Visuals**         | Logo only                                                                                                 | Architecture diagrams, icons        |
| **Social Proof**    | CNCF badge only                                                                                           | Case studies, adopter logos         |
| **Getting Started** | "Dev" and "Ops" links                                                                                     | Clear "Get Started" pathway         |

### Repository Verification

**Current landing page verified in repository (`content/en/_index.md`):**

```markdown
# Current structure (101 lines)

{{< blocks/cover >}}

- Logo: OpenTelemetry horizontal color SVG
- Tagline: "{{% param description %}}" (15 words)
- Primary CTAs: "Learn more" | "Try the demo"
- Role buttons: Dev | Ops {{< /blocks/cover >}}

{{< blocks/lead >}}

- Text description of OpenTelemetry
- Note about general availability {{< /blocks/lead >}}

{{< blocks/section type="row" >}}

- Feature 1: "Traces, Metrics, Logs" with fas fa-chart-line icon
- Feature 2: "Drop-in Instrumentation & Integrations" with fas fa-magic icon
- Feature 3: "Open Source, Vendor Neutral" with fab fa-github icon
  {{< /blocks/section >}}

{{< blocks/section type="cncf" >}}

- CNCF incubating project badge {{< /blocks/section >}}
```

**Assets available:**

- `assets/icons/logo.svg` - Main logo
- `assets/icons/logo-pride.svg` - Pride variant
- `static/img/logos/` - Various logo formats
- `iconography/` - 54 icons at 32x32 and 53 at 512x512

### Current challenges

The current landing page has several limitations that affect user experience and
adoption:

- **Wordy, abstract tagline**: "High-quality, ubiquitous, and portable telemetry
  to enable effective observability" uses jargon and doesn't answer "what does
  this do for me?" Compare to Kubernetes' "Production-Grade Container
  Orchestration" or Prometheus' "From metrics to insight."

- **Missing "Why OpenTelemetry?" section**: Beginners land on the page and
  immediately see technical terms (traces, metrics, logs) without understanding
  the problem being solved. Kubernetes explains benefits before technical
  details.

- **Limited persona targeting**: The homepage only addresses "Dev" and "Ops"
  roles, missing other important personas such as SREs, Platform Engineers,
  Security Engineers, and technical decision-makers evaluating OpenTelemetry.

- **No architecture visualization**: Unlike Prometheus' clear architecture
  diagram, OpenTelemetry's complex ecosystem (SDKs, Collector, exporters,
  backends) isn't visualized. Beginners can't form a mental model.

- **Missing social proof**: The page lacks adoption metrics, testimonials, case
  studies, or evidence of widespread industry adoption. Kubernetes prominently
  displays case studies from real companies.

- **No ecosystem showcase**: Despite having 90+ vendor integrations and
  thousands of libraries in the registry, the homepage doesn't effectively
  showcase the size and breadth of the ecosystem.

- **Basic design**: The current design uses standard Docsy theme blocks with
  minimal customization, resulting in a generic appearance that doesn't reflect
  the project's maturity and importance.

If these challenges are not addressed, potential users may not fully appreciate
OpenTelemetry's capabilities, leading to slower adoption and missed
opportunities for the project to demonstrate its value.

### Goals, objectives, and requirements

The goal of this project is to create a modern, engaging, and informative
landing page that follows the successful patterns established by Kubernetes and
Prometheus:

1. **Craft a concise, memorable tagline**: Create a 4-6 word tagline that
   communicates what OpenTelemetry does and its value. Examples to explore:
   - "The Standard for Observability Data"
   - "Universal Telemetry for Modern Applications"
   - "Instrument Once, Observe Everywhere"

2. **Add a "Why OpenTelemetry?" section**: Like Kubernetes, create 4-6 feature
   cards that explain benefits in plain English:
   - **Vendor-neutral instrumentation**: Instrument your code once, send data
     anywhere
   - **Unified telemetry**: Traces, metrics, and logs with correlated context
   - **Drop-in instrumentation**: Auto-instrument popular frameworks with zero
     code changes
   - **Industry standard**: Backed by major cloud providers and observability
     vendors
   - **Production-ready**: Stable APIs used by thousands of organizations
     worldwide
   - **Open source**: 100% free, CNCF-hosted, community-driven

3. **Create an architecture visualization**: A simple diagram showing:
   - Your Application → OpenTelemetry SDK → Collector → Any Backend
   - Make the complex simple, like Prometheus does

4. **Showcase the ecosystem**: Display:
   - Number of supported languages (11+)
   - Number of Collector components (200+)
   - Number of vendor integrations (90+)
   - Adopter logos (scrolling or grid)

5. **Add case studies or testimonials**: Feature 3-5 real-world success stories
   from adopters.

6. **Simplify the getting started pathway**: Instead of just "Dev" and "Ops",
   consider:
   - "Get Started in 5 Minutes" primary CTA
   - Secondary paths for different languages/use cases
   - Try the demo prominently featured

7. **Maintain accessibility and localization**: Meet WCAG 2.1 AA standards,
   ensure the redesign works for all language localizations.

**Motivations for starting now**:

- OpenTelemetry is approaching graduation status at the CNCF, making this an
  ideal time to refresh the public-facing homepage.
- User research and feedback indicate that newcomers struggle to understand what
  OpenTelemetry offers.
- Competing projects have more modern and engaging websites that may attract
  users who would benefit from OpenTelemetry.

## Deliverables

### Research and Planning

- **Competitive analysis report**: Detailed analysis of Kubernetes, Prometheus,
  and other successful project landing pages
- **User research report**: Analysis of user personas, their needs, and journey
  mapping for the homepage
- **Proposed tagline options**: 3-5 tagline candidates with testing plan

### Design

- **Information architecture**: Revised structure for homepage content and
  navigation
- **Wireframes**: Low-fidelity layouts showing new section structure
- **Design mockups**: High-fidelity mockups for desktop and mobile views
- **Prototype**: Interactive prototype for user testing

### Content

- **"Why OpenTelemetry?" copy**: 4-6 benefit cards with clear, jargon-free
  explanations
- **Architecture diagram**: Simple visual showing OTel data flow
- **Ecosystem statistics**: Accurate counts of languages, components,
  integrations
- **Case study summaries**: 3-5 adopter success stories (may require outreach)

### Implementation

- **Landing page implementation**: Full implementation of the redesigned
  homepage
- **Component library updates**: Any new UI components needed
- **Localization**: Updates to all supported languages
- **Documentation**: Guidelines for maintaining and updating the homepage

### Specific Features

Inspired by Kubernetes and Prometheus patterns:

| Feature                        | Inspiration                    | Priority |
| ------------------------------ | ------------------------------ | -------- |
| New concise tagline            | Both                           | P0       |
| "Why OpenTelemetry?" cards     | Kubernetes "Why Kubernetes?"   | P0       |
| Architecture diagram           | Prometheus architecture visual | P0       |
| Adopter logos section          | Kubernetes case studies        | P1       |
| Ecosystem statistics           | Both                           | P1       |
| "Get Started in 5 Minutes" CTA | Both                           | P1       |
| Interactive demo link          | OpenTelemetry demo             | P1       |
| Community events section       | Kubernetes events              | P2       |
| Mobile-responsive design       | Both                           | P0       |
| Accessibility improvements     | Standard                       | P1       |

## Timeline

- **Month 1**: User research, competitive analysis, and information architecture
  - Deliverables: Research report, tagline options, wireframes
- **Month 2**: Design exploration, mockups, and community feedback
  - Deliverables: High-fidelity mockups, prototype
- **Month 3**: Content creation and user testing
  - Deliverables: Copy for all sections, architecture diagram, case studies
- **Month 4**: Implementation and refinement
  - Deliverables: Working implementation in staging
- **Month 5**: Accessibility audit, localization support, and final testing
  - Deliverables: Accessibility report, localized content
- **Month 6**: Launch and post-launch monitoring
  - Deliverables: Production launch, analytics setup

## Labels

- `docs:design/style`
- `sig:comms`
- `p1-high`

## Related issues

No directly related issues found. This would be a new initiative, inspired by
successful patterns from peer CNCF projects.

## Project Board

To be created upon project approval.

## SIG Meetings and Other Info

This project will be coordinated through SIG Communications meetings. Additional
design review sessions may be scheduled as needed.

- **Slack channel**: `#otel-comms`
- **Meeting notes**: To be linked upon project start.

## Appendix: Current vs. Proposed Structure

### Current Landing Page Structure

1. Hero: Logo + wordy tagline + "Learn more" / "Try the demo"
2. Role buttons: Dev / Ops
3. Lead section: Text description
4. Feature cards: Traces, Metrics, Logs / Drop-in Instrumentation / Open Source
5. CNCF badge

### Proposed Landing Page Structure (Inspired by K8s/Prometheus)

1. **Hero**: Logo + concise tagline (4-6 words) + "Get Started in 5 Minutes" CTA
2. **"What is OpenTelemetry?"**: 1-2 sentence plain-English explanation
3. **Architecture Diagram**: Visual showing SDK → Collector → Backend flow
4. **"Why OpenTelemetry?"**: 4-6 benefit cards (like Kubernetes)
5. **Ecosystem Showcase**: Statistics + vendor/adopter logos
6. **Getting Started Paths**: Language icons with quick links
7. **Case Studies/Testimonials**: Real-world success stories
8. **Community**: Events, Slack, contributing
9. **CNCF Badge**: Graduation status (when achieved)
