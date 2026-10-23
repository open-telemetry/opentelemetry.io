---
title: Навички для агентів та підтримувачів
linkTitle: Навички
description: Навички для агентів та підтримувачів, які використовуються під час підтримки сайту.
weight: 22
default_lang_commit: 6ce0f45ce4b7bbb4e85bef99709711edccec8a21
cSpell:ignore: agentskills openai рантайму чекаутах
---

Цей розділ описує навички та процедури для агентів та підтримувачів, які використовуються під час підтримки сайту.

Ми використовуємо термін **agent skill** для позначення повторно використовуваних дій, написаних відповідно до [agentskills.io][], які можуть бути викликані агентами або виконані вручну підтримувачами. Ми називаємо **_maintainer_ skill** (або процедуру підтримувача) набір кроків, які агент або підтримувач можуть виконати для досягнення конкретного завдання. Навички агентів визначені в [`.agents/skills/`][]. Процедури підтримувачів визначені в цьому розділі.

У текстах навичок та процедур описується мета кожного кроку; команда в дужках є запропонованим способом виконання кроку, а не єдино можливим. Навички, написані до прийняття цього правила, можуть ще його не дотримуватися.

## Agent skills

Як зазначено вище, навички визначені в [`.agents/skills/`][], вони включають:

- [`/approve-registry-update [номер-pr-або-url]`][approve-registry-update]: допомога рецензентам у прийнятті рішення щодо обʼєднання PR з оновленням версій реєстру від otelbot; перевірка, чи це чисте оновлення, і після підтвердження — затвердження та додавання до черги злиття. Без аргументу обробляє відкриті PR з автоматичним оновленням реєстру.
- [`/draft-issue <опис-проблеми>`][draft-issue]: створення тікета GitHub в репозиторії `opentelemetry.io` відповідно до шаблонів, керівництва з внеску та таксономії міток.
- [`/refresh-link-cache-pr-fix`][refresh-link-cache-pr-fix]: отримання, перегляд та спроба виправити невдалі перевірки посилань у PR від otelbot (зазвичай всі відкриті PR з гілками `otelbot/*` з невдалими перевірками посилань, або конкретні гілки, якщо вказано).
- [`/resolve-link-cache-conflicts <необовʼязковий-номер-pr>`][resolve-link-cache-conflicts]: вирішення конфліктів злиття/перебазування `link-cache.jsonc`.
- [`/review-blog-post <шлях-до-блогу-або-номер-pr>`][review-blog-post]: перевірка блогу OpenTelemetry на відповідність front matter, конвенціям контенту, стабільності посилань GitHub (`gh-url-hash`), орфографії та термінології OTel.
- [`/review-pull-request <номер-pr-або-url>`][review-pull-request]: перевірка pull request на семантику перевірок CI, робочий процес CLA та міток затвердження, обробку link-cache, правила локалізації та якість контенту.
- [`/update-i18n-drift-status [--locale locale,...] [--create-pr]`][update-i18n-drift-status]: оновлення поля front matter `drifted_from_default` для локалізованого контенту, з опціональними аргументами для обмеження обробки певних локалей та автоматичного відкриття PR.
- [`/setup-new-localization <kickoff-issue | код-мови>`][setup-new-localization]: налаштування нової локалізації сайту від початку до кінця — блок мови Hugo, монтування вмісту, список слів cSpell, конфігурація мітки `lang:<lang>` та сама мітка, `locale-teams.yaml` з оновленням CODEOWNERS та записи в `localization.md`.
- [`/update-old-blog-ignores`][update-old-blog-ignores]: розширити діапазон років старих публікацій у блозі, які не підлягають перевіркам на дотримання стилю та формату, а також виправити відповідні скрипти.
- [`/update-git-submodule <submodule>... <version|latest|HEAD>`][update-git-submodule]: оновлення одного або кількох підмодулів git до цільової версії.

Codex виявляє ці навички в `.agents/skills/`. Claude Code використовує відносні символічні посилання в `.claude/skills/`, які вказують на ті самі теки навичок. Викликайте навичку за допомогою `$skill-name` у Codex або `/skill-name` у Claude Code. Для Claude Code на чекаутах Windows потрібна підтримка символічних посилань Git (`core.symlinks=true`).

### Додавання навички агента {#adding-an-agent-skill}

1. Створіть `.agents/skills/<name>/SKILL.md` із полями `name` і `description` у YAML front matter відповідно до [agentskills.io][].
2. Додайте відносне символічне посилання для Claude Code: `ln -s ../../.agents/skills/<name> .claude/skills/<name>`.
3. Щоб навичку можна було викликати лише явно, установіть `disable-model-invocation: true` у front matter для Claude Code та додайте `agents/openai.yaml` у теці навички для Codex:

   ```yaml
   policy:
     allow_implicit_invocation: false
   ```

4. Додайте навичку до списку вище. Спільні інструкції та ресурси тримайте в `.agents/skills/`; хуки й налаштування, специфічні для кожного рантайму, — у конфігураційній теці відповідного рантайму.

## Хуки {#hooks}

Разом із навичками агентів вище, [hooks][] запускаються автоматично при певних подіях інструменту. Конфігурація знаходиться в [`.claude/hooks/hooks.json`][hooks-json]; джерело хуків знаходиться в [`scripts/validate/`][validate].

- **Перевірка front matter блогу**: хук `PreToolUse` на `Write` та `Edit`, який блокує зміни в `content/en/blog/**/*.md`, коли front matter відсутні обовʼязкові поля, використовується неправильний формат дати або вводиться заголовок H1. Він застосовує ті ж конвенції, що й [`/review-blog-post`](#agent-skills) під час запису, без очікування на перевірку. Джерело: [`scripts/validate/front-matter-check/`][frontmatter-check]. Чиста логіка знаходиться в `index.mjs` і покрита тестами в `index.test.mjs` у тій же теці (`npm run test:local-tools` для запуску).

## Maintainer skills

Дивіться вміст розділу нижче.

[`.agents/skills/`]: https://github.com/open-telemetry/opentelemetry.io/tree/main/.agents/skills
[agentskills.io]: https://agentskills.io
[approve-registry-update]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/approve-registry-update/SKILL.md
[draft-issue]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/draft-issue/SKILL.md
[refresh-link-cache-pr-fix]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/refresh-link-cache-pr-fix/SKILL.md
[resolve-link-cache-conflicts]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/resolve-link-cache-conflicts/SKILL.md
[review-blog-post]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/review-blog-post/SKILL.md
[review-pull-request]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/review-pull-request/SKILL.md
[setup-new-localization]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/setup-new-localization/SKILL.md
[update-i18n-drift-status]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-i18n-drift-status/SKILL.md
[update-old-blog-ignores]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-old-blog-ignores/SKILL.md
[update-git-submodule]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.agents/skills/update-git-submodule/SKILL.md
[hooks]: https://docs.claude.com/en/docs/claude-code/hooks
[hooks-json]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/hooks/hooks.json
[validate]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate
[frontmatter-check]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate/front-matter-check
