---
title: Kafka
default_lang_commit: 10fe33751d6b62406aa77cf2c21fbb6b08a4cc12
cSpell:ignore: Dotel
---

Kafka використовується як служба черги повідомлень для зʼєднання служби оформлення замовлень зі службами бухгалтерського обліку та виявлення шахрайства.

[Сирці служби Kafka](https://github.com/open-telemetry/opentelemetry-demo/blob/main/src/kafka/)

## Конфігурація {#configuration}

| Змінна        | Стандартно | Опис                                                                                                                                                                  |
| ------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `KAFKA_TOPIC` | `orders`   | Тема, у яку служба оформлення замовлень надсилає повідомлення про замовлення, і з якої служби бухгалтерського обліку та виявлення шахрайства споживають повідомлення. |

Усі три служби читають ту саму змінну, тому змінюйте її у `.env` (або `.env.override`), а не в окремій службі, інакше виробник і споживачі опиняться на різних темах.

## Автоінструментування {#auto-instrumentation}

Ця служба покладається на агент OpenTelemetry Java та вбудований [Модуль JMX Metric Insight](https://github.com/open-telemetry/opentelemetry-java-instrumentation/tree/main/instrumentation/jmx-metrics/javaagent) для збору [метрик брокера Kafka](https://github.com/open-telemetry/opentelemetry-java-instrumentation/blob/main/instrumentation/jmx-metrics/library/kafka-broker.md) та відправлення їх до колектора через OTLP.

Агент передається в процес за допомогою аргументу командного рядка `-javaagent`. Аргументи командного рядка додаються через `KAFKA_OPTS` у `Dockerfile`.

```dockerfile
ENV KAFKA_OPTS="-javaagent:/tmp/opentelemetry-javaagent.jar -Dotel.jmx.target.system=kafka-broker"
```
