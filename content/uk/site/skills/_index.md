---
title: Навички для агентів та підтримувачів
linkTitle: Навички
description: Навички для агентів та підтримувачів, які використовуються під час підтримки сайту.
weight: 22
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: agentskills
---

Цей розділ описує навички та процедури для агентів та підтримувачів, які використовуються під час підтримки сайту.

Ми використовуємо термін **agent skill** для позначення повторно використовуваних дій, написаних відповідно до [agentskills.io][], які можуть бути викликані агентами або виконані вручну підтримувачами. Ми називаємо **_maintainer_ skill** (або процедуру підтримувача) набір кроків, які агент або підтримувач можуть виконати для досягнення конкретного завдання. Навички агентів визначені в [`.claude/skills/`][]. Процедури підтримувачів визначені в цьому розділі.

## Agent skills

Як зазначено вище, навички визначені в [`.claude/skills/`][], вони включають:

- [`/approve-registry-update [номер-pr-або-url]`][approve-registry-update]: допомога рецензентам у прийнятті рішення щодо обʼєднання PR з оновленням версій реєстру від otelbot; перевірка, чи це чисте оновлення, і після підтвердження — затвердження та додавання до черги злиття. Без аргументу обробляє відкриті PR з автоматичним оновленням реєстру.
- [`/draft-issue <опис-проблеми>`][draft-issue]: створення тікета GitHub в репозиторії `opentelemetry.io` відповідно до шаблонів, керівництва з внеску та таксономії міток.
- [`/refresh-refcache-pr-fix`][refresh-refcache-pr-fix]: отримання, перегляд та спроба виправити URL-адреси, що не повертають 2XX, у PR від otelbot (зазвичай `otelbot/refcache-refresh`, або гілка інтеграції spec/semconv, якщо вказано).
- [`/resolve-refcache-conflicts <необовʼязковий-номер-pr>`][resolve-refcache-conflicts]: вирішення конфліктів злиття/перебазування `static/refcache.json`.
- [`/review-blog-post <шлях-до-блогу-або-номер-pr>`][review-blog-post]: перевірка блогу OpenTelemetry на відповідність front matter, конвенціям контенту, стабільності посилань GitHub (`gh-url-hash`), орфографії та термінології OTel.
- [`/review-pull-request <номер-pr-або-url>`][review-pull-request]: перевірка pull request на семантику перевірок CI, робочий процес CLA та міток затвердження, обробку refcache, правила локалізації та якість контенту.
- [`/update-i18n-drift-status [--locale locale,...] [--create-pr]`][update-i18n-drift-status]: оновлення поля front matter `drifted_from_default` для локалізованого контенту, з опціональними аргументами для обмеження обробки певних локалей та автоматичного відкриття PR.
- [`/update-old-blog-ignores`][update-old-blog-ignores]: розширити діапазон років старих публікацій у блозі, які не підлягають перевіркам на дотримання стилю та формату, а також виправити відповідні скрипти.
- [`/update-git-submodule <submodule>... <version|latest|HEAD>`][update-git-submodule]: оновлення одного або кількох підмодулів git до цільової версії.

Деякі чати агентів дозволяють викликати навичку, набравши `/`, а потім її назву.

## Hooks

Разом із навичками агентів вище, [hooks][] запускаються автоматично при певних подіях інструменту. Конфігурація знаходиться в [`.claude/hooks/hooks.json`][hooks-json]; джерело хуків знаходиться в [`scripts/validate/`][validate].

- **Перевірка front matter блогу**: хук `PreToolUse` на `Write` та `Edit`, який блокує зміни в `content/en/blog/**/*.md`, коли front matter відсутні обов'язкові поля, використовується неправильний формат дати або вводиться заголовок H1. Він застосовує ті ж конвенції, що й [`/review-blog-post`](#agent-skills) під час запису, без очікування на перевірку. Джерело: [`scripts/validate/front-matter-check/`][frontmatter-check]. Чиста логіка знаходиться в `index.mjs` і покрита тестами в `index.test.mjs` у тій же теці (`npm run test:local-tools` для запуску).

## Maintainer skills

Дивіться вміст розділу нижче.

[`.claude/skills/`]: https://github.com/open-telemetry/opentelemetry.io/tree/main/.claude/skills
[agentskills.io]: https://agentskills.io
[approve-registry-update]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/approve-registry-update/SKILL.md
[draft-issue]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/draft-issue/SKILL.md
[refresh-refcache-pr-fix]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/refresh-refcache-pr-fix/SKILL.md
[resolve-refcache-conflicts]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/resolve-refcache-conflicts/SKILL.md
[review-blog-post]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/review-blog-post/SKILL.md
[review-pull-request]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/review-pull-request/SKILL.md
[update-i18n-drift-status]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/update-i18n-drift-status/SKILL.md
[update-old-blog-ignores]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/update-old-blog-ignores/SKILL.md
[update-git-submodule]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/skills/update-git-submodule/SKILL.md
[hooks]: https://docs.claude.com/en/docs/claude-code/hooks
[hooks-json]: https://github.com/open-telemetry/opentelemetry.io/blob/main/.claude/hooks/hooks.json
[validate]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate
[frontmatter-check]: https://github.com/open-telemetry/opentelemetry.io/tree/main/scripts/validate/front-matter-check
