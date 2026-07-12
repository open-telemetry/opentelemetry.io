---
title: Автоматизація компонентів колектора
linkTitle: Автоматизація компонентів колектора
description: >-
  Пояснення процесу автоматизації для компонентів OpenTelemetry Collector.
weight: 50
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
cSpell:ignore: шорткодах шорткоди
---

Таблиці на сторінках компонентів OpenTelemetry Collector автоматично синхронізуються з даними з [реєстру OpenTelemetry Ecosystem Explorer](https://github.com/open-telemetry/opentelemetry-ecosystem-explorer/tree/main/ecosystem-registry/collector). Код, який керує цим процесом, знаходиться в [`scripts/collector-sync`][].

Процес синхронізації керується GitHub Action, який запускається за розкладом ([`collector-sync.yml`][]).

Щоночі GitHub Action виконує наступні кроки:

1. Отримує останні дані з реєстру OpenTelemetry Ecosystem Explorer.
2. На основі даних реєстру оновлює відповідні файли даних компонентів у [`data/collector/`][].
3. Якщо є зміни у файлах даних компонентів, створює PR з оновленнями.

Всі сторінки компонентів використовують шорткоди, які витягують відповідні дані з теки [`data/collector/`][], тому коли файли даних оновлюються, таблиці на сторінках компонентів автоматично відображають найновішу інформацію.

Повʼязані файли та теки:

- [`data/collector/`][]: Тека, де зберігаються файли даних компонентів, які використовуються для заповнення таблиць на сторінках компонентів.
- [`scripts/collector-sync`][]: Тека, що містить код для отримання даних з реєстру та оновлення файлів даних компонентів.
- [`.github/workflows/collector-sync.yml`][`collector-sync.yml`]: Робочий процес GitHub Action, який планує та виконує процес синхронізації.
- [`layouts/_shortcodes/collector-component-rows.html`][]: Генерує повну HTML-таблицю з файлів даних.
- [`layouts/_shortcodes/component-link.html`][]: Генерує посилання на репозиторій вихідного коду компонента, використовується в таблицях компонентів.
- [`i18n/<language>.yml`][]: Містить переклади для сторінок таблиць компонентів (ключі з префіксом `collector_component_`, які використовуються в шорткодах).

## Переклади {#translations}

Щоб створити новий переклад для сторінок компонентів Collector, ви можете виконати наступні кроки:

- Скопіюйте наявний англійський контент з `content/en/docs/collector/components` до відповідної теки для нової мови (наприклад, `content/uk/docs/collector/components` для української).
- Зробіть переклад статичного контенту (заголовки, описи тощо) вашою мовою.
- Переконайтеся, що відповідний файл [`i18n/<language>.yml`][] існує і містить записи для ключів з префіксом `collector_components_`, які використовуються в таблицях компонентів. Ви можете скопіювати англійські записи та перекласти значення.

[`scripts/collector-sync`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/scripts/collector-sync.sh
[`collector-sync.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/workflows/collector-sync.yml
[`data/collector/`]: https://github.com/open-telemetry/opentelemetry.io/tree/main/data/collector
[`layouts/_shortcodes/collector-component-rows.html`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_shortcodes/collector-component-rows.html
[`layouts/_shortcodes/component-link.html`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/layouts/_shortcodes/component-link.html
[`i18n/<language>.yml`]: https://github.com/open-telemetry/opentelemetry.io/tree/main/i18n
