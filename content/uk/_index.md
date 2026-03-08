---
title: OpenTelemetry
description: >-
  Високоякісна, повсюдна та переносна телеметрія для забезпечення ефективної спостережуваності
outputs:
  - HTML
developer_note: >
  The blocks/cover shortcode (used below) will use as a background image any image file containing "background" in its name.
params:
  btn-lg: class="btn btn-lg btn-{1}" role="button"
  show_banner: true
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
---

{{% blocks/cover image_anchor="top" height="max" color="primary" %}}

<!-- prettier-ignore -->
![OpenTelemetry](/img/logos/opentelemetry-horizontal-color.svg)
{.otel-logo}

<!-- prettier-ignore -->
{{% param description %}}
{.display-6}

<!-- prettier-ignore -->
<div class="td-cta-buttons my-5">
  <a {{% _param btn-lg primary %}} href="docs/what-is-opentelemetry/">
    Дізнатися більше
  </a>
  <a {{% _param btn-lg secondary %}} href="docs/demo/">
    Демонстрація
  </a>
</div>

{{% /blocks/cover %}}

{{< homepage/hero-search placeholder="Шукати в документації OpenTelemetry..." >}}

{{% homepage/intro-section image="/img/homepage/collector-pipeline.svg" imageAlt="OpenTelemetry overview" %}}

**OpenTelemetry** — це відкрита платформа спостережуваності для хмарного програмного забезпечення. Вона надає єдиний набір API, бібліотек, агентів і служб збору даних для отримання розподілених трасувань і метрик з вашого програмного забезпечення.

OpenTelemetry базується на багаторічному досвіді проєктів OpenTracing і OpenCensus, а також на найкращих ідеях та практиках спільноти.

{{% /homepage/intro-section %}}

{{< homepage/main-features >}}

{{% homepage/main-feature
      title="Інструментування, незалежно від постачальника"
      image="/img/homepage/data-sources.svg"
      imagePosition="left" %}}

Один раз налаштуйте свій код за допомогою API та SDK OpenTelemetry. Експортуйте телеметричні дані в будь-який бекенд спостережуваності: Jaeger, Prometheus, бекенди комерційних постачальників або власні рішення. Перемикайте бекенди, не змінюючи код застосунку.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Уніфіковані сигнали спостережуваності"
      image="/img/homepage/unified-signals.svg"
      imagePosition="right" %}}

Корелюйте трасування, метрики та журнали з спільним контекстом, який проходить через весь шлях запиту. Отримайте повне уявлення про поведінку застосунку у всіх його компонентах та службах.

{{% /homepage/main-feature %}}

{{% homepage/main-feature
      title="Працює всюди"
      image="/img/homepage/global-deployment.svg"
      imagePosition="left" %}}

OpenTelemetry є на 100% відкритим кодом та незалежним від постачальника. Розгортайте локально, у гібридних середовищах або у декількох хмарах із повною гнучкістю та без привʼязки до постачальника. Переміщуйте робочі навантаження туди, де вони вам потрібні.

{{% /homepage/main-feature %}}

{{% /homepage/main-features %}}

{{< homepage/signals-showcase title="Сигнали спостережуваності" >}}
{{< homepage/signal name="Трейси" image="/img/homepage/signal-traces.svg" url="docs/concepts/signals/traces/" >}}
Розподілені трасування {{< /homepage/signal >}}
{{< homepage/signal name="Метрики" image="/img/homepage/signal-metrics.svg" url="docs/concepts/signals/metrics/" >}}
Вимірювання в часі {{< /homepage/signal >}}
{{< homepage/signal name="Журнали" image="/img/homepage/signal-logs.svg" url="docs/concepts/signals/logs/" >}}
Записи з відбитками часу {{< /homepage/signal >}}
{{< homepage/signal name="Багаж" image="/img/homepage/signal-baggage.svg" url="docs/concepts/signals/baggage/" >}}
Метадані контексту {{< /homepage/signal >}} {{< /homepage/signals-showcase >}}

{{< homepage/otel-features title="Можливості OpenTelemetry" columns="2" >}}

{{< homepage/otel-feature
      image="/img/homepage/feature-auto-instrumentation.svg"
      title="Автоматичне інструментування"
      url="docs/concepts/instrumentation/zero-code/" >}} Почніть роботу за лічені хвилини завдяки інструментуванню без потреби в написанні коду для популярних фреймворків і бібліотек. Автоматичні агенти інструментування збирають трасування, метрики та журнали без зміни вашого вихідного коду. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature
      image="/img/homepage/feature-pipeline.svg"
      title="Конвеєри колекторів"
      url="docs/collector/" >}} Обробляйте, фільтруйте та скеровуйте телеметричні дані за допомогою OpenTelemetry Collector. Розгорніть колектор як агента або шлюз для отримання, обробки та експорту телеметричних даних у великому масштабі з понад 200 компонентами. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature
      image="/img/homepage/feature-observability.svg"
      title="Поширення контексту"
      url="docs/concepts/context-propagation/" >}} Автоматично звʼязуйте трасування з різних сервісів. Розподілений контекст проходить через весь шлях запиту, обʼєднуючи журнали, метрики та трасування в єдиний вигляд. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature
      image="/img/homepage/feature-multi-language.svg"
      title="Багато мов програмування"
      url="docs/languages/" >}} Нативні SDK для понад 12+ мов програмування, включаючи Java, Kotlin, Python, Go, JavaScript, .NET, Ruby, PHP, Rust, C++, Swift та Erlang. Використовуйте свою улюблену мову програмування з першокласною підтримкою з боку OpenTelemetry. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature
      image="/img/homepage/feature-production-ready.svg"
      title="Стабільність придатна для роботи"
      url="status/" >}} API трасування та метрик є стабільними для всіх основних мов програмування. Тисячі організацій використовують OpenTelemetry у своїй роботі. Підтримується CNCF та основними хмарними провайдерами. {{< /homepage/otel-feature >}}

{{< homepage/otel-feature
      image="/img/homepage/feature-openness.svg"
      title="Відкриті специфікації"
      url="docs/specs/status/" >}} Побудовано на відкритих, незалежних від постачальників специфікаціях для API, SDK та протоколу передачі даних (OTLP). Прозоре управління під егідою CNCF забезпечує довгострокову стабільність та розвиток, керований спільнотою. {{< /homepage/otel-feature >}}

{{< /homepage/otel-features >}}

{{< homepage/ecosystem-stats title="Екосистема OpenTelemetry" >}}
{{< homepage/stat type="languages" label="Мови" url="docs/languages/" >}}
{{< homepage/stat type="collector" label="Компоненти колектора" url="docs/collector/" >}}
{{< homepage/stat type="registry" label="Інтеграції" url="ecosystem/registry/" >}}
{{< homepage/stat type="vendors" label="Постачальники" url="ecosystem/vendors/" >}}
{{< /homepage/ecosystem-stats >}}

{{< homepage/adopters-showcase
    title="Довіра від лідерів галузі"
    limit="10"
    ctaText="Переглянути всіх користувачів"
    ctaUrl="ecosystem/adopters/" >}}

{{% blocks/section color="secondary" type="cncf" %}}

**OpenTelemetry є проєктом, який [розвивається][incubating] під егідою [CNCF][]**. \
Створений шляхом злиття проєктів OpenTracing та OpenCensus.

[![CNCF logo][]][cncf]

[cncf]: https://cncf.io
[cncf logo]: /img/logos/cncf-white.svg
[incubating]: https://www.cncf.io/projects/

{{% /blocks/section %}}
