---
title: Скрипти NPM
description: >-
  Скрипти NPM для побудови, обслуговування, перевірки та підтримки вебсайту OpenTelemetry.
weight: 20
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
todo: Keep table entries sorted
# prettier-ignore
cSpell:ignore: lycheecache Перегенерація мініфікацією напр
---

Визначення скриптів знаходиться у файлі [`package.json`](https://github.com/open-telemetry/opentelemetry.io/blob/main/package.json) в корені. Скрипти запускаються командою`npm run <script-name>`. Скрипти, що містять в назві на початку символ `_` є внутрішніми допоміжними скриптами і не призначені для безпосереднього запуску.

> [!NOTE] Стандартний чи `:all` варант скриптів
>
> Скрипти **`check`**, **`fix`** та **`test`** використовують інші скрипти, потрібні для кожної дії. Для запуску всіх допоміжних скриптів, використовуйте варіант **`*:all`**:
>
> - `check:all`
> - `fix:all`
> - `test:all`

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
| `serve:netlify`    | Запуск Netlify Dev з використанням Hugo.                            |
| `serve`            | Запуск сервера Hugo для розробки (стандартно; повний рендеринг).    |

## Перевірки {#checking}

| Скрипт                 | Опис                                                                   |
| ---------------------- | ---------------------------------------------------------------------- |
| `check:all`            | Запуск всіх скриптів перевірки послідовно.                             |
| `check:code-excerpts`  | Перевірка фрагментів коду, помилка якщо потрібні оновлення.            |
| `check:codeowners`     | Перевірка секції локалізації в CODEOWNERS відповідно до реєстру.       |
| `check:collector-sync` | Запуск перевірки collector-sync.                                       |
| `check:expired`        | Перелік застарілого вмісту (на основі front matter).                   |
| `check:filenames`      | [Перевірка назв файлів та виявлення застарілих файлів/тек][fn].        |
| `check:format`         | Перевірки Prettier та переносів.                                       |
| `check:i18n`           | Перевірка front matter локалізації (`default_lang_commit`).            |
| `check:l10n`           | Перевірка локалізації.                                                 |
| `check:links:diff`     | Перевірка посилань Lychee лише для змінених файлів (пілот).            |
| `check:links:htmltest` | Перевірка посилань всього сайту за допомогою htmltest; спочатку lean.  |
| `check:links:lychee`   | Перевірка посилань всього сайту за допомогою Lychee; спочатку lean.    |
| `check:links`          | Перевірка посилань всього сайту (htmltest, стандартно); спочатку lean. |
| `check:markdown:specs` | Markdown lint для фрагментів spec в `tmp/`.                            |
| `check:markdown`       | Markdown lint (вміст та проєкти).                                      |
| `check:registry`       | Перевірка YAML реєстру в `data/registry/`.                             |
| `check:spelling`       | Перевірка правопису cspell в content, data та layout Markdown.         |
| `check:text`           | textlint в content та data.                                            |
| `check`                | Запуск найчастіше використовуваних скриптів перевірки послідовно.      |

## Виправлення {#fixing}

| Скрипт                    | Опис                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| `fix`                     | Запуск найпоширеніших виправлень.                                              |
| `fix:code-excerpts`       | Оновлення фрагментів коду.                                                     |
| `fix:codeowners`          | Перегенерація секції локалізації в CODEOWNERS відповідно до реєстру.           |
| `fix:all`                 | Запуск всіх скриптів виправлень.                                               |
| `fix:format`              | Застосування правил Prettier та прибирання зайвих пробілів в кінці рядків.     |
| `fix:format:staged`       | Форматування тільки staged файлів.                                             |
| `fix:i18n`                | Додавання виправлення i18n front matter (`fix:i18n:new`, `fix:i18n:status`).   |
| `fix:l10n`                | Додавання виправлення локалізації.                                             |
| `fix:markdown`            | Виправлення Markdown lint помилок та прибирання пробілів в кінці рядків.       |
| `fix:refcache`            | Очистити refcache і повторно виконати перевірку посилань (оновлення refcache). |
| `fix:refcache:refresh`    | Очистити refcache за кількістю..                                               |
| `fix:submodule`           | Зафіксувати версію submodule (теж саме що й `pin:submodule`).                  |
| `fix:filenames`           | [Перейменування файлів та видалення застарілих файлів/тек][fn].                |
| `fix:dict`                | Сортувати списки слів в cspell та нормалізувати front matter.                  |
| `fix:expired`             | Вилучення фалів знайдених за допомогою `check:expired`.                        |
| `fix:text`                | Запуск textlint з --fix.                                                       |
| `fix:collector-sync:lint` | Запуск ruff з --fix у collector-sync.                                          |
| `format`                  | Псевдонім для Prettier write (шляхи content та nowrap).                        |

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
| `netlify-build:preview`    | `build:preview` потім `diff:check`.                                                                |
| `netlify-build:production` | `build:production` потім `diff:check`.                                                             |
| `test-and-fix`             | Виконує скрипти виправлення (за винятком i18n/refcache/submodule), потім перевірки.                |
| `test:all`                 | Виконує `test:base`, потім `test:compound-tests`.                                                  |
| `test:base`                | Базові тести (такі ж, як `check`).                                                                 |
| `test:collector-sync`      | Тести collector-sync.                                                                              |
| `test:compound-tests`      | Виконує складені скрипти `test:*-*`.[^categories]                                                  |
| `test:edge-functions:live` | Опціональний live suite `node:test`; підтримує `--help`.                                           |
| `test:edge-functions`      | Node test runner для `netlify/edge-functions/**/*.test.ts`.                                        |
| `test:local-tools`         | Node test runner для `scripts/**/*.test.mjs`.[^categories]                                         |
| `test:local-tools:lychee`  | Частина `test:local-tools`, що потребує бінарного файлу lychee (див. Примітки).                    |
| `test:public`              | Виконує перевірки `tests/public/` над зібраним сайтом.[^categories]                                |
| `test`                     | Виконує найбільш часто потрібні тести.                                                             |

[^categories]: Ці скрипти відповідають конвенціям іменування тестових скриптів; див. [Категорії тестів](../../testing/#test-categories).

[^fat]: Зазвичай для обслуговування: запускає `fix:refcache` (очищення, потім перевірка посилань) після виправлень контенту; використовує runner `all` з опцією keep-going, щоб зафіксувати всі виправлення. Фаза перевірки виключає `check:links` (`fix:refcache` покриває це) та `check:i18n` (зайве після того, як `fix:i18n` записує стан відхилення). Див. [Housekeeping](../ci-workflows/#housekeeping).

## Утиліти {#utilities}

| Скрипт                         | Опис                                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------------ |
| `seq`                          | Запускає вказані скрипти в зазначеному порядку; виходить після першого збою.         |
| `all`                          | Запускає всі скрипти; виконуються всі скрипти навіть якщо якийсь з низ зазнав збою.  |
| `locale-auto-merge`            | [Locale auto-merge helper CLI][locale-auto-merge] (`--help`).                        |
| `prepare`                      | Крок встановлення: `get:submodule`, потім встановлення теми Docsy через npm install. |
| `prebuild:*`                   | Pre-`build*` хуки; кожен запускає `_prebuild`.                                       |
| `update:hugo`                  | Встановлення останньої версії hugo-extended.                                         |
| `update:packages`              | Запуск npm-check-updates для оновлення залежностей.                                  |
| `generate:config:links`        | Генерація git-ігнорованого `.htmltest.yml` з `.htmltest.base.yml`                    |
| `generate:config:links:lychee` | Генерація git-ігнорованого `lychee.toml` з `lychee.base.toml`.                       |
| `log:build`, `log:check:links` | Запустити відповідний скрипт та вивести (tee) вивід в `tmp/`.                        |

## Примітки {#notes}

- **Підтримка refcache** є специфічною для htmltest. Детальніше див. [Refcache](../link-checking/#refcache).
- **Перевірка посилань Lychee (пілот).** Скрипти `:lychee` та `:diff` використовують [Lychee](https://github.com/lycheeverse/lychee) як швидшу альтернативу htmltest, з тим же покриттям. Вони генерують `lychee.toml` та (пере)заповнюють `.lycheecache` з refcache автоматично. Lychee працює як [CI пілот](../ci-workflows/#other-workflows) без блокування, поки його оцінюють у [#10449](https://github.com/open-telemetry/opentelemetry.io/issues/10449).
- **`test:local-tools:lychee`** є частиною `test:local-tools`, яка потребує бінарного файлу `lychee` (поведінкові тести фрагментів та конфігурації). Ці тести пропускаються, коли бінарний файл відсутній, тому `test:local-tools` вже охоплює їх у загальному тестовому завданні; кінцевий `:lychee` залишає цей скрипт поза `test:compound-tests` (який відповідає `test:*-*`), щоб набір не виконувався двічі. Завдання CI з перевірки посилань встановлює lychee та запускає цей скрипт для реального виконання.
- **`all`** запускає всі перелічені скрипти, навіть якщо один з них не працює, а потім завершується з ненульовим статусом, якщо хоча б один з них не працює.

[build kinds]: ../#build-kinds
[fn]: /docs/contributing/pr-checks/#filename-check
[locale-auto-merge]: ../ci-workflows/#locale-auto-merge
