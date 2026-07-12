---
title: Патчі вмісту модулів
description: >-
  Створення та керування тимчасовими патчами для модулів вмісту між релізами.
weight: 15
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
# prettier-ignore
cSpell:ignore: напр патч патча патчами патчу патчі патчів
---

Сторінки Spec, опубліковані на сайті (OTel specification, OTLP, semantic conventions, OpAMP) походять з інших репозиторіїв, які керуються як git submodules в [`content-modules/`][content-modules]. Оскільки сайт фіксує конкретний випуск кожного модуля, сирцевий Markdown є знімком, який можна оновити лише шляхом підвищення до нового випуску.

Коли відбувається запуск [`npm run cp:spec`](../npm-scripts/#submodules-and-content), [`cp-pages.sh`][cp-pages] копіює вміст submodule в `tmp/`, змінює назву файлів `README.md` на `_index.md`, та запускає скрипт [`adjust-pages`][script] для кожного файлу Markdown. Hugo монтує `tmp/` в дерево сайту тож оброблені сторінки зʼявляються у `/docs/specs/`.

## Що робить скрипт {#what-the-script-does}

Файли Markdown Spec створенні для рендерингу на GitHub: вони не мають Hugo front matter, їх посилання вказують на GitHub URLs, а шляхи зображень орієнтуються на структуру їх репозиторіїв. Скрипт [`adjust-pages`][script] наводить містки для заповнення цієї прогалини, виконуючи перетворення кожного файлу:

- **Додавання front matter** — Видобуває перший заголовок `# Heading` і додає його в `title`, створює `linkTitle`, створює Hugo front matter. Підтримує front matter, вбудований в блоки коментарів `<!--- Hugo ... --->`.
- **Додавання версій** — Додає версію специфікації (напр., `1.54.0`) до titles та linkTitles для OTel spec, OTLP, та semconv сторінок.
- **Конвертування URL** — Перетворює абсолютні шляхи GitHub URLs в репозиторіях spec на локальні шляхи `/docs/specs/...` тож перехресні посилання між специфікаціями працюють на сайті.
- **Шляхи зображень** — Переписує відносні шляхи до зображень, щоб вони правильно розпізнавалися з місця розташування сторінки Hugo.
- **Очищення вмісту** — Вилучення блоків `<details>` та розділів `<!-- toc -->` які не потрібні на сайті.
- **Тимчасові патчі** — Застосовує виправлення на основі регулярних виразів для проблем зі специфікаціями, які ще не були виправлені у випуску (див. нижче).

Перетворення виконуються як впорядкований конвеєр правил у файлі [`index.mjs`][script] скрипту, і порядок має значення. При їх зміні згенеруйте заново сторінки spec та перегляньте diff до/після теки `tmp/`, оновлюючи тести характеристики скрипту (`index.test.mjs`) відповідно.

Версії Spec вказуються в [`data/spec-versions.yml`][spec-versions], файлі даних Hugo, тож шаблони також мають до них доступ, та оновлюються автоматично робочими процесами оновлення версій. На момент `cp:spec` скрипт перевіряє, що кожна версія відповідає базовому випуску відповідного запису `*-pin` у [`.gitmodules`][gitmodules], та зупиняє роботу, якщо вони не збігаються. (Пін може бути ідентифікатором `git describe`, а не точним випуском — наприклад, на гілках інтеграції draft-spec.)

## Патчі специфікацій між випусками {#patching-specs}

Виправлення несправного посилання або неправильного вмісту в специфікації вимагає PR до репозиторію верхнього рівня, нового випуску та оновлення підмодуля в цьому репозиторії. Цей процес може зайняти тижні або місяці. Тим часом несправний вміст спричиняє збої CI — найчастіше в автоматизованих PR `otelbot/refcache-refresh`, які перевіряють кожне зовнішнє посилання на сайті.

Щоб розблокувати CI, не чекаючи на випуску висхідного коду, ви можете додати тимчасовий патч до [`patches.yml`][patches] — код змінювати не потрібно. Патчі — це перевизначення на основі регулярних виразів, які виконуються під час побудови та містять вбудоване відстеження версій: як тільки специфікація перевищує діапазон версій патчу, `cp:spec` виводить попередження про те, що патч застарів і його можна видалити.

### 1. Додавання патчу {#1-add-a-patch-entry}

Патчі оголошуються в [`patches.yml`][patches] у вигляді записів YAML-списку. Додайте новий запис (замінивши маркер `[]`, якщо список порожній):

```yaml
- id: 2025-11-21-docker-api-versions
  module: semconv
  minVers: 1.39.0-dev
  file: ^tmp/semconv/docs/
  search: '(https://docs\.docker\.com/reference/api/engine/version)/v1\.(43|51)/(#tag/)'
  replace: '$1/v1.52/$3'
  flags: g
  notes: >-
    Replace older Docker API versions with the latest. See
    open-telemetry/semantic-conventions#3103; upstreamed fix:
    open-telemetry/semantic-conventions#3093
```

Поля для кожного запису патча:

- **`id`** — Унікальний ідентифікатор (дата + короткий опис), який виводиться в логах.
- **`module`** — Один з `spec`, `otlp` або `semconv`.
- **`minVers`** — Включно нижня межа. Патч застосовується, поки версія субмодуля дорівнює або перевищує цю версію, і стає застарілим, коли специфікація перевищує діапазон версій патча.
- **`maxVers`** — Необовʼязкова виключна верхня межа. Якщо пропущено, зазвичай використовується `minVers` з збільшеним номером патча (наприклад, `1.55.0` означає `maxVers = 1.55.1`), що відповідає оригінальній поведінці префіксного збігу. При явному встановленні патч пропускається, коли версія субмодуля досягає `maxVers` (тобто застосовується лише тоді, коли версія `< maxVers`).
- **`file`** — Необовʼязковий регулярний вираз, що відповідає шляхам файлів, до яких слід застосувати патч, наприклад `^tmp/semconv/docs/`. Якщо пропущено, зазвичай використовується дерево spec/docs модуля: `^tmp/otel/specification/` для `spec`, `^tmp/otlp/docs/` для `otlp` і `^tmp/semconv/docs/` для `semconv`.
- **`context`** — Необовʼязково: `body|front-matter` (зазвичай: `body`). Патчі тіла застосовуються по рядках; патчі `front-matter` застосовуються до всього блоку front matter.
- **`search`** — Джерело `RegExp` для тексту, який потрібно замінити. Надайте перевагу одинарним лапкам YAML, щоб скісні риски залишалися буквальними.
- **`replace`** — Текст заміни з використанням синтаксису заміни JavaScript (`$1`, `$<name>`, `$&`). Використовуйте іменовані групи захоплення, коли за посиланням на групу йде цифра: `$108` є неоднозначним.
- **`flags`** — Необовʼязкові прапорці `RegExp`, зазвичай `g` для заміни всіх входжень.
- **`notes`** — Необовʼязковий довільний текст: що робить патч, а також посилання на висхідні проблеми/PR.

Окремий крок реєстрації не потрібен — скрипт застосовує кожен запис у [`patches.yml`][patches] під час побудови.

### 2. Перевірка патчу {#2-test-the-patch}

Виконайте крок копіювання специфікації та переконайтеся, що патч було застосовано:

```sh
npm run cp:spec
```

У разі успішного виконання помилок не буде. Потім ви можете пошукати проблемний вміст у вихідних даних `tmp/`, щоб переконатися, що його було переписано. Для патчів, повʼязаних із посиланнями, також виконайте:

```sh
npm run fix:refcache  # Prunes stale refcache entries, then checks links
npm test              # Full test run including link checking
```

### 3. Commit та push {#3-commit-and-push}

Якщо ваш патч був створений під час виправлення PR refcache (наприклад, гілка `otelbot/refcache-refresh`), зафіксуйте зміни в `patches.yml` разом з оновленим `refcache.json`, а потім виконайте force-push з lease:

```sh
git add scripts/content-modules/adjust-pages/patches.yml static/refcache.json
git commit -m "Patch content modules and refresh refcache"
git push --force-with-lease
```

### 4. Вилучення застарілих патчів {#4-remove-obsolete-patches}

Як тільки новий випуск специфікації містить виправлення, `cp:spec` виводить повідомлення:

```text
INFO: scripts/content-modules/adjust-pages/cli.mjs: patch '<id>' is probably
obsolete now that spec '<name>' is at version '<new>' >= '<target>'; if so,
remove the patch
```

Коли ви бачите це повідомлення, видаліть запис патчу з [`patches.yml`][patches]. Якщо це останній патч, що залишився, ви можете закоментувати його замість видалення, щоб зберегти його як приклад для майбутніх патчів.

[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules
[cp-pages]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/cp-pages.sh
[gitmodules]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.gitmodules
[patches]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/adjust-pages/patches.yml
[script]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/content-modules/adjust-pages
[spec-versions]: https://github.com/open-telemetry/opentelemetry.io/blob/main/data/spec-versions.yml
