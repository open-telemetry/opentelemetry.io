---
title: OpenTelemetry
description: Otwarty standard telemetrii
developer_note:
  The blocks/cover shortcode (used below) will use as a background image any
  image file containing "background" in its name.
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
default_lang_commit: 385a8b07a0ea97568abc86caf46606c16d3110c6
---

{{% blocks/cover image_anchor="top" height="max td-below-navbar" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="docs/what-is-opentelemetry/">
    Dowiedz się więcej
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    Wypróbuj demo
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="Szukaj w dokumentacji OpenTelemetry..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="Przegląd OpenTelemetry" %}}

**OpenTelemetry** to otwartoźródłowy framework obserwowalności dla oprogramowania
chmurowego. Dostarcza jednolity zestaw interfejsów API, bibliotek, agentów
i usług kolektorów do przechwytywania rozproszonych śladów i metryk z Twojej
aplikacji.

OpenTelemetry czerpie z wieloletniego doświadczenia projektów OpenTracing
i OpenCensus, łącząc najlepsze w swojej klasie pomysły i praktyki społeczności.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="Instrumentacja niezależna od dostawcy"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

Instrumentuj swój kod raz, korzystając z interfejsów API i SDK OpenTelemetry.
Eksportuj dane telemetryczne do dowolnego backendu obserwowalności — Jaeger,
Prometheus, dostawców komercyjnych lub własnego rozwiązania. Zmieniaj backend
bez modyfikowania kodu aplikacji.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Ujednolicone sygnały obserwowalności"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

Koreluj ślady, metryki i logi ze współdzielonym kontekstem, który przepływa
przez całą ścieżkę zapytania. Uzyskaj pełny obraz zachowania aplikacji
we wszystkich komponentach i usługach.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Działa wszędzie"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry jest w 100% otwartoźródłowe i niezależne od dostawców. Wdrażaj
we własnej infrastrukturze, w środowiskach hybrydowych lub w wielu
chmurach z pełną elastycznością i zerowym uzależnieniem od dostawcy.
Przenoś aplikacje tam, gdzie ich potrzebujesz.

{{% /homepage/main-feature %}}

{{< /homepage/main-features >}}

{{< homepage/signals-showcase title="Sygnały obserwowalności" >}}
{{< homepage/signal name="Ślady" image="/img/homepage/signal-traces.svg" url="/docs/concepts/signals/traces/" >}}
Ślady rozproszone {{< /homepage/signal >}}
{{< homepage/signal name="Metryki" image="/img/homepage/signal-metrics.svg" url="/docs/concepts/signals/metrics/" >}}
Pomiary w czasie {{< /homepage/signal >}}
{{< homepage/signal name="Logi" image="/img/homepage/signal-logs.svg" url="/docs/concepts/signals/logs/" >}}
Rekordy ze znacznikiem czasu {{< /homepage/signal >}}
{{< homepage/signal name="Bagaż" image="/img/homepage/signal-baggage.svg" url="/docs/concepts/signals/baggage/" >}}
Metadane kontekstowe {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="Funkcje OpenTelemetry" columns="2" >}}

{{< homepage/otel-feature image="/img/homepage/feature-auto-instrumentation.svg" title="Automatyczna instrumentacja" url="/docs/concepts/instrumentation/zero-code/" >}}
Zacznij w kilka minut dzięki instrumentacji bez pisania kodu dla popularnych
frameworków i bibliotek. Agenty automatycznej instrumentacji przechwytują ślady,
metryki i logi bez modyfikowania kodu źródłowego. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-pipeline.svg" title="Potok kolektora" url="/docs/collector/" >}}
Przetwarzaj, filtruj i kieruj dane telemetryczne za pomocą kolektora
OpenTelemetry. Wdrażaj jako agenta lub bramę do odbierania, przetwarzania
i eksportowania telemetrii na dużą skalę z ponad 200 komponentami. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-observability.svg" title="Propagacja kontekstu" url="/docs/concepts/context-propagation/" >}}
Automatycznie koreluj ślady między granicami usług. Rozproszony kontekst
przepływa przez całą ścieżkę zapytań, łącząc logi, metryki i ślady
w ujednolicony widok. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-multi-language.svg" title="Wsparcie wielu języków" url="/docs/languages/" >}}
Natywne SDK dla ponad 12 języków, w tym Java, Kotlin, Python, Go, JavaScript,
.NET, Ruby, PHP, Rust, C++, Swift i Erlang. Korzystaj z preferowanego języka
ze wsparciem OpenTelemetry. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-production-ready.svg" title="Stabilne i gotowe do produkcji" url="/status/" >}}
Interfejsy API śledzenia i metryk są stabilne we wszystkich głównych językach.
Tysiące organizacji używa OpenTelemetry w produkcji. Wspierane przez CNCF
i głównych dostawców chmurowych. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature image="/img/homepage/feature-openness.svg" title="Otwarte specyfikacje" url="/docs/specs/status/" >}}
Zbudowane na otwartych, niezależnych od dostawców specyfikacjach dla interfejsów
API, SDK i protokołu sieciowego (OTLP). Przejrzyste zarządzanie w ramach CNCF
zapewnia długoterminową stabilność i rozwój napędzany przez społeczność. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="Ekosystem OpenTelemetry" >}}
{{< homepage/stat type="languages" label="Języki" url="/docs/languages/" >}}
{{< homepage/stat type="collector" label="Komponenty kolektora" url="/docs/collector/" >}}
{{< homepage/stat type="registry" label="Integracje" url="/ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="Dostawcy" url="/ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="Zaufany przez liderów branży"
    limit="10"
    ctaText="Poznaj organizacje korzystające z OpenTelemetry"
    ctaUrl="/ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry jest projektem [CNCF][] w fazie [inkubacji][incubating]**.<br>
Powstał z połączenia projektów OpenTracing i OpenCensus.

[![Logo CNCF][cncf logo]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}
