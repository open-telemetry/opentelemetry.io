---
title: Стан
menu: { main: { weight: 30 } }
aliases: [/project-status, /releases]
description: Рівень зрілості основних компонентів OpenTelemetry
type: docs
body_class: td-no-left-sidebar
default_lang_commit: e05fefe6c9f7d8b159d9a9a95128098c646c78c4
---

OpenTelemetry складається з [декількох компонентів](/docs/concepts/components/), деякі з яких є мовно-специфічними, а інші — мовно-агностичними. Переглядаючи [статус](/docs/specs/otel/versioning-and-stability/), переконайтеся, що ви шукаєте статус на сторінці відповідного компонента. Наприклад, статус сигналу у специфікації може не збігатися зі статусом сигналу у конкретному мовному SDK.

## API та SDK мов {#language-apis-sdks}

Статус розробки або рівень зрілості [API або SDK для мови](/docs/languages/) див. у наступній таблиці:

{{% uk/telemetry-support-table " " %}}

Для більш детальної інформації про відповідність специфікації для кожної реалізації див. [Матрицю відповідності специфікації](https://github.com/open-telemetry/opentelemetry-specification/blob/main/spec-compliance-matrix.md).

## Collector

Статус колектора такий: [змішаний](/docs/specs/otel/document-status/#mixed), оскільки основні компоненти колектора наразі мають змішані [рівні стабільності](https://github.com/open-telemetry/opentelemetry-collector#stability-levels).

**Компоненти колектора** відрізняються за рівнем зрілості. Стабільність кожного компонента задокументовано у його файлі `README.md`. Список усіх доступних компонентів колектора можна знайти у [реєстрі](/ecosystem/registry/?language=collector).

## Kubernetes Operator

Статус Оператора OpenTelemetry — [змішаний](/docs/specs/otel/document-status/#mixed), оскільки він розгортає компоненти з різними статусами.

Сам оператор знаходиться у стані [mixed](/docs/specs/otel/document-status/#mixed) з компонентами у станах `v1alpha1` та `v1beta1`.

## Специфікації {#specifications}

Про стан розробки або рівень зрілості [специфікації](/docs/specs/otel/) див. нижче: [Зведений опис стану специфікації](/docs/specs/status/).
