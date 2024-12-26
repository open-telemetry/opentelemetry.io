---
title: Патчі вмісту модулів
description: >-
  Створення та керування тимчасовими патчами для модулів вмісту між релізами.
weight: 15
default_lang_commit: 5f551752635886a0d2d6b2a83e5a36866ca1b5f1
# prettier-ignore
cSpell:ignore: напр патч патча патчами патчу патчі патчів
---

Сторінки Spec, опубліковані на сайті (OTel specification, OTLP, semantic conventions, OpAMP) походять з інших репозиторіїв, які керуються як git submodules в [`content-modules/`][content-modules]. Оскільки сайт фіксує конкретний випуск кожного модуля, сирцевий Markdown є знімком, який можна оновити лише шляхом підвищення до нового випуску.

Коли відбувається запуск [`npm run cp:spec`](../npm-scripts/#submodules-and-content), [`cp-pages.sh`][cp-pages] копіює вміст submodule в `tmp/`, змінює назву файлів `README.md` на `_index.md`, та запускає [`adjust-pages.pl`][script] для кожного файлу Markdown. Hugo монтує `tmp/` в дерево сайту тож оброблені сторінки зʼявляються у `/docs/specs/`.

## Що робить скрипт {#what-the-script-does}

Файли Markdown Spec створенні для рендерингу на GitHub: вони не мають Hugo front matter, їх посилання вказують на GitHub URLs, а шляхи зображень орієнтуються на структуру їх репозиторіїв. Скрипт [`adjust-pages.pl`][script] наводить містки для заповнення цієї прогалини, виконуючи перетворення кожного файлу:

| Перетворення               | Опис                                                                                                                                                                                        |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Додавання front matter** | Видобуває перший заголовок `# Heading` і додає його в `title`, створює `linkTitle`, створює Hugo front matter. Підтримує front matter, вбудований в блоки коментарів `<!--- Hugo ... --->`. |
| **Додавання версій**       | Додає версію специфікації (напр., `1.54.0`) до titles та linkTitles для OTel spec, OTLP, та semconv сторінок.                                                                               |
| **Конвертування URL**      | Перетворює абсолютні шляхи GitHub URLs в репозиторіях spec на локальні шляхи `/docs/specs/...` тож перехресні посилання між специфікаціями працюють на сайті.                               |
| **Шляхи зображень**        | Переписує відносні шляхи до зображень, щоб вони правильно розпізнавалися з місця розташування сторінки Hugo.                                                                                |
| **Очищення вмісту**        | Вилучення блоків `<details>` та розділів `<!-- toc -->` які не потрібні на сайті.                                                                                                           |
| **Тимчасові патчі**        | Застосовує виправлення на основі регулярних виразів для проблем зі специфікаціями, які ще не були виправлені у випуску (див. нижче).                                                        |

Версії Spec вказуються вгорі скрипту в хеші `%versionsRaw` та оновлюються автоматично відповідним робочим процесом.

## Патчі специфікацій між випусками {#patching-specs}

Виправлення несправного посилання або неправильного вмісту в специфікації вимагає PR до репозиторію верхнього рівня, нового випуску та оновлення підмодуля в цьому репозиторії. Цей процес може зайняти тижні або місяці. Тим часом несправний вміст спричиняє збої CI — найчастіше в автоматизованих PR `otelbot/refcache-refresh`, які перевіряють кожне зовнішнє посилання на сайті.

Щоб розблокувати CI, не чекаючи на випуск вгору, ви можете додати тимчасовий патч до [`adjust-pages.pl`][script]. Патчі — це перевизначення на основі регулярних виразів, які виконуються під час побудови та містять вбудоване відстеження версій: коли специфікація виходить за межі цільової версії, `cp:spec` виводить попередження про те, що патч застарів і його можна видалити.

### 1. Створення функції патчу {#1-create-a-patch-function}

Скопіюйте шаблон нижче та змінить його. Функція має три частини:

1. **Захист на рівні файлу**, який обмежує патч відповідними файлами специфікації.
2. Виклик **`applyPatchOrPrintMsgIf`**, який контролює, чи виконується патч на основі поточної версії специфікації.
3. **Заміна регулярним виразом**, яка виправляє вміст.

```perl
sub patchSpec_because_of_SemConv_DockerAPIVersions() {
  return unless
    $ARGV =~ m|^tmp/semconv/docs/|
    &&
    applyPatchOrPrintMsgIf('2025-11-21-docker-api-versions',
      'semconv', '1.39.0-dev');

  # For the problematic links, see:
  # https://github.com/open-telemetry/semantic-conventions/issues/3103
  #
  # Replace older Docker API versions with the latest:
  # https://github.com/open-telemetry/semantic-conventions/pull/3093

  s{
    (https://docs.docker.com/reference/api/engine/version)/v1.(43|51)/(\#tag/)
  }{$1/v1.52/$3}gx;
}
```

Аргументи `applyPatchOrPrintMsgIf`:

| Аргумент        | Опис                                                                                                                                                              |
| --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Patch ID**    | Унікальний ідентифікатор (дата + короткий опис), що виводиться в повідомлення логів.                                                                              |
| **Spec name**   | Одне з `spec`, `otlp`, або`semconv`.                                                                                                                              |
| **Target vers** | Версія специфікації, до якої застосовується патч. Патч працює, поки підмодуль знаходиться в цій версії, і стає застарілим, коли специфікація виходить за її межі. |

### 2. Реєстрація виклику патча {#2-register-the-patch-call}

Додайте виклик вашої функції всередині секції основного циклу, що відповідає виду специфікації. Для патчів semconv додайте виклик всередині блоку `if ($ARGV =~ /^tmp\/semconv/)`:

```perl
## Semconv

if ($ARGV =~ /^tmp\/semconv/) {
  # ... existing rewrites ...

  patchSpec_because_of_SemConv_DockerAPIVersions();
}
```

Для патчів OTLP або OTel spec додайте виклик у `# SPECIFICATION custom processing`. Для патчів front matter додайте виклик у підпроцесі `printFrontMatter`.

### 3. Перевірка патчу {#3-test-the-patch}

Виконайте крок копіювання специфікації та переконайтеся, що патч було застосовано:

```sh
npm run cp:spec
```

У разі успішного виконання помилок не буде. Потім ви можете пошукати проблемний вміст у вихідних даних `tmp/`, щоб переконатися, що його було переписано. Для патчів, повʼязаних із посиланнями, також виконайте:

```sh
npm run fix:refcache  # Prunes stale refcache entries, then checks links
npm test              # Full test run including link checking
```

### 4. Commit та push {#4-commit-and-push}

Якщо ваш патч був створений під час виправлення PR refcache (наприклад, гілка `otelbot/refcache-refresh`), зафіксуйте зміни в `adjust-pages.pl` разом з оновленим `refcache.json`, а потім виконайте force-push з lease:

```sh
git add scripts/content-modules/adjust-pages.pl static/refcache.json
git commit -m "Patch adjust-pages.pl and refresh refcache"
git push --force-with-lease
```

### 5. Вилучення застарілих патчів {#5-remove-obsolete-patches}

Як тільки новий випуск специфікації містить виправлення, `cp:spec` виводить повідомлення:

```text
INFO: adjust-pages.pl: patch '<id>' is probably obsolete now that
spec '<name>' is at version '<new>' >= '<target>'; if so, remove the patch
```

Коли ви бачите це повідомлення, видаліть функцію патча та її виклик з скрипту. Якщо це останній патч, що залишився, ви можете закоментувати його замість видалення, щоб зберегти його як приклад для майбутніх патчів.

[content-modules]: https://github.com/open-telemetry/opentelemetry.io/tree/main/content-modules
[cp-pages]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/cp-pages.sh
[script]: https://github.com/open-telemetry/opentelemetry.io/blob/main/scripts/content-modules/adjust-pages.pl
