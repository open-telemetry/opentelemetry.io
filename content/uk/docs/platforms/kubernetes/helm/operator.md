---
title: Чарт OpenTelemetry Operator
linkTitle: Чарт Operator
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

## Вступ {#introduction}

[OpenTelemetry Operator](/docs/platforms/kubernetes/operator) — це Kubernetes оператор, який керує [OpenTelemetry Collectors](/docs/collector) та автоінструментуванням робочих навантажень. Один зі способів встановлення OpenTelemetry Operator — це використання [OpenTelemetry Operator Helm Chart](https://github.com/open-telemetry/opentelemetry-helm-charts/tree/main/charts/opentelemetry-operator).

Для детального використання OpenTelemetry Operator відвідайте його [документацію](/docs/platforms/kubernetes/operator).

### Встановлення чарту {#installing-the-chart}

Щоб встановити чарт з іменем релізу `my-opentelemetry-operator`, виконайте наступні команди:

```console
helm repo add open-telemetry https://open-telemetry.github.io/opentelemetry-helm-charts
helm install my-opentelemetry-operator open-telemetry/opentelemetry-operator \
  --set "manager.collectorImage.repository=otel/opentelemetry-collector-k8s" \
  --set admissionWebhooks.certManager.enabled=false \
  --set admissionWebhooks.autoGenerateCert.enabled=true
```

Це встановить OpenTelemetry Operator з самопідписним сертифікатом та секретом.

### Конфігурація {#configuration}

Стандартні значення у `values.yaml` для Operator helm chart готові до встановлення, але очікується, що Cert Manager вже присутній у кластері.

У Kubernetes, для того, щоб API сервер міг спілкуватися з компонентом webhook, webhook потребує TLS сертифікат, якому API сервер довіряє. Є кілька різних способів створити/налаштувати необхідний TLS сертифікат.

- Найпростіший і стандартний метод — встановити [cert-manager](https://cert-manager.io/docs/) і встановити `admissionWebhooks.certManager.enabled` у `true`. У цьому випадку cert-manager створить самопідписний сертифікат. Дивіться [встановлення cert-manager](https://cert-manager.io/docs/installation/kubernetes/) для отримання додаткової інформації.
- Ви можете надати свого власного Issuer, налаштувавши значення `admissionWebhooks.certManager.issuerRef`. Вам потрібно буде вказати `kind` (Issuer або ClusterIssuer) та `name`. Зверніть увагу, що цей метод також вимагає встановлення cert-manager.
- Ви можете використовувати автоматично створений самопідписний сертифікат, встановивши `admissionWebhooks.certManager.enabled` у `false` та `admissionWebhooks.autoGenerateCert.enabled` у `true`. Helm створить самопідписний сертифікат та секрет для вас.
- Ви можете використовувати свій власний створений самопідписний сертифікат, встановивши обидва `admissionWebhooks.certManager.enabled` та `admissionWebhooks.autoGenerateCert.enabled` у `false`. Вам потрібно буде надати необхідні значення для `admissionWebhooks.cert_file`, `admissionWebhooks.key_file` та `admissionWebhooks.ca_file`.
- Ви можете завантажити власні webhooks та сертифікат, вимкнувши `.Values.admissionWebhooks.create` та `admissionWebhooks.certManager.enabled`, встановивши імʼя вашого власного секрету сертифіката у `admissionWebhooks.secretName`.
- Ви можете повністю вимкнути webhooks, вимкнувши `.Values.admissionWebhooks.create` та встановивши змінну середовища `.Values.manager.env.ENABLE_WEBHOOKS` на `false`.

Усі варіанти конфігурації (з коментарями), доступні у чарті, можна переглянути у [файлі values.yaml](https://github.com/open-telemetry/opentelemetry-helm-charts/blob/main/charts/opentelemetry-operator/values.yaml).
