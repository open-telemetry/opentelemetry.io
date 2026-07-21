---
title: Оновлення діапазонів ігнорування старих блогів
description: >-
  Як оновити рік для старих блогів, виключених з перевірок та виправлень сайту.
default_lang_commit: 311e7819e9eacf9d8b6d250bbdee98c018ea232e
cSpell:ignore: textlintignore
---

Старі пости в блозі є [історичними та не оновлюються][old-blogs], тому вони виключені з перевірок lint/format та скриптів виправлення. Раз на рік (або за потреби) оновлюйте діапазон років у конфігурації кожного інструменту, зазначеного нижче.

[old-blogs]: /docs/contributing/blog/#old-blogs-are-not-updated

## Конфігурація для оновлення {#configuration}

Кожен запис кодує ту саму політику: наразі ігноруються 2019 та `202[0-4]`. htmltest та витягування посилань пропускають 2020, оскільки в цьому році немає постів (інструменти на основі glob безпечно включають його). Налаштуйте ігнорування року glob/pattern за потреби для кожного інструменту:

| Інструмент                  | Конфігурація                                            |
| --------------------------- | ------------------------------------------------------- |
| cspell                      | `.cspell.yml` → `ignorePaths`                           |
| markdownlint                | `.markdownlint-cli2.yaml` → `ignores`                   |
| prettier                    | `.prettierignore`                                       |
| textlint                    | `.textlintignore` (note: requires `**` glob suffixes)   |
| `fix:dict`, trailing spaces | `package.json` → `__find:md:not-old-blog` script        |
| htmltest (link checker)     | `content/en/blog/_index.md` → `htmltest.IgnoreDirs`     |
| link extraction             | `scripts/_extract-external-links.js` (mirrors htmltest) |

## Перевірка {#verify}

Політика контролюється `scripts/old-blog-lint-ignores.test.mjs`, який створює порушення в старій та новій теках блогу і перевіряє, що кожен інструмент пропускає першу і позначає другу. Запустіть його за допомогою:

```sh
npm run test:local-tools
```

Якщо новий ігнорований рік все ще має борг lint, який інструменти тепер пропускають, це очікувано — старі пости залишаються без змін.
