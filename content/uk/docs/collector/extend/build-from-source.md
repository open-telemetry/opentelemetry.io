---
title: Збирання з вихідного коду
description: Дізнайтеся, як створити OpenTelemetry Collector з вихідного коду
weight: 100
default_lang_commit: 9cdf79c9345a05fb82d0e67132c9f68dabddadba
---

Ви можете створити останню версію Collector на основі локальної операційної системи за допомогою таких команд:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```
