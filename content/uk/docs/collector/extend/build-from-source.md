---
title: Збирання з вихідного коду
description: Дізнайтеся, як створити OpenTelemetry Collector з вихідного коду
weight: 100
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

Ви можете створити останню версію Collector на основі локальної операційної системи за допомогою таких команд:

```sh
git clone https://github.com/open-telemetry/opentelemetry-collector.git
cd opentelemetry-collector
make install-tools
make otelcorecol
```
