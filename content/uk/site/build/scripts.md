---
title: Допоміжні скрипти
description: >-
  Скрипти Shell, що використовуються в робочих процесах CI та локальній розробці для управління мітками, перевірки посилань, оновлення реєстру тощо.
weight: 30
default_lang_commit: 38e36ae231c523f9e54499ad6ca05de7c49501c5
cSpell:ignore: Дедуплікує
---

Всі скрипти знаходяться в [`.github/scripts/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/.github/scripts).

## check-i18n-helper.sh

Перевіряє, чи сторінки локалізації містять необхідне поле `default_lang_commit` у front matter. Якщо сторінки не містять цього поля, скрипт виводить команду виправлення:

```sh
npm run fix:i18n:new
```

## pr-approval-labels.sh

Керування мітками затвердження PR на основі стану рецензії та власності файлів. Викликається робочим процесом [`pr-approval-labels`](../ci-workflows/#pr-approval-labels).

**Як це працює:**

1. Завантажує дані PR (змінені файли, останні рецензії, поточні мітки) за допомогою `gh`.
2. Визначає членів команди `docs-approvers` за допомогою API GitHub org.
3. Визначає необхідні команди SIG, зіставляючи змінені файли з [`.github/component-owners.yml`][owners] (аналізує YAML вручну, без залежності від `yq`).
4. Перевіряє, чи кожна необхідна група має схвальний відгук.
5. Додає або видаляє мітки, використовуючи логіку трьох станів (`true`/`false`/`unknown`), щоб уникнути зміни міток, коли членство в команді не може бути отримано.

[owners]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml

**Потрібні змінні:** `REPO`, `PR`, `GITHUB_TOKEN`.

## update-registry-versions.sh

Автоматично оновлює версії пакунків у файлі `data/registry/*.yml`, запитуючи дані з висхідних реєстрів. Підтримує: npm, Packagist, RubyGems, Go, NuGet, Hex, Maven.

- У CI (набір `GITHUB_ACTIONS`): створює гілку та відкриває PR.
- Локально: стандартно працює в режимі **dry-run**. Використовуйте `-f`, щоб примусово зробити реальне виконання.

Дедуплікує PR, генеруючи тег SHA-1 із підсумку оновлення.

Коли версії змінилися, скрипт оновлює [кеш посилань][link cache] перед фіксацією, оскільки оновлення реєстру можуть додавати або видаляти зовнішні URL. Тимчасова помилка під час такого оновлення може призвести до того, що PR бота матиме червоний статус `CACHE updates committed?`, навіть якщо посилання пройшли перевірку; додайте коментар [`/fix:link-cache`][] до PR-запиту, щоб виправити це. Якщо ж оновлення призвело до справді зламаного URL, PR бота отримає червоний статус під час самої перевірки посилань; виправте URL-адресу, а не запускайте виправлення кешу знову.

<!-- prettier-ignore-start -->
[`/fix:link-cache`]: /docs/contributing/pull-requests/#fixing-prs-in-github
[link cache]: ../link-checking/#link-cache
<!-- prettier-ignore-end -->
