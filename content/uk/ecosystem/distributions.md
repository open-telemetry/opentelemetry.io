---
title: Сторонні дистрибутиви
linkTitle: Дистрибутиви
description: Список дистрибутивів OpenTelemetry з відкритим вихідним кодом, які підтримуються третіми сторонами.
default_lang_commit: 5489ba34bff91356aa2c501cd55f07eeb30cc355
---

OpenTelemetry [дистрибутиви][distributions] — це спосіб налаштування [компонентів][components] OpenTelemetry, щоб їх було легше розгортати та використовувати з конкретними бекендами для спостереження.

Будь-хто може налаштувати компоненти OpenTelemetry з урахуванням бекенду, [постачальника][vendor] або специфічних змін для кінцевого користувача. Ви можете використовувати компоненти OpenTelemetry без дистрибутиву, але в деяких випадках дистрибутив може спростити роботу, наприклад, коли постачальник має особливі вимоги.

Наступний перелік містить зразок дистрибутивів OpenTelemetry та компонентів, які вони налаштовують. Для [дистрибутивів OpenTelemetry Collector](/docs/collector/) дивіться [дистрибутиви Колектора](/docs/collector/distributions/).

{{% uk/ecosystem/distributions-table filter="non-collector"%}}

## Як додати свій дистрибутив {#how-to-add}

Щоб ваш дистрибутив був включений до списку, [надішліть PR][submit a PR] з записом, доданим до [списку дистрибутивів][distributions list]. Запис повинен містити наступне:

- Посилання на головну сторінку вашого дистрибутиву
- Посилання на документацію, яка пояснює, як використовувати дистрибутив
- Список компонентів, які містить ваш дистрибутив
- Обліковий запис GitHub або електронну адресу контактної особи, щоб ми могли звʼязатися у разі виникнення питань

> [!NOTE]
>
> - Якщо ви надаєте зовнішню інтеграцію OpenTelemetry для будь-якої бібліотеки, сервісу або застосунку, розгляньте можливість [додавання його до реєстру](/ecosystem/registry/adding).
> - Якщо ви використовуєте OpenTelemetry для спостереження як кінцевий користувач і не надаєте жодних послуг навколо OpenTelemetry, дивіться [Користувачі](/ecosystem/adopters).
> - Якщо ви надаєте рішення, яке використовує OpenTelemetry для надання спостережуваності кінцевим користувачам, дивіться [Постачальники](/ecosystem/vendors).

[submit a PR]: /docs/contributing/pull-requests/

{{% include keep-up-to-date.md дистрибутив %}}

[components]: /docs/concepts/components/
[distributions]: /docs/concepts/distributions/
[distributions list]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/ecosystem/distributions.yaml
[vendor]: ../vendors/
