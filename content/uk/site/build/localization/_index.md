---
title: Налаштування нової локалізації
linkTitle: Налаштування локалізації
description: >-
  Покроковий посібник для підтримки нової локалізації мови на вебсайті OpenTelemetry.
weight: 50
default_lang_commit: b430165b39cfc929f23d116b193f2916778d458b
---

Цей посібник допоможе адміністраторам веб-сайту OTel виконати всі необхідні зміни для додавання нової мовної локалізації. У ньому розглядаються як зміни на рівні репозиторію, так і налаштування на рівні організації GitHub.

Щодо питань, які стосуються учасників локалізації — рекомендації з перекладу, відстеження змін в англомовній версії та поточна підтримка — дивіться в розділ [Локалізація сайту][Site localization].

Канонічний реєстр активних команд локалізації та їхніх ресурсів знаходиться в [`projects/localization.md`][].

## Попередні вимоги {#prerequisites}

Перед тим як розпочати, узгодьте наступне з командою локалізації:

- Створено [тікет для запуску локалізації][kickoff issue] відповідно до кроків у [New localizations][].
- Узгоджено код мови за стандартом [ISO 639-1][] (`LANG_ID`).
- Відомі GitHub-імена ментора та початкових учасників.

У решті цього посібника замініть кожне використання `LANG_ID` на фактичний код за стандартом [ISO 639-1][] (наприклад, `uk` для української).

## Крок 1 — Налаштування мови в Hugo config {#hugo-config}

### Крок 1a. Мова в config {#step-1a-language-config-entry}

Додайте запис для нової мови в `config/_default/hugo.yaml` до ключів в `languages:`:

```yaml
LANG_ID:
  languageName: NativeName (English name)
  languageCode: LANG_ID-REGION
  params:
    description: <опис сайту, перекладений на нову мову>
```

Наприклад, запис для польської мови виглядає так:

```yaml
pl:
  languageName: Polski (Polish)
  languageCode: pl-PL
  params:
    description: Strona projektu OpenTelemetry
```

### Крок 1b. Файл з перекладами {#step-1b-translation-file}

У теці `i18n` створіть новий файл з назвою `LANG_ID.yaml` (наприклад, `uk.yaml`). Цей файл міститиме деякі перекладені рядки для нової мови. Ці рядки використовуються для елементів інтерфейсу та інших компонентів сайту, які не обовʼязково є частиною основного контенту, або використовуються на кількох сторінках.

## Крок 2 — Монтування контенту в Hugo {#hugo-mounts}

Hugo використовує монтування контенту для маршрутизації контенту, специфічного для локалі, та для показу англійських сторінок у тих розділах, які ще не перекладені. Додайте блок для `LANG_ID` у [`config/_default/module-template.yaml`][] під верхнім рівнем секції `mounts:` (цей шаблон перетворюється у файл `module.yaml`).

### Базове налаштування {#base-setup}

Кожна локаль потребує принаймні наступних монтувань — власний контент локалі плюс альтернативний контент з основних англійських розділів:

```yaml
## LANG_ID
- source: content/LANG_ID # сторіни перекладені відвідною мовою
  target: content
  sites: &LANG_ID-matrix
    matrix: { languages: [LANG_ID] }
# альтернативні сторінки (надають англійський контент, якщо переклад ще не готовий)
- source: content/en/_includes
  target: content/_includes
  sites: *LANG_ID-matrix
- source: content/en/announcements
  target: content/announcements
  sites: *LANG_ID-matrix
- source: content/en/docs
  target: content/docs
  files: ['! specs/**'] # виключити фрагменти специфікацій (занадто великі для fallback)
  sites: *LANG_ID-matrix
```

Додаткові розділи (наприклад, `ecosystem`) можна додавати по мірі розвитку локалізації. Наприклад, блок `pt` включає альтернативний контент для `ecosystem`:

```yaml
## pt
- source: content/pt
  target: content
  sites: &pt-matrix
    matrix: { languages: [pt] }
# альтернативні сторінки
- source: content/en/_includes
  target: content/_includes
  sites: *pt-matrix
- source: content/en/announcements
  target: content/announcements
  sites: *pt-matrix
- source: content/en/docs
  target: content/docs
  files: ['! specs/**']
  sites: *pt-matrix
- source: content/en/ecosystem
  target: content/ecosystem
  sites: *pt-matrix
```

Додайте новий блок поряд з наявними блоками локалей у `config/_default/module-template.yaml`, дотримуючись поточних домовленостей щодо порядку, що використовуються в цьому файлі.

## Крок 3 — Перевірка орфографії {#cspell}

### 3a. Перевірка наявності словника cspell {#3a-check-for-a-cspell-dictionary}

Знайдіть у npm словник cspell для мови, яку ви додаєте:

```sh
npm search @cspell/dict
```

Шукайте пакунок, що відповідає `@cspell/dict-LANG_ID` або найближчому регіональному варіанту (наприклад, `@cspell/dict-pl_pl` для польської). Ви також можете переглянути повний список доступних словників у [репозиторії cspell-dicts](https://github.com/streetsidesoftware/cspell-dicts#natural-language-dictionaries).

### 3b. Встановлення словника (якщо доступно) {#3b-install-the-dictionary-if-available}

```sh
npm install --save-dev @cspell/dict-LANG_ID
```

Це додає пакунок до `package.json`. Зробіть коміт оновлених файлів `package.json` та `package-lock.json`.

### 3c. Створення власного списку слів {#3c-create-the-custom-word-list}

Створіть порожній файл для локальних технічних термінів сайту:

```sh
touch .cspell/LANG_ID-words.txt
```

Зробіть коміт з цим порожнім файлом. Учасники з часом додаватимуть сюди технічні терміни, специфічні для локалі.

### 3d. Оновлення `.cspell.yml` {#3d-update-cspell-yml}

Додайте три записи до [`.cspell.yml`][] для увімкнення перевірки орфографії для нової мови:

1. В `import:` — імпортуйте словник cspell для вашої локалі:

   ```yaml
   - '@cspell/dict-CSPELL_DICT_ID/cspell-ext.json'
   ```

2. В `dictionaryDefinitions:` — зареєструйте власний список слів:

   ```yaml
   - name: LANG_ID-words
     path: .cspell/LANG_ID-words.txt
   ```

3. В `dictionaries:` — активуйте як імпортований словник, так і власний список слів:

   ```yaml
   - CSPELL_DICT_ID # пакунок @cspell/dict-CSPELL_DICT_ID
   - LANG_ID-words # список .cspell/LANG_ID-words.txt
   ```

Зберігайте записи в кожному розділі в алфавітному порядку за кодом мови.

> [!NOTE]
>
> Якщо для мови не існує пакунка словника cspell, пропустіть кроки 3b та записи `import` і `dictionaries`. Створіть лише власний список слів (крок 3c) і зареєструйте його в `dictionaryDefinitions`. Також додайте шлях до локалі в список `ignorePaths` у [`.cspell.yml`][] щоб cspell не намагався перевіряти орфографію вмісту, який він не може перевірити:
>
> ```yaml
> ignorePaths:
>   - content/LANG_ID
> ```

## Крок 4 — Prettier (за певних умов) {#prettier}

Якщо Prettier не обробляє мову належним чином — наприклад, абетки, що пишуться справа наліво, або використовують нелатинські символи — додайте запис до [`.prettierignore`][]:

```sh
content/LANG_ID/**
```

Перевірте наявні записи в [`.prettierignore`][] щоб дізнатися, чи інші локалі з подібними скриптами вже були виключені, і дотримуйтесь того ж шаблону. Цей крок є необовʼязковим і повинен виконуватися лише тоді, коли відомо, що Prettier неправильно форматуватиме мову.

## Крок 5 — Автоматизація репозиторію GitHub {#gh-repo}

### Мапа міток компонентів {#component-label-map}

В [`.github/component-label-map.yml`][], додайте запис, який активує мітку `lang:LANG_ID` для будь-якого PR, що торкається `content/LANG_ID/`:

```yaml
lang:LANG_ID:
  - changed-files:
      - any-glob-to-any-file:
          - content/LANG_ID/**
```

### Власники компонентів {#component-owners}

В [`.github/component-owners.yml`][], додайте запис, який вимагає перегляду від команди затверджувачів локалі та підтримувачів документації:

```yaml
content/LANG_ID:
  - open-telemetry/docs-maintainers
  - open-telemetry/docs-LANG_ID-approvers
```

Обидва файли підтримують алфавітний порядок за кодом мови в межах відповідних секцій локалі.

## Крок 6 — Налаштування на рівні організації GitHub {#gh-org}

Ці кроки виконуються поза межами репозиторію і вимагають доступу рівня супровідника до організації GitHub `open-telemetry`.

Створення команди здійснюється шляхом відкриття pull request у
[`open-telemetry/admin`][] репозиторії (приватний). Дивіться
[цей PR](https://github.com/open-telemetry/admin/pull/588?link-check=no) для прикладу очікуваного формату.

> [!NOTE]
>
> [Члени команди повинні бути додані вручну](https://github.com/open-telemetry/admin/issues/58?link-check=no), оскільки вони наразі не керуються через цей репозиторій.

## Крок 7 — Канал Slack {#slack}

Створіть канал для локалі в [CNCF Slack workspace][], використовуючи номенклатуру `#otel-localization-LANG_ID` (наприклад, `#otel-localization-pl` для польської). Після створення каналу додайте [OpenTelemetry Admin](https://cloud-native.slack.com/team/U07DR07KAEQ) як менеджера каналу.

## Крок 8 — Моніторинг проєкту {#projects}

Оновіть [`projects/localization.md`][] з інформацією про нову локаль:

1. Додайте мову до списку підтримуваних мов у верхній частині, в алфавітному порядку за кодом мови:

   ```markdown
   - [NativeName - EnglishName (LANG_ID)][LANG_ID]

   [LANG_ID]: https://opentelemetry.io/LANG_ID/
   ```

2. Додайте запис команди в **Current language teams**, дотримуючись тієї ж структури, що й наявні записи:

   ```markdown
   **EnglishName**:

   - Website: <https://opentelemetry.io/LANG_ID/>
   - Slack channel:
     [`#otel-localization-LANG_ID`](https://cloud-native.slack.com/archives/XXXXXXXXXXX)
   - Maintainers: `@open-telemetry/docs-LANG_ID-maintainers`
   - Approvers: `@open-telemetry/docs-LANG_ID-approvers`
   ```

3. Додайте мітку `lang:LANG_ID` до розділу **Labels**:

   ```markdown
   - [`lang:LANG_ID`][issues-lang-LANG_ID] - EnglishName localization
   ```

   З відповідним визначенням посилання:

   ```markdown
   [issues-lang-LANG_ID]: https://github.com/open-telemetry/opentelemetry.io/issues?q=is%3Aissue%20state%3Aopen%20label%3Alang%3ALANG_ID
   ```

4. Додайте визначення посилання для каналу Slack:

   ```markdown
   [otel-localization-LANG_ID]: https://cloud-native.slack.com/archives/CHANNEL_ID
   ```

## Перевірка {#verification}

### Контрольний список налаштувань {#setup-checklist}

Використовуйте наступний список для підтвердження, що кожен крок налаштування завершено перед тим як запитати рецензію:

- [ ] **Крок 1** — Додано запис мови до `config/_default/hugo.yaml`
- [ ] **Крок 2** — Додано точки монтування контенту до `config/_default/module-template.yaml`
- [ ] **Крок 3** — Налаштовано cSpell: встановлено словник (або додано локаль до `ignorePaths`), створено власний список слів у `.cspell/LANG_ID-words.txt`, та оновлено `.cspell.yml`
- [ ] **Крок 4** — Оновлено `.prettierignore` (якщо застосовується для скрипу)
- [ ] **Крок 5** — Оновлено `.github/component-label-map.yml` та `.github/component-owners.yml` з записами `lang:LANG_ID`
- [ ] **Крок 6** — Відкрито PR команди в `open-telemetry/admin`; учасники команди додані вручну
- [ ] **Крок 7** — Slack channel `#otel-localization-LANG_ID` створено; OpenTelemetry Admin додано як менеджера каналу
- [ ] **Крок 8** — `projects/localization.md` оновлено з записом мови, записом команди, міткою та посиланням на канал Slack

### Автоматизовані перевірки {#automated-checks}

Після злиття всіх PR виконайте наступне, щоб підтвердити правильність конфігурації:

- **`npm run build`** — підтверджує, що Hugo розпізнає нову мову без помилок.
- **`npm run check:spelling`** — підтверджує, що конфігурація cspell дійсна і що нові записи словника не вводять помилок.
- **Автоматизація міток GitHub** — відкрийте тестовий PR, який змінює файл в `content/LANG_ID/`, і підтвердьте, що мітка `lang:LANG_ID` застосовується автоматично.

[`.cspell.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.cspell.yml
[`.prettierignore`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.prettierignore
[`.github/component-label-map.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-label-map.yml
[`.github/component-owners.yml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.github/component-owners.yml
[`projects/localization.md`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/projects/localization.md
[`config/_default/module-template.yaml`]: https://github.com/open-telemetry/opentelemetry.io/blob/main/config/_default/module-template.yaml
[`open-telemetry/admin`]: https://github.com/open-telemetry/admin?link-check=no
[kickoff issue]: /docs/contributing/localization/#kickoff
[New localizations]: /docs/contributing/localization/#new-localizations
[Site localization]: /docs/contributing/localization/
[ISO 639-1]: https://en.wikipedia.org/wiki/List_of_ISO_639_language_codes
[CNCF Slack workspace]: https://cloud-native.slack.com
