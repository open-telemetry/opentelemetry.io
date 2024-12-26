---
title: Допоміжні скрипти
description: >-
  Скрипти Shell, що використовуються в робочих процесах CI та локальній розробці для управління мітками, перевірки посилань, оновлення реєстру тощо.
weight: 30
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: Дедуплікує
---

Всі скрипти знаходяться в [`.github/scripts/`](https://github.com/open-telemetry/opentelemetry.io/tree/main/.github/scripts).

## check-i18n-helper.sh

Перевіряє, чи сторінки локалізації містять необхідне поле `default_lang_commit` у front matter. Якщо сторінки не містять цього поля, скрипт виводить команду виправлення:

```sh
npm run fix:i18n:new
```

## check-links-shard.sh

Виконує перевірку посилань для певного фрагмента, додаючи регулярний вираз `IgnoreDirs`, специфічний для фрагмента, до згенерованого `.htmltest.yml`.

```sh
.github/scripts/check-links-shard.sh [-qk] <shard-id> <shard-regex>
```

| Прапорець | Опис                                                                       |
| --------- | -------------------------------------------------------------------------- |
| `-h`      | Показати довідку                                                           |
| `-k`      | Залишати згенерований `.htmltest.yml` (стандартно: видаляти після запуску) |
| `-q`      | Тихий режим                                                                |

## check-refcache.sh

Порівнює специфічні для фрагмента файли `refcache.json` з основним `static/refcache.json`, щоб виявити невідповідності кешу після перевірки посилань.

```sh
.github/scripts/check-refcache.sh [directory]
```

Стандартна тека: `tmp/check-refcache`. Якщо виявлено відмінності, скрипт пропонує запустити `npm run fix:refcache` або додати коментар `/fix:refcache` до PR.

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
