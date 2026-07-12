---
title: Скрипти NPM
description: >-
  Скрипти NPM для побудови, обслуговування, перевірки та підтримки вебсайту OpenTelemetry.
weight: 20
default_lang_commit: fb5b6745a4df6d18863f6d8dcac5a79f86fec0ce
todo: Keep table entries sorted
cSpell:ignore: Перегенерація мініфікацією напр
---

Визначення скриптів знаходиться у файлі [`package.json`][] в корені репозиторію. Скрипти запускаються командою `npm run` _`SCRIPT_NAME`_.

## Термінологія {#nomenclature}

- **Внутрішні скрипти**
  - Скрипти, що починаються з `_`, є внутрішніми допоміжними скриптами і не призначені для безпосереднього запуску.
  - Так само й скрипти `NAME::pre` та `NAME::post` — явно викликані кроки pre та post скрипту `NAME`.
- **Стандартний чи `:all` варіант скриптів**
  - Скрипти **`check`**, **`fix`** та **`test`** запускають найчастіше потрібні вкладені скрипти для кожної дії.
  - Варіанти **`*:all`** — `check:all`, `fix:all`, `test:all` — запускають ширші набори вкладених скриптів; сфера дії кожного варіанта зазначена у його рядку таблиці.

## Встановлення та оновлення залежностей {#installing-and-updating-dependencies}

| Скрипт            | Опис                                                                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `ci:min`          | [Точне інертне встановлення][lock-exact inert install] для CI: без скриптів життєвого циклу, без опціональних залежностей.               |
| `ci:prepare`      | Налаштування після `ci:min`: [завантажити зафіксований бінарний файл Hugo][fetch the pinned Hugo binary], потім `prepare`.               |
| `install:safe`    | [Точне локальне налаштування][lock-exact local setup]: інертне встановлення зі збереженням опціональних залежностей, потім `ci:prepare`. |
| `prepare`         | Крок встановлення: `get:submodule`, потім [точне встановлення залежностей теми][lock-exact theme dependency install] Docsy.              |
| `update:hugo`     | Встановлення останньої версії hugo-extended; оновлення її [`allowScripts` схвалення][`allowScripts` approval] разом із версією.          |
| `update:packages` | Запуск npm-check-updates для оновлення залежностей з урахуванням [періоду охолодження][release cooldown].                                |

## Build та serve {#build-and-serve}

| Скрипт             | Опис                                                                |
| ------------------ | ------------------------------------------------------------------- |
| `build:full`       | Повна збірка сайту. Детальніше див. [Типи збірки][build kinds].     |
| `build:lean`       | Скорочена збірка сайту. Детальніше див. [Типи збірки][build kinds]. |
| `build:preview`    | Повна збірка з мініфікацією (напр. для Netlify preview).            |
| `build:production` | Фінальна збірка Hugo з мініфікацією.                                |
| `build`            | Збирає сайт. Стандартно скорочена; див. [Типи збірки][build kinds]. |
| `clean`            | Run `make clean`.                                                   |
| `serve:hugo`       | Запуск сервера Hugo зі створенням сторінок у памʼяті.               |
| `serve`            | Запуск сервера Hugo для розробки (стандартно; повний рендеринг).    |

## Перевірки {#checking}

| Скрипт                 | Опис                                                                              |
| ---------------------- | --------------------------------------------------------------------------------- |
| `check:all`            | Запуск всіх скриптів перевірки послідовно.                                        |
| `check:code-excerpts`  | Перевірка фрагментів коду, помилка якщо потрібні оновлення.                       |
| `check:codeowners`     | Перевірка секції локалізації в CODEOWNERS відповідно до реєстру.                  |
| `check:collector-sync` | Запуск перевірки collector-sync.                                                  |
| `check:expired`        | Перелік застарілого вмісту (на основі front matter).                              |
| `check:filenames`      | [Перевірка назв файлів та виявлення застарілих файлів/тек][fn].                   |
| `check:format`         | Перевірки Prettier та переносів.                                                  |
| `check:i18n`           | Перевірка front matter локалізації (`default_lang_commit`).                       |
| `check:l10n`           | Перевірка локалізації.                                                            |
| `check:links:diff`     | Перевірка посилань Lychee лише для змінених файлів.                               |
| `check:links:internal` | Офлайн-перевірка посилань (тільки внутрішні посилання); спочатку lean.            |
| `check:links`          | [Перевірка посилань][link check] всього сайту за допомогою Lychee; спочатку lean. |
| `check:markdown:specs` | Markdown lint для фрагментів spec в `tmp/`.                                       |
| `check:markdown`       | Markdown lint (вміст та проєкти).                                                 |
| `check:registry`       | Перевірка YAML реєстру в `data/registry/`.                                        |
| `check:spelling`       | Перевірка правопису cspell в content, data та layout Markdown.                    |
| `check:text`           | textlint в content та data.                                                       |
| `check`                | Запуск найчастіше використовуваних скриптів перевірки послідовно.                 |

## Виправлення {#fixing}

| Скрипт                        | Опис                                                                         |
| ----------------------------- | ---------------------------------------------------------------------------- |
| `fix`                         | Запуск найпоширеніших виправлень.                                            |
| `fix:code-excerpts`           | Оновлення фрагментів коду.                                                   |
| `fix:codeowners`              | Перегенерація секції локалізації в CODEOWNERS відповідно до реєстру.         |
| `fix:all`                     | Запуск всіх скриптів виправлень.                                             |
| `fix:format`                  | Застосування правил Prettier та прибирання зайвих пробілів в кінці рядків.   |
| `fix:format:staged`           | Форматування тільки staged файлів.                                           |
| `fix:i18n`                    | Додавання виправлення i18n front matter (`fix:i18n:new`, `fix:i18n:status`). |
| `fix:l10n`                    | Додавання виправлення локалізації.                                           |
| `fix:link-cache`              | Перевірка посилань, оновлення зафіксованого [`.lycheecache`][].              |
| `fix:link-cache:double-check` | [Повторно перевірити збійні посилання браузерним зондом][dc].                |
| `fix:link-cache:refresh`      | Очистити найстаріші запити кешу, потім `fix:link-cache`.                     |
| `fix:markdown`                | Виправлення Markdown lint помилок та прибирання пробілів в кінці рядків.     |
| `fix:submodule`               | Оновлення, повторне закріплення та виведення списку версій submodule.        |
| `fix:filenames`               | [Перейменування файлів та видалення застарілих файлів/тек][fn].              |
| `fix:dict`                    | Сортувати списки слів в cspell та нормалізувати front matter.                |
| `fix:expired`                 | Вилучення фалів знайдених за допомогою `check:expired`.                      |
| `fix:text`                    | Запуск textlint з --fix.                                                     |
| `fix:collector-sync:lint`     | Запуск ruff з --fix у collector-sync.                                        |
| `format`                      | Псевдонім для Prettier write (шляхи content та nowrap).                      |

## Submodules та content {#submodules-and-content}

| Скрипт             | Опис                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------- |
| `code-excerpts`    | Оновлення фрагментів коду. ЗАСТАРІЛО: використовуйте `fix:code-excerpts` або `check:code-excerpts`. |
| `cp:spec`          | Копіювання вмісту spec (content-modules).                                                           |
| `get:submodule`    | Ініціалізація/оновлення git submodules (встановіть `GET=no` щоб оминути).                           |
| `pin:submodule`    | Зафіксувати версію submodule (опціонально `PIN_SKIP`).                                              |
| `schemas:update`   | Оновлення OpenTelemetry spec submodule та вмісту.                                                   |
| `update:submodule` | Оновлення submodules до останньої версії та отримання їх теґів.                                     |

## Тести та CI {#test-and-ci}

| Скрипт                     | Опис                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------------------- |
| `diff:check`               | Попередження, якщо робоче дерево має незбережені зміни.                                            |
| `diff:fail`                | Помилка, якщо робоче дерево має зміни (наприклад, після збірки).                                   |
| `fix-and-test:all`         | Виконує всі виправлення (включно з i18n), потім перевірки; посилання перевіряються один раз.[^fat] |
| `is:clean`                 | Помилка, якщо робоче дерево Git має зміни, включно з файлами, які Git не відстежує.                |
| `netlify-build:preview`    | Збірка Netlify deploy preview.                                                                     |
| `netlify-build:production` | Збірка виробничого сайту Netlify.                                                                  |
| `test-and-fix`             | Виконує скрипти виправлення (за винятком i18n/link-cache/submodule), потім перевірки.              |
| `test:all`                 | Виконує `test:base`, потім `test:compound-tests`.                                                  |
| `test:base`                | Базові тести (такі ж, як `check`).                                                                 |
| `test:collector-sync`      | Тести collector-sync.                                                                              |
| `test:compound-tests`      | Виконує складені скрипти `test:*-*`.[^categories]                                                  |
| `test:double-check:live`   | Live smoke-перевірка [проби double-check][dc].                                                     |
| `test:edge-functions:live` | Опціональний live suite `node:test`; підтримує `--help`.                                           |
| `test:edge-functions`      | Node test runner для `netlify/edge-functions/**/*.test.ts`.                                        |
| `test:local-tools`         | Node test runner для `scripts/**/*.test.mjs`.[^categories]                                         |
| `test:local-tools:lychee`  | Частина `test:local-tools`, що потребує бінарного файлу lychee; пропускається, якщо його немає.    |
| `test:public`              | Виконує перевірки `tests/public/` над зібраним сайтом.[^categories]                                |
| `test`                     | Виконує найбільш часто потрібні тести.                                                             |

[^categories]: Ці скрипти відповідають конвенціям іменування тестових скриптів; див. [Категорії тестів](../../testing/#test-categories).

[^fat]: Зазвичай для обслуговування: запускає `fix:link-cache` (перевірка посилань, оновлення кешу посилань) після виправлень контенту; використовує runner `all` з опцією keep-going, щоб зафіксувати всі виправлення. Фаза перевірки виключає `check:links` (`fix:link-cache` покриває це) та `check:i18n` (зайве після того, як `fix:i18n` записує стан відхилення). Див. [Housekeeping](../ci-workflows/#housekeeping).

## Утиліти {#utilities}

| Скрипт                         | Опис                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `all`                          | Запускає всі скрипти, навіть якщо деякі завершуються збоєм; завершується з ненульовим статусом, якщо хоч один з них не вдався. |
| `generate:config:links`        | Генерація git-ігнорованого `lychee.toml` з `lychee.base.toml` + front matter сторінок.                                         |
| `locale-auto-merge`            | [Locale auto-merge helper CLI][locale-auto-merge] (`--help`).                                                                  |
| `log:build`, `log:check:links` | Запустити відповідний скрипт, вивести (tee) вивід в `tmp/` та передати код завершення скрипту.                                 |
| `seq`                          | Запускає вказані скрипти в зазначеному порядку; виходить після першого збою.                                                   |

<!-- prettier-ignore-start -->
[`allowScripts` approval]: ../dependencies/#script-bearing-packages
[`.lycheecache`]: ../link-checking/#link-cache
[`package.json`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json
[build kinds]: ../#build-kinds
[dc]: ../link-checking/#double-check
[fetch the pinned Hugo binary]: ../dependencies/#install-contracts
[fn]: /docs/contributing/pr-checks/#filename-check
[link check]: ../link-checking/
[locale-auto-merge]: ../ci-workflows/#locale-auto-merge
[lock-exact inert install]: ../dependencies/#install-contracts
[lock-exact local setup]: ../dependencies/#install-contracts
[lock-exact theme dependency install]: ../dependencies/#install-contracts
[release cooldown]: ../dependencies/#release-cooldown
<!-- prettier-ignore-end -->
