---
title: Встановлення колектора
linkTitle: Встановлення
aliases: [installation]
weight: 2
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Ви можете розгорнути OpenTelemetry Collector в різних операційних системах і на різних архітектурах. У наведених нижче інструкціях показано, як завантажити та встановити останню стабільну версію Collector.

Перед тим як розпочати переконайтесь, що ви ознайомились з основами використання колектора, включаючи [шаблони розгортання][deployment patterns], [компоненти][components], та [налаштування][configuration]

## Збирання з вихідного коду {#build-from-source}

Ви можете зібрати останню версію Collector для локальної операційної системи за допомогою таких команд:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```

[deployment patterns]: /docs/collector/deploy/
[components]: /docs/collector/components/
[configuration]: /docs/collector/configuration/
