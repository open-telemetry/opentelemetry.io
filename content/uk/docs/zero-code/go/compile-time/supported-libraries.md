---
title: Підтримувані бібліотеки
description: Бібліотеки та фреймворки, що інструментуються з коробки.
weight: 10
default_lang_commit: f796f16d521045c1a607f9e06daa162403c36d24
# prettier-ignore
cSpell:ignore: anthropics gonic logrus openai runtimemetrics segmentio sirupsen
---

Інструмент постачає пакунки інструментування для наступних бібліотек та фреймворків. Коли ваш застосунок або його залежності використовують одну з них, відповідне інструментування впроваджується автоматично під час збірки.

| Бібліотека або фреймворк     | Import path                              | Інструментовані операції            |
| ---------------------------- | ---------------------------------------- | ----------------------------------- |
| HTTP (стандартна бібліотека) | `net/http`                               | Запити клієнта та сервера           |
| gRPC                         | `google.golang.org/grpc`                 | Виклики клієнта та сервера          |
| SQL бази даних               | `database/sql`                           | Виклики бази даних                  |
| Gin                          | `github.com/gin-gonic/gin`               | Запити сервера                      |
| Redis                        | `github.com/redis/go-redis/v9`           | Команди клієнта                     |
| MongoDB                      | `go.mongodb.org/mongo-driver/mongo`      | Команди клієнта                     |
| Kafka                        | `github.com/segmentio/kafka-go`          | Продуковані та спожиті повідомлення |
| OpenAI                       | `github.com/openai/openai-go` (v1 – v3)  | Виклики клієнта                     |
| Anthropic                    | `github.com/anthropics/anthropic-sdk-go` | Виклики клієнта                     |
| Kubernetes client            | `k8s.io/client-go/tools/cache`           | Операції кешу інформера             |
| slog (стандартна бібліотека) | `log/slog`                               | Записи логів                        |
| Logrus                       | `github.com/sirupsen/logrus`             | Записи логів                        |

HTTP та gRPC інструментування продукують відрізки та метрики, включаючи автоматичне [розповсюдження контексту](/docs/concepts/context-propagation/) між сервісами. Інструментування слідує
[семантичним домовленостям](/docs/specs/semconv/) OpenTelemetry для кожної бібліотеки. Метрики середовища виконання Go збираються стандартно і можуть бути вимкнені додаванням `runtimemetrics` до `OTEL_GO_DISABLED_INSTRUMENTATIONS`.

Набір підтримуваних версій бібліотек оголошується правилами кожного інструментування. Для авторитетного актуального списку дивіться [пакунки інструментування](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/tree/main/instrumentation) у репозиторії.

## Запит бібліотеки {#requesting-a-library}

Якщо бібліотека, на яку ви покладаєтеся, ще не інструментована, створіть [тікет](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/issues). Ви також можете додати інструментування самостійно: [посібник з інструментування](https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/blob/main/docs/instrument-guide.md) репозиторію проводить через визначення правил та реалізацію гачків для нової бібліотеки.
