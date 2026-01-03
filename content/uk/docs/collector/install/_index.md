---
title: Встановлення колектора
linkTitle: Встановлення
aliases: [installation]
weight: 2
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

Ви можете розгорнути OpenTelemetry Collector в різних операційних системах і на різних архітектурах. У наведених нижче інструкціях показано, як завантажити та встановити останню стабільну версію Collector.

Якщо ви не знайомі з моделями розгортання, компонентами та репозиторіями, що застосовуються до OpenTelemetry Collector, спочатку ознайомтеся зі сторінками [Збір даних][Data Collection] та [Методи розгортання][Deployment Methods].

## Збирання з вихідного коду {#build-from-source}

Ви можете зібрати останню версію Collector для локальної операційної системи за допомогою таких команд:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[data collection]: /docs/concepts/components/#collector
[deployment methods]: ../deployment/
