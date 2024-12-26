---
title: Скрипти NPM
description: >-
  Скрипти NPM для побудови, обслуговування, перевірки та підтримки вебсайту OpenTelemetry.
weight: 20
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
cSpell:ignore: мініфікацією напр
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

| Скрипт             | Опис                                                  |
| ------------------ | ----------------------------------------------------- |
| `build`            | Збирає сайт (dev base URL, drafts/future увімкнені).  |
| `build:preview`    | Збірка з мініфікацією (напр. для Netlify preview).    |
| `build:production` | Фінальна збірка Hugo з мініфікацією.                  |
| `serve`            | Запуск сервера Hugo для розробки (стандартно).        |
| `serve:hugo`       | Запуск сервера Hugo зі створенням сторінок у памʼяті. |
| `serve:netlify`    | Запуск Netlify Dev з використанням Hugo.              |
| `clean`            | Run `make clean`.                                     |

## Перевірки {#checking}

| Скрипт                 | Опис                                                                     |
| ---------------------- | ------------------------------------------------------------------------ |
| `check`                | Запуск найчастіше використовуваних скриптів перевірки послідовно.        |
| `check:all`            | Запуск всіх скриптів перевірки послідовно.                               |
| `check:code-excerpts`  | Перевірка фрагментів коду, помилка якщо потрібні оновлення.              |
| `check:format`         | Перевірки Prettier та переносів.                                         |
| `check:i18n`           | Перевірка front matter локалізації (`default_lang_commit`).              |
| `check:links`          | Перевірка HTML посилань.                                                 |
| `check:links:internal` | Перевірка посилань без додаткових аргументів HTMLTest.                   |
| `check:markdown`       | Markdown lint (вміст та проєкти).                                        |
| `check:markdown:specs` | Markdown lint для фрагментів spec в `tmp/`.                              |
| `check:registry`       | Перевірка YAML реєстру в `data/registry/`.                               |
| `check:spelling`       | Перевірка правопису cspell в content, data та layout Markdown.           |
| `check:text`           | textlint в content та data.                                              |
| `check:filenames`      | Перевірка назв файлів на відсутність підкреслень в asset/content/static. |
| `check:expired`        | Перелік застарілого вмісту (на основі front matter).                     |
| `check:collector-sync` | Запуск перевірки collector-sync.                                         |

## Виправлення {#fixing}

| Скрипт                    | Опис                                                                           |
| ------------------------- | ------------------------------------------------------------------------------ |
| `fix`                     | Запуск найпоширеніших виправлень.                                              |
| `fix:code-excerpts`       | Оновлення фрагментів коду.                                                     |
| `fix:all`                 | Запуск всіх скриптів виправлень.                                               |
| `fix:format`              | Застосування правил Prettier та прибирання зайвих пробілів в кінці рядків.     |
| `fix:format:staged`       | Форматування тільки staged файлів.                                             |
| `fix:i18n`                | Додавання виправлення i18n front matter (`fix:i18n:new`, `fix:i18n:status`).   |
| `fix:markdown`            | Виправлення Markdown lint помилок та прибирання пробілів в кінці рядків.       |
| `fix:refcache`            | Очистити refcache і повторно виконати перевірку посилань (оновлення refcache). |
| `fix:refcache:refresh`    | Очистити refcache за кількістю..                                               |
| `fix:submodule`           | Зафіксувати версію submodule (теж саме що й `pin:submodule`).                  |
| `fix:filenames`           | Перейменуйте файли з підкресленням на kebab-case.                              |
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

| Скрипт                     | Опис                                                                         |
| -------------------------- | ---------------------------------------------------------------------------- |
| `test`                     | Запускає найпоширеніші тести.                                                |
| `test:base`                | Базові тести (теж саме що й `check`).                                        |
| `test:compound-tests`      | Запускає складові скрипти `test:*-*`.                                        |
| `test:all`                 | Запускає `test:base`, потім `test:compound-tests`.                           |
| `test:collector-sync`      | Тести collector-sync.                                                        |
| `test:edge-functions`      | Запуск тестів Node для `netlify/edge-functions/**/*.test.ts`.                |
| `test:edge-functions:live` | Опціональний live suite `node:test`; підтримує `--help`.                     |
| `test:local-tools`         | Node test runner для `scripts/**/*.test.{mjs,js}`.                           |
| `test-and-fix`             | Запуск скриптів виправлення (крім i18n/refcache/submodule), потім перевірки. |
| `diff:check`               | Попередження, якщо робоче дерево має незбережені зміни.                      |
| `diff:fail`                | Помилка, якщо робоче дерево має зміни (наприклад, після збірки).             |
| `netlify-build:preview`    | `build:preview`, потім `diff:check`.                                         |
| `netlify-build:production` | `build:production`, потім `diff:check`.                                      |

## Утиліти {#utilities}

| Скрипт                                             | Опис                                                                                                          |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `seq`                                              | Запускає вказані скрипти в зазначеному порядку; виходить після першого збою.                                  |
| `all`                                              | Запускає вказані скрипти в зазначеному порядку; виконуються всі скрипти навіть якщо якийсь з низ зазнав збою. |
| `prepare`                                          | Крок встановлення: `get:submodule`, потім встановлення теми Docsy через npm install.                          |
| `prebuild`                                         | Перед build: `get:submodule`, `cp:spec`.                                                                      |
| `update:hugo`                                      | Встановлення останньої версії hugo-extended.                                                                  |
| `update:packages`                                  | Запуск npm-check-updates для оновлення залежностей.                                                           |
| `fix:htmltest-config`                              | Створити/оновити конфігурацію HTMLTest (використовується конвеєром перевірки посилань).                       |
| `log:build`, `log:check:links`, `log:test-and-fix` | Запустити відповідний скрипт та вивести (tee) вивід в `tmp/`.                                                 |

## Примітки {#notes}

- **`check:links`** оновлює refcache як побічний ефект. Процес тестування та виправлення використовує внутрішній список виправлень, який виключає refcache, тому на етапі перевірки його можна оновити.
- **`all`** запускає всі перелічені скрипти, навіть якщо один з них не працює, а потім завершується з ненульовим статусом, якщо хоча б один з них не працює.
