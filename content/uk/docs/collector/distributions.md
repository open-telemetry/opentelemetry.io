---
title: Дистрибутиви
weight: 25
default_lang_commit: 6f3712c5cda4ea79f75fb410521880396ca30c91
---

Проєкт OpenTelemetry наразі пропонує попередньо зібрані [дистрибутиви][distributions] Колектора. Компоненти, включені в дистрибутиви, можна знайти в `manifest.yaml` кожного дистрибутиву.

[distributions]: https://github.com/open-telemetry/opentelemetry-collector-releases/tree/main/distributions

{{% uk/ecosystem/distributions-table filter="first-party-collector" %}}

## Власні дистрибутиви {#custom-distributions}

Наявні дистрибутиви, що надаються проєктом OpenTelemetry, можуть не відповідати вашим потребам. Наприклад, ви хочете меншу за розміром версію, чи маєте потребу реалізувати власну функціональність, таку як [розширення автентифікатора](../building/authenticator-extension), [приймачі](../building/receiver), процесори, експортери або [конектори](../building/connector). Інструмент, який використовується для створення дистрибутивів [ocb](../custom-collector) (OpenTelemetry Collector Builder) доступний для створення власних дистрибутивів.

## Сторонні дистрибутиви {#third-party-distributions}

Деякі організації надають дистрибутиви Колектора з додатковими можливостями або для покращення зручності використання. Нижче наведено список дистрибутивів Колектора, що підтримуються іншими.

{{% uk/ecosystem/distributions-table filter="third-party-collector" %}}

## Додавання вашого дистрибутиву Колектора {#how-to-add}

Щоб ваш дистрибутив Колектора був включений до списку, [створіть PR][submit a PR] з записом, доданим до [списку дистрибутивів][distributions list]. Запис має містити таку інформацію:

- Посилання на головну сторінку вашого дистрибутиву
- Посилання на документацію, яка пояснює, як використовувати дистрибутив
- Обліковий запис GitHub або адреса електронної пошти контактної особи, щоб ми могли звʼязатися у разі виникнення запитань

[submit a PR]: /docs/contributing/pull-requests/
[distributions list]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
